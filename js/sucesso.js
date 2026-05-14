import { auth, db } from "./admin/firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

//pegar pedido da URL

const params = new URLSearchParams(window.location.search);
const pedidoId = params.get("pedido");

if (!pedidoId){
    window.location.href = "/index.html"
}

async function verificarStatusPedido(){
const docRef = doc(db, "pedidos", pedidoId);
const snapshot = await getDoc(docRef);
const pedido = snapshot.data();

if(pedido.status === "confirmado"){
    localStorage.removeItem("carrinho");
}else if (pedido.status === "pendente"){
    document.querySelector(".sucesso-titulo").textContent = "Pagamento em processamento...";
    document.querySelector(".sucesso-subtitulo").textContent = "Assim que confirmado você receberá um e-mail.";
}else if (pedido.status === "cancelado"){
    document.querySelector(".sucesso-titulo").textContent = "Pagamento não aprovado";
    document.querySelector(".sucesso-subtitulo").textContent = "Tente novamente.";    
    }
}

verificarStatusPedido();