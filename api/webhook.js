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
            items.map(async (item) => {
            const doc = await db.collection("produtos").doc(item.reference_id).get()
            return {...item, imgURL: doc.data().imgURL};
            })
        )


        const mailOptions = {
        from: process.env.GMAIL_USER, 
        to: customer.email,
        subject: "Pedido confirmado! 🌸",
        html: `<ul>${itensComImagem.map(item => `
        <li>
            <img src="${item.imgURL}" width="100"></img>
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