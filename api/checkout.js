import admin from 'firebase-admin';

// Valida usuário, produtos, estoque, frete e cupom no servidor antes de criar o checkout no PagSeguro.

function getFirebaseAdmin() {
  if (admin.apps.length > 0) return admin.app();

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    })
  });
}

function calcularFrete(totalProdutos) {
  return totalProdutos >= 199 ? 0 : 10;
}

async function buscarCupom(db, codigoCupom, totalProdutos) {
  if (!codigoCupom) return null;

  const codigo = String(codigoCupom).trim().toUpperCase();
  const cupomDoc = await db.collection('cupons').doc(codigo).get();

  if (!cupomDoc.exists) {
    throw new Error('Cupom nao encontrado.');
  }

  const cupom = cupomDoc.data();
  const hoje = new Date().toISOString().slice(0, 10);

  if (!cupom.ativo) throw new Error('Cupom inativo.');
  if (cupom.expiraEm && cupom.expiraEm < hoje) throw new Error('Cupom expirado.');
  if (totalProdutos < Number(cupom.minimoPedido || 0)) {
    throw new Error('Pedido nao atingiu o valor minimo do cupom.');
  }
  if (Number(cupom.usosAtuais || 0) >= Number(cupom.usosMaximos || 1)) {
    throw new Error('Cupom atingiu o limite de usos.');
  }

  return {
    codigo,
    tipo: cupom.tipo,
    valor: Number(cupom.valor || 0),
  };
}

function validarItemCarrinho(item) {
  const quantidade = Number(item.quantidade);

  if (!item.id || !item.tamanho || !Number.isInteger(quantidade) || quantidade <= 0) {
    throw new Error('Item do carrinho invalido.');
  }

  return {
    id: item.id,
    tamanho: item.tamanho,
    quantidade
  };
}

async function montarPedidoSeguro(itensRecebidos, codigoCupom) {
  if (!Array.isArray(itensRecebidos) || itensRecebidos.length === 0) {
    throw new Error('Carrinho vazio.');
  }

  getFirebaseAdmin();
  const db = admin.firestore();

  const itensValidados = itensRecebidos.map(validarItemCarrinho);
  const itensCheckout = [];
  const itensPedido = [];
  let totalProdutos = 0;

  for (const item of itensValidados) {
    const produtoDoc = await db.collection('produtos').doc(item.id).get();

    if (!produtoDoc.exists) {
      throw new Error(`Produto nao encontrado: ${item.id}`);
    }

    const produto = produtoDoc.data();
    const estoqueDisponivel = Number(produto.estoque?.[item.tamanho] || 0);

    if (estoqueDisponivel < item.quantidade) {
      throw new Error(`Estoque insuficiente para ${produto.nome} tamanho ${item.tamanho}.`);
    }

    const preco = Number(produto.preco);
    if (!Number.isFinite(preco) || preco <= 0) {
      throw new Error(`Preco invalido para o produto ${item.id}.`);
    }

    totalProdutos += preco * item.quantidade;
    itensPedido.push({
      id: item.id,
      nome: produto.nome,
      preco,
      tamanho: item.tamanho,
      imgURL: produto.imgURL || '',
      categoria: produto.categoria || '',
      quantidade: item.quantidade,
    });

    itensCheckout.push({
      reference_id: item.id,
      name: `${produto.nome} - ${item.tamanho}`,
      quantity: item.quantidade,
      unit_amount: Math.round(preco * 100),
    });
  }

  const cupom = await buscarCupom(db, codigoCupom, totalProdutos);
  let frete = calcularFrete(totalProdutos);
  let desconto = 0;

  if (cupom?.tipo === 'percentual') {
    desconto = totalProdutos * (cupom.valor / 100);
  }

  if (cupom?.tipo === 'fixo') {
    desconto = cupom.valor;
  }

  if (cupom?.tipo === 'frete_gratis') {
    frete = 0;
  }

  desconto = Math.min(desconto, totalProdutos);

  if (desconto > 0) {
    const totalProdutosCentavos = Math.round(totalProdutos * 100);
    const totalComDescontoCentavos = Math.round((totalProdutos - desconto) * 100);
    let centavosDistribuidos = 0;

    itensCheckout.forEach((item, index) => {
      const originalLinhaCentavos = item.unit_amount * item.quantity;
      const ultimaLinha = index === itensCheckout.length - 1;
      const linhaComDescontoCentavos = ultimaLinha
        ? totalComDescontoCentavos - centavosDistribuidos
        : Math.round((originalLinhaCentavos / totalProdutosCentavos) * totalComDescontoCentavos);

      centavosDistribuidos += linhaComDescontoCentavos;
      item.name = `${item.name} (${item.quantity} un.)`;
      item.quantity = 1;
      item.unit_amount = Math.max(1, linhaComDescontoCentavos);
    });
  }

  if (frete > 0) {
    itensCheckout.push({
      reference_id: 'frete',
      name: 'Frete',
      quantity: 1,
      unit_amount: Math.round(frete * 100),
    });
  }

  return {
    itensCheckout,
    itensPedido,
    totalProdutos,
    cupom,
    desconto,
    frete,
    totalFinal: totalProdutos + frete - desconto,
  };
}

async function verificarUsuario(req) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);

  if (!match) {
    throw new Error('Usuario nao autenticado.');
  }

  getFirebaseAdmin();
  return admin.auth().verifyIdToken(match[1]);
}

export default async function handler(req, res) {
  // Configuração de CORS para permitir que o frontend acesse a API
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const token = process.env.PAGSEGURO_API_KEY;
      const { itens, pedidoId, cupom } = req.body;
      const usuario = await verificarUsuario(req);

      if (!pedidoId) {
        return res.status(400).json({ error: 'pedidoId obrigatorio.' });
      }

      if (!token) {
        return res.status(500).json({ error: 'PAGSEGURO_API_KEY nao configurada.' });
      }

      const pedidoSeguro = await montarPedidoSeguro(itens, cupom);
      const db = admin.firestore();
      const pedidoRef = db.collection('pedidos').doc(pedidoId);
      const pedidoDoc = await pedidoRef.get();

      if (!pedidoDoc.exists) {
        return res.status(404).json({ error: 'Pedido nao encontrado.' });
      }

      if (pedidoDoc.data().usuarioId !== usuario.uid) {
        return res.status(403).json({ error: 'Pedido nao pertence ao usuario autenticado.' });
      }

      await pedidoRef.update({
        usuarioId: usuario.uid,
        clienteNome: usuario.name || usuario.email || 'Cliente',
        itens: pedidoSeguro.itensPedido,
        subtotal: pedidoSeguro.totalProdutos,
        cupom: pedidoSeguro.cupom?.codigo || null,
        tipoCupom: pedidoSeguro.cupom?.tipo || null,
        desconto: pedidoSeguro.desconto,
        frete: pedidoSeguro.frete,
        total: pedidoSeguro.totalFinal,
        valorTotal: pedidoSeguro.totalFinal,
        status: 'pendente',
        dataCriacao: admin.firestore.FieldValue.serverTimestamp(),
        atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      });

      const resposta = await fetch("https://sandbox.api.pagseguro.com/checkouts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          notification_urls: ["https://liri-delirios.vercel.app/api/webhook"],
          redirect_url: `https://liri-delirios.vercel.app/sucesso.html?pedido=${pedidoId}`,
          reference_id: pedidoId,
          items: pedidoSeguro.itensCheckout
        })
      });

      const dados = await resposta.json();
      return res.status(200).json(dados);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Metodo nao permitido.' });
}
