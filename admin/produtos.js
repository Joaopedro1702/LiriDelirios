import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { db } from "./firebase.js";
// 1. Trazendo as ferramentas de salvar dados do Firebase
async function uploadImage(arquivo) {
    const apiKey = import.meta.env.VITE_KEY_IMAGE;

    const formData = new FormData();
    formData.append("image", arquivo);

const resposta = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData
    });
    const dados = await resposta.json();
    return dados.data.url;
}

/*FUnção cadastrar*/ 
export async function cadastrarProduto(produto){
    const produtosRef = collection(db, "produtos");
    const imgURL = await uploadImage(produto.imagem)
    const docRef = await addDoc(produtosRef, {
        categoria: produto.categoria,
        nome: produto.nome,
        descricao: produto.descricao,
        destaque: produto.destaque,
        preco: produto.preco,
        imgURL: imgURL,
        estoque: produto.estoque
    });
    return docRef.id;
}