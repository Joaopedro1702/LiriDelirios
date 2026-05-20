import admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        
        })
    });


}
    async function buscarCliente(uid){

        const db = admin.firestore();

        const clienteDoc = await db.collection('clientes').doc(uid).get();

        if(!clienteDoc.exists){
            throw new Error('Cliente não encontrado');
        }
        const cliente = clienteDoc.data();

        return cliente;
    }

    export default async function handler(req, res){
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Método não permitido' });
        }

        try{
        const {uid} = req.body;

        if(!uid){
            return res.status(400).json({ error: 'UID é obrigatório' });
        }

        const cliente = await buscarCliente(uid);

        if(!cliente.email){
            return res.status(400).json({error: "Cliente sem email"});
        }

        if(!cliente.nascimento){
            return res.status(400).json({error: "Cliente sem data de nascimento"});
        }

        if(!cliente.receberNewsletter){
            return res.status(200).json({
                ok: true,
                ignorado: true,
                motivo: "Cliente não aceitou receber newsletter"
            });
        }

        const clienteBrevo = {
            email: cliente.email,
            attributes:{
            NOME: cliente.nome,
            SOBRENOME: cliente.sobrenome,
            NASCIMENTO: cliente.nascimento
            },
            listIds: [Number(process.env.BREVO_LIST_ID)],
            updateEnabled: true
        }

        const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers:{
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clienteBrevo)
        });
        if(!response.ok){
            const errorData = await response.json();
            console.error('Erro ao adicionar contato no Brevo:', errorData);

            return res.status(response.status).json({
                error: 'Erro ao adicionar contato no Brevo',
                detalhes: errorData
            });
        }

        return res.status(200).json({
            ok: true,
            mensagem: 'Contato cadastrado ou atualizado na Brevo',
            contato: cliente.email
        });

        }catch(error){
            console.error('Erro inesperado:', error);
            return res.status(500).json({ error: 'Erro inesperado' });
        }
    }
