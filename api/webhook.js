import nodemailer from 'nodemailer'
import admin from 'firebase-admin'

// Inicializa o Firebase Admin apenas quando a rota for chamada, evitando erro no import sem env local.
function getFirebaseAdmin() {
    // Reaproveita a instancia se a function ja estiver quente na Vercel.
    if (admin.apps.length > 0) return admin.app();

    // Cria a conexao Admin usando as variaveis secretas configuradas no deploy.
    return admin.initializeApp({credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    }) })
}

function getPagSeguroBaseUrl() {
    return process.env.PAGSEGURO_ENV === 'production'
        ? 'https://api.pagseguro.com'
        : 'https://sandbox.api.pagseguro.com';
}

async function consultarChargeNoPagSeguro(chargeId) {
    if (!process.env.PAGSEGURO_API_KEY) {
        throw new Error("PAGSEGURO_API_KEY nao configurada.");
    }

    if (!chargeId) {
        throw new Error("Charge ID nao informado.");
    }

    const resposta = await fetch(`${getPagSeguroBaseUrl()}/charges/${chargeId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${process.env.PAGSEGURO_API_KEY}`,
            "Content-Type": "application/json"
        }
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        throw new Error(dados?.message || "Nao foi possivel consultar a cobranca no PagSeguro.");
    }

    return dados;
}

//Envio automatico de email consfirmando a compra, feito pelo própio pagseguro

export default async function handler(req, res) {
    // Webhook deve aceitar apenas POST, que e o metodo usado pelo PagSeguro para notificacoes.
    if (req.method !== "POST") {
        return res.status(405).send("Metodo nao permitido");
    }

    // Token simples compartilhado entre checkout e webhook para bloquear chamadas falsas basicas.
    const tokenRecebido = req.query?.token || req.headers["x-webhook-secret"];
    // Se o token nao bater com o segredo da Vercel, a requisicao nao processa pagamento.
    if (!process.env.PAGSEGURO_WEBHOOK_SECRET || tokenRecebido !== process.env.PAGSEGURO_WEBHOOK_SECRET) {
        return res.status(401).send("Webhook nao autorizado");
    }

    // Le o corpo com valores padrao para evitar erro caso o PagSeguro envie payload incompleto.
    const { charges = [], customer = {}, items = [] } = req.body || {};
    // Pega a primeira cobranca do evento, que e onde vem status, pedido e identificador do pagamento.
    const charge = charges[0];

    // Sem charge nao ha pagamento para processar.
    if (!charge) {
        return res.status(400).send("Charge nao informada");
    }

    if (charge.status === "PAID") {
        const transporter = nodemailer.createTransport({service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS}})
        
        // Garante que o Firebase Admin esteja pronto antes de acessar o Firestore.
        getFirebaseAdmin();
        const db = admin.firestore();
        // O PagSeguro devolve o ID do pedido no reference_id configurado no checkout.
        const pedidoId = charge.reference_id;
        // Guarda um identificador da cobranca para reconhecer notificacoes repetidas.
        const chargeId = charge.id || charge.payment_response?.reference || charge.reference_id;

        // Sem ID do pedido nao da para saber qual documento atualizar.
        if (!pedidoId) {
            return res.status(400).send("Pedido nao informado");
        }

        const chargeConfirmada = await consultarChargeNoPagSeguro(chargeId);

        if (chargeConfirmada.status !== "PAID") {
            return res.status(200).send("Pagamento ainda nao confirmado no PagSeguro");
        }

        if (chargeConfirmada.reference_id && chargeConfirmada.reference_id !== pedidoId) {
            return res.status(400).send("Referencia do pagamento nao confere com o pedido");
        }

        // Referencia do pedido no Firestore, usada para ler e atualizar com consistencia.
        const pedidoRef = db.collection("pedidos").doc(pedidoId);
        // Carrega o pedido antes de mexer em estoque ou enviar email.
        const pedidoDoc = await pedidoRef.get();

        // Se o pedido nao existe, nao processa para evitar baixa de estoque indevida.
        if (!pedidoDoc.exists) {
            return res.status(404).send("Pedido nao encontrado");
        }

        // Dados atuais do pedido, incluindo itens, email e flags de processamento.
        const pedidoData = pedidoDoc.data();

        // Idempotencia: se ja processou esse pagamento, nao baixa estoque nem envia email de novo.
        if (pedidoData.pagseguroChargeId === chargeId || pedidoData.pagamentoProcessadoEm) {
            return res.status(200).send("Pedido ja processado");
        }

        const itensComImagem = await Promise.all(
            items.filter(item => item.reference_id !== "frete")
            .map(async(item) => {
                const doc = await db.collection("produtos").doc(item.reference_id).get();
                // Usa optional chaining para nao quebrar o email se algum produto tiver sido removido.
                return {...item, imgURL: doc.data()?.imgURL || ""};
            })
        )

        await Promise.all(
            // Garante que a lista exista antes de percorrer os itens.
            (pedidoData.itens || [])
            .filter(item => item.id)
            .map(async(item) => {
                const produtoRef = db.collection("produtos").doc(item.id);

                await db.runTransaction(async (transaction) => {
                    const produtoDoc = await transaction.get(produtoRef);
                    const estoqueAtual = produtoDoc.data().estoque || {};
                    const quantidadeAtual = Number(estoqueAtual[item.tamanho] || 0);
                    const novaQuantidade = quantidadeAtual - item.quantidade;

                    if (novaQuantidade < 0) {
                        throw new Error(`Estoque insuficiente para ${item.id} tamanho ${item.tamanho}.`);
                    }

                    transaction.update(produtoRef, {
                        [`estoque.${item.tamanho}`]: novaQuantidade
                    })
                })
            })
        )

        // Atualiza o pedido so depois da baixa de estoque terminar com sucesso.
        await pedidoRef.update({
            status: "confirmado",
            pagseguroChargeId: chargeId,
            pagamentoProcessadoEm: admin.firestore.FieldValue.serverTimestamp(),
            atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
        })

        const mailOptions = {
        from: process.env.GMAIL_USER, 
        // Usa email do PagSeguro; se nao vier, usa o email salvo no pedido.
        to: customer.email || pedidoData.email,
        subject: "Pedido confirmado! 🌸",
        html: `
                <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fff;">
                    <div style="background: #7B1A2E; padding: 32px; text-align: center;">
                        <h1 style="color: #fff; font-weight: 400; letter-spacing: 0.1em; margin: 0;">LIRI DE LÍRIOS</h1>
                        <p style="color: #f0d0d8; font-size: 13px; letter-spacing: 0.2em; margin: 8px 0 0;">✦ PEDIDO CONFIRMADO ✦</p>
                    </div>

                    <div style="padding: 32px;">
                        <p style="color: #4a4a4a; font-size: 15px;">Obrigada pela sua compra, ${customer.name || 'cliente'}! Seus itens:</p>

                        <ul style="list-style: none; padding: 0; margin: 24px 0;">
                            ${itensComImagem.map(item => `
                            <li style="display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid #f0e0e4;">
                                <img src="${item.imgURL}" width="70" height="70" style="object-fit: cover; border-radius: 4px;">
                                <div>
                                    <p style="margin: 0; font-size: 15px; color: #2a2a2a;">${item.name}</p>
                                    <p style="margin: 4px 0 0; font-size: 13px; color: #888;">Quantidade: ${item.quantity}</p>
                                    <p style="margin: 4px 0 0; font-size: 14px; color: #7B1A2E;">R$ ${(item.unit_amount / 100).toFixed(2)}</p>
                                </div>
                            </li>`).join("")}
                        </ul>
                    </div>

                    <div style="background: #f9f0f2; padding: 20px 32px; text-align: center;">
                        <p style="color: #7B1A2E; font-size: 12px; letter-spacing: 0.15em; margin: 0;">© 2025 LÍRI DE LÍRIOS — TODOS OS DIREITOS RESERVADOS</p>
                    </div>
                </div>
`}
        await transporter.sendMail(mailOptions);
        // Registra o envio do email apenas depois que o Nodemailer confirmar o envio.
        await pedidoRef.update({
            emailConfirmacaoEnviadoEm: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(200).send("OK");
        return;
        }

        // Eventos que nao sejam pagamento aprovado sao aceitos, mas nao alteram o pedido.
        res.status(200).send("Evento ignorado");
}
