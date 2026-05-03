import { collection, getDocs } from "firebase/firestore";
import { db } from "../admin/firebase.js";

    document.getElementById('ver-tudo').addEventListener('click', (e) => {
        e.preventDefault();
        verTodos();
    });

async function verTodos(){
    console.log("verTudo carregado");
    const snapshot = await getDocs(collection(db, "produtos"));
    const resultados = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

    document.querySelector('main').style.display = 'none';
    document.getElementById('resultados-busca').style.display = 'block';

    const grid = document.getElementById('grid-resultados');
    grid.innerHTML = "";
    resultados.forEach(p => {
        grid.innerHTML += `
        <article class="card-produto">
            <img src="${p.imgURL}" alt="${p.nome}">
            <div class="conteiner-informacao">
                <span class="descricao">${p.categoria}</span>
                <h3>${p.nome}</h3>
                <p class="preco">R$ ${p.preco}</p>
                <button class="btnadicionar">Adicionar ao Carrinho</button>
            </div>
        </article>
        `
    });
}