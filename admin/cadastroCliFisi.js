import { db } from "./firebase.js";
import { collection, addDoc} from "firebase/firestore";

const BOT_BACKEND_URL = window.BOT_BACKEND_URL || import.meta.env.VITE_BOT_URL || 'http://localhost:3000';
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

// ───────────────────────────── MODAL DE QR CODE ─────────────────────────────

const modalWpp = document.getElementById('modal-wpp-pareamento');
const qrImagem = document.getElementById('wpp-qr-image');
const btnFecharModal = document.getElementById('btn-fechar-modal-wpp');

let qrInterval = null;

function abrirModalQR() {
    if (!modalWpp) return;
    modalWpp.classList.add('mostrar');
    buscarQR(); // busca imediato, não espera os 3s do intervalo
    qrInterval = setInterval(buscarQR, 3000);
}

function fecharModalQR() {
    if (!modalWpp) return;
    modalWpp.classList.remove('mostrar');
    if (qrInterval) {
        clearInterval(qrInterval);
        qrInterval = null;
    }
}

async function buscarQR() {
    try {
        const resposta = await fetch(`${BOT_BACKEND_URL}/qrcode`);
        if (!resposta.ok) return;
        const data = await resposta.json();

        if (data.connected) {
            fecharModalQR();
            checarStatusBot(); // atualiza o badge 🟢/🔴 na hora
            return;
        }

        if (data.qr && qrImagem) {
            qrImagem.src = data.qr;
        }
    } catch (error) {
        console.error('Erro ao buscar QR code:', error);
    }
}

btnFecharModal?.addEventListener('click', fecharModalQR);
window.addEventListener('click', (event) => {
    if (event.target === modalWpp) {
        fecharModalQR();
    }
});

document.getElementById("btn-conectar-wpp").addEventListener("click", () => {
    abrirModalQR();
});

// ───────────────────────────── CADASTRO DE CLIENTE ─────────────────────────────

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