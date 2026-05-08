    import { collection, query, where, getDocs } from "firebase/firestore";
    import { db } from "../admin/firebase.js";
    import { todosProdutos } from "../js/pagPrincipal.js";

async function buscarProdutos(produtoDigitado){
    const termo = produtoDigitado.toLowerCase();
    const snapshot = await getDocs(collection(db, "produtos"));
    
    const resultados = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => 
            p.nome.toLowerCase().includes(termo) ||
            p.categoria.toLowerCase().includes(termo)
        );

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
        </article>`;
        });
}

document.querySelectorAll('.buscar').forEach(botao => {
    botao.addEventListener('click', (event) => {  // ← aqui
        event.preventDefault();
        const produto = document.getElementById("busca").value;
        buscarProdutos(produto);
    });
})
