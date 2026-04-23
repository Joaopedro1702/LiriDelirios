import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../admin/firebase.js";
import { monitorarEstoque } from "../admin/produtos";
import { collection,query,doc, getDocs, limit, orderBy } from "firebase/firestore";

const iconePerfil = document.getElementById('icone-perfil');
const dropdown = document.getElementById('dropdown-perfil');

iconePerfil.addEventListener('click', () => {
  dropdown.classList.toggle('ativo');
});

onAuthStateChanged(auth, (usuario) => {
  if(usuario){
    dropdown.innerHTML = `
    <a href="#">MEU PERFIL<a>
    <a href="#" id="btn-sair">SAIR<a> 
    `;
    document.getElementById('btn-sair').addEventListener('click', async () => {
      await signOut(auth);
      window.location.href = '/login.html'
    });
  }else{
    dropdown.innerHTML = `
    <a href="/login.html">ENTRAR<a>
    <a href="/cadastro.html">CRIAR CONTA</a>
    `
  }
})

const icone = document.getElementById("icone-busca");
const barra = document.getElementById("barra-pesquisa");

icone.addEventListener("click", () => {
  barra.classList.toggle("ativa");
});

const btnEsquerda = document.querySelector(".anterior");
const btnDireita = document.querySelector(".proximo");
const carrossel = document.getElementById("vitrine-destaques");

//largura do card (280px) + Gap (24px)
const tamnhoDoPasso = 304;

btnDireita.addEventListener("click", () => {
  carrossel.scrollBy({
    left: tamnhoDoPasso,
    behavior: "smooth",
  });
});
btnEsquerda.addEventListener("click", () => {
  carrossel.scrollBy({
    left: -tamnhoDoPasso,
    behavior: "smooth",
  });
});

let listaProdutos = [];

const vitrineDesques = document.getElementById("vitrine-destaques");

monitorarEstoque((produtos) => {
listaProdutos = produtos;
vitrineDesques.innerHTML = produtos.map((p)=> `
<article class="card-produto" data-id="${p.id}">
        <img src="${p.imgURL}" alt="${p.nome}">
        <div class="conteiner-informacao">
          <span class="descricao">${p.categoria}</span>
          <h3>${p.nome}</h3>
          <button class="btnadicionar" data-id="${p.id}">Adicionar ao Carrinho</button>
        </div>
</article>
`).join('');
});

vitrineDesques.addEventListener("click", (e) => {
  if (e.target.classList.contains("btnadicionar")) {
    const btn = e.target;
    const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");

    const item = {
      id: btn.dataset.id,
      nome: btn.dataset.nome,
      preco: parseFloat(btn.dataset.preco),
      imgURL: btn.dataset.img,
      categoria: btn.dataset.categoria,
      quantidade: 1,
    };

    const existente = carrinho.find((i) => i.id === item.id);
    if (existente) {
      existente.quantidade += 1;
    } else {
      carrinho.push(item);
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    alert("Produto adicionado ao carrinho!");
  }

  else if(e.target.closest(".card-produto")){
    const card =  e.target.closest(".card-produto");
    const id = card.dataset.id;
    const produto = listaProdutos.find(p => p.id === id);

    if(produto){
        abrirModal(produto);
    }
  }
});

function abrirModal(produto) {
  const modal = document.querySelector(".modal-overlay");
  const conteudo = document.getElementById("detlahes-produtos");

  conteudo.innerHTML = `
<h2>${produto.nome}</h2>
    <img src="${produto.imgURL}" style="max-width: 300px;">
    <p>${produto.descricao}</p>
    <p><strong>Preço:</strong> R$ ${parseFloat(produto.preco).toFixed(2)}</p>
    <button id="btn-fechar">Fechar</button> 

    `;
    modal.classList.add('active');

    //adicionando evento para fecha modal
    document.getElementById("btn-fechar").addEventListener("click", () => {
        modal.classList.remove('active');
    })
}

/**/
async function carregarMaisVendidos(){
  const q = query(
    collection(db, "produtos"),
    orderBy("totalVendido", "desc"),
    limit(4)
  );

  const snapshot = await getDocs(q);
  const grid = document.getElementById("vitrine-maisvendidos")

  snapshot.forEach((doc) => {
    const p = doc.data();
    grid.innerHTML +=`
    <article class="card-produto">
        <img src="${p.imagem}" alt="${p.nome}">
        <div class="conteiner-informacao">
          <span class="descricao">${p.categoria}</span>
          <h3>${p.nome}</h3>
          <p class="preco">R$ ${p.preco}</p>
          <button class="btnadicionar">Adicionar ao Carrinho</button>
        </div>
      `;
  });
  
}

import { where } from "firebase/firestore";

const q = query(
  collection(db, "produtos"),
  where("destaque", "==", true)
);

carregarMaisVendidos();
