import nodemailer from 'nodemailer'
import admin from 'firebase-admin'

const app = admin.initializeApp({credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
}) })

//Envio automatico de email consfirmando a compra, feito pelo própio pagseguro

export default async function handler(req, res) {
    const { charges, customer, items } = req.body;
    const charge = charges[0];

    if (charge.status === "PAID") {
        const transporter = nodemailer.createTransport({service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS}})
        
        const db = admin.firestore();

        const itensComImagem = await Promise.all(
            items.filter(item => item.reference_id !== "frete")
            .map(async(item) => {
                const doc = await db.collection("produtos").doc(item.reference_id).get();
                return {...item, imgURL: doc.data().imgURL};
            })
        )

        const pedidoId = charge.reference_id;

        await db.collection("pedidos").doc(pedidoId).update({
            status: "confirmado"
        })

        const pedidoDoc = await db.collection("pedidos").doc(pedidoId).get();
        const pedidoData = pedidoDoc.data();
        console.log("pedidoData.itens:", JSON.stringify(pedidoData.itens)); // <- aqui

        await Promise.all(
            pedidoData.itens
            .filter(item => item.id)
            .map(async(item) => {
                const produtoRef = db.collection("produtos").doc(item.id);
                const produtoDoc = await produtoRef.get();
                const estoqueAtual = produtoDoc.data().estoque;

                const novaQuantidade = estoqueAtual[item.tamanho] - item.quantidade;

                await produtoRef.update({
                    [`estoque.${item.tamanho}`]: novaQuantidade
                })
            })
        )

        const mailOptions = {
        from: process.env.GMAIL_USER, 
        to: customer.email,
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
        res.status(200).send("OK");
        }
        
}