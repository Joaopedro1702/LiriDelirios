export default async function handler(req, res) {
  // Configuração de CORS para permitir que seu frontend acesse a API
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const token = process.env.PAGSEGURO_API_KEY;
      const { itens } = req.body;

      const resposta = await fetch("https://sandbox.api.pagseguro.com/checkouts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reference_id: "pedido-liri",
          items: itens.map(item => ({
            reference_id: item.id,
            name: item.nome,
            quantity: item.quantidade,
            unit_amount: Math.round(item.preco * 100)
          }))
        })
      });

      const dados = await resposta.json();
      return res.status(200).json(dados);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}