const {onRequest} = require("firebase-functions/https");

require("dotenv").config();

exports.criarCheckout = onRequest(async(req,res) =>{
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS"){
        res.set("Access-Control-Allow-Headers", "Content-Type");
        return res.status(204).send("");
    }

    const token = process.env.PAGSEGURO_API_KEY;
    const {itens, total} = req.body;

    const resposta = await fetch("https://sandbox.api.pagseguro.com/checkouts",{
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            reference_id: "pedido_url",
            items: itens.map(item => ({
                reference_id: item.id,
                name: item.nome,
                quantity: item.quantidade,
                unit_amount: Math.round(item.preco * 100)
            }))
        })
    });
    const dados = await resposta.json();
    res.json(dados); 
}); 