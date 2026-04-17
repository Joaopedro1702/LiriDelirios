import { collection, addDoc, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
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
        quantidade: produto.quantidade,
        preco: produto.preco,
        imgURL: imgURL,
        estoque: produto.estoque
    });
    return docRef.id;
}

export async function listarProdutos(){
    const produtosRef = collection(db, "produtos");
    const snapshot = await getDocs(produtosRef);

    const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
    return lista
}

export async function inativarProduto(id){
    const docRef = doc(db, "produtos", id);

    await updateDoc(docRef, {
        ativo: false
    });
}

export function monitorarEstoque(callback){
    const produtosRef = collection(db, "produtos");

    return onSnapshot(produtosRef, (snapshot)=>{
        const produtos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(produtos);
    });
}