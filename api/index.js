const {onRequest} = require("firebase-functions/https");
const nodemailer = require("nodemailer");
const { createTransport } = require("nodemailer");

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
//Envio automatico de email consfirmando a compra, feito pelo própio pagseguro

exports.webhookPagSeguro = onRequest(async (req, res) => {
    const { charges, customer, items } = req.body;
    const charge = charges[0];

    if (charge.status === "PAID") {
        const transporter = nodemailer.createTransport({service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS}})
        
        const mailOptions = {
        from: process.env.GMAIL_USER, 
        to: customer.email,
        subject: "Pedido confirmado! 🌸",
        html: `<ul>${items.map(item => `
        <li>
            <strong>${item.name}</strong><br>
            Quantidade: ${item.quantity}<br>
            R$ ${(item.unit_amount / 100).toFixed(2)}
        </li>
            `).join("")}</ul>`
        }
        await transporter.sendMail(mailOptions);
        res.status(200).send("OK");
    }

});