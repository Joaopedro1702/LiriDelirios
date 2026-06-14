import { db } from "./firebase.js";
import { collection, addDoc} from "firebase/firestore";

const BOT_BACKEND_URL = import.meta.env.VITE_BOT_URL || 'http://localhost:3000';
// O Vite pega o valor do arquivo .env automaticamente e substitui aqui durante o processo.
const API_KEY_BOT = import.meta.env.VITE_API_KEY_BOT || 'LiriBot@2025_Secreta!'; 

async function checarStatusBot() {
    try {
        const resposta = await fetch(`${BOT_BACKEND_URL}/status`);
        if (!resposta.ok) return;
        const data = await resposta.json();
        
        let statusDiv = document.getElementById('wpp-status-badge');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'wpp-status-badge';
            statusDiv.style.marginTop = '10px';
            statusDiv.style.fontWeight = 'bold';
            
            const btnConectar = document.getElementById('btn-conectar-wpp');
            if (btnConectar) {
                btnConectar.parentNode.insertBefore(statusDiv, btnConectar.nextSibling);
            }
        }
        
        if (data.ready) {
            statusDiv.innerHTML = `🟢 Bot Conectado (${data.authenticatedNumber || 'Sem número'})`;
            statusDiv.style.color = '#155724';
        } else {
            statusDiv.innerHTML = `🔴 Bot Desconectado`;
            statusDiv.style.color = '#721c24';
        }
    } catch (error) {}
}
checarStatusBot();
setInterval(checarStatusBot, 10000);

const modalWpp = document.getElementById('modal-wpp-pareamento');
const codigoDisplay = document.getElementById('wpp-codigo-display');
const btnFecharModal = document.getElementById('btn-fechar-modal-wpp');

function abrirModalCodigo(codigo) {
    if (!modalWpp || !codigoDisplay) return;
    codigoDisplay.textContent = codigo || 'Erro ao gerar o código';
    modalWpp.classList.add('mostrar');
}

function fecharModalCodigo() {
    if (!modalWpp) return;
    modalWpp.classList.remove('mostrar');
}

btnFecharModal?.addEventListener('click', fecharModalCodigo);
window.addEventListener('click', (event) => {
    if (event.target === modalWpp) {
        fecharModalCodigo();
    }
});

document.getElementById("btn-conectar-wpp").addEventListener("click", async () => {
    const numeroWpp = document.getElementById("numero-wpp").value.trim();

    if (!numeroWpp) {
        alert("Informe o número do WhatsApp antes de conectar.");
        return;
    }

    try {
        const resposta = await fetch(`${BOT_BACKEND_URL}/vincular-telefone`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY_BOT
            },
            body: JSON.stringify({ telefone: numeroWpp })
        });

        const textoResposta = await resposta.text();
        let dadosBot;
        try {
            dadosBot = textoResposta ? JSON.parse(textoResposta) : {};
        } catch (parseError) {
            console.error('Não foi possível parsear JSON do backend:', parseError, textoResposta);
            dadosBot = { raw: textoResposta };
        }

        console.log('Resposta do bot:', resposta.status, dadosBot);

        if (!resposta.ok) {
            console.error('Erro no bot: ', dadosBot);
            alert('Não foi possível conectar o dispositivo. Verifique o número e tente novamente.');
            return;
        }

        if (dadosBot && dadosBot.pairingCode) {
            abrirModalCodigo(dadosBot.pairingCode);
        } else {
            alert('Conexão iniciada, mas não recebi o código de pareamento. Verifique o backend e tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao conectar dispositivo no bot:', error);
        alert('Ocorreu um erro ao conectar o dispositivo. Verifique se o backend está rodando e tente novamente.');
    }
});

document.getElementById("form-cadastro-fisico").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome-cliente-fisico").value.trim();
    const telefone = document.getElementById("tel-cliente-fisico").value;
    const diaNascimento = document.getElementById("dia-cliente-fisico").value;
    const mesNascimento = document.getElementById("mes-cliente-fisico").value;

    const clienteFisico = {
        nome: nome,
        telefone: telefone,
        diaNascimento: diaNascimento,
        mesNascimento: mesNascimento,
        tipo: "fisico",
        cadastradoEm: new Date().toISOString(),

    }

    try{
        //APonta para a coleção desejada dentro do banco
        const docRef = await collection(db, "cliente_loja_fisi");

        //Cria o documento e gera um novo ID
        const docCriado = await addDoc(docRef, clienteFisico);

        console.log(`Cliente fisico cadastrado com ID: ${docCriado.id}`);
        //Reseta todos os campos do formulário após o cadastro.
        document.getElementById("form-cadastro-fisico").reset();
    } catch (error) {
        console.error("Erro ao cadastrar cliente fisico no Firestore:", error);
        alert("Ocorreu um erro ao cadastrar o cliente. Por favor, tente novamente.");
    }
})