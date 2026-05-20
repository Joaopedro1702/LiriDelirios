import { db } from "../admin/firebase.js";
import { doc, onSnapshot } from "firebase/firestore";

//pegar pedido da URL

const params = new URLSearchParams(window.location.search);
const pedidoId = params.get("pedido");

if (!pedidoId){
    window.location.href = "/index.html"
}

function atualizarTela(status) {
    const titulo = document.querySelector(".sucesso-titulo");
    const subtitulo = document.querySelector(".sucesso-subtitulo");
    const mensagem = document.querySelector(".sucesso-mensagem");

    if(status === "confirmado"){
        localStorage.removeItem("carrinho");
        titulo.textContent = "Pedido confirmado";
        subtitulo.textContent = "Obrigada pela sua compra";
        mensagem.textContent = "Seu pagamento foi aprovado. Em breve você receberá um e-mail com a confirmação e os detalhes da sua compra.";
    }else if (status === "pendente"){
        titulo.textContent = "Pagamento em processamento...";
        subtitulo.textContent = "Assim que confirmado você receberá um e-mail.";
        mensagem.textContent = "Seu pedido foi recebido e estamos aguardando a confirmação do pagamento.";
    }else if (status === "cancelado"){
        titulo.textContent = "Pagamento não aprovado";
        subtitulo.textContent = "Tente novamente.";
        mensagem.textContent = "Não conseguimos confirmar o pagamento deste pedido. Você pode voltar para a loja e tentar finalizar novamente.";
    }else{
        titulo.textContent = "Acompanhando pedido...";
        subtitulo.textContent = "Estamos verificando o status do pagamento.";
        mensagem.textContent = "A atualização pode levar alguns instantes após o retorno do pagamento.";
    }
}

function monitorarStatusPedido(){
    const docRef = doc(db, "pedidos", pedidoId);

    onSnapshot(docRef, (snapshot) => {
        if (!snapshot.exists()) {
            window.location.href = "/index.html";
            return;
        }

        const pedido = snapshot.data();
        atualizarTela(pedido.status);
    }, (erro) => {
        console.error("Erro ao monitorar pedido:", erro);
        atualizarTela("pendente");
    });
}

monitorarStatusPedido();
