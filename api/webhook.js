import nodemailer from 'nodemailer'
//Envio automatico de email consfirmando a compra, feito pelo própio pagseguro

export default async function handler(req, res) {
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

}