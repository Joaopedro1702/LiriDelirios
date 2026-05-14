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
    <a href="/minha-conta.html">MINHA CONTA</a>

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

const tamnhoDoPasso = 304;

if (btnDireita) {
  btnDireita.addEventListener("click", () => {
    carrossel.scrollBy({ left: tamnhoDoPasso, behavior: "smooth" });
  });
}
if (btnEsquerda) {
  btnEsquerda.addEventListener("click", () => {
    carrossel.scrollBy({ left: -tamnhoDoPasso, behavior: "smooth" });
  });
}

//largura do card (280px) + Gap (24px)

let listaProdutos = [];

const vitrineDesques = document.getElementById("vitrine-destaques");

if(vitrineDesques){
monitorarEstoque((produtos) => {
listaProdutos = produtos;
vitrineDesques.innerHTML = produtos.map((p)=> `
<article class="card-produto" data-id="${p.id}">
        <img src="${p.imgURL}" alt="${p.nome}">
        <div class="conteiner-informacao">
          <span class="descricao">${p.categoria}</span>
          <h3>${p.nome}</h3>
            <button class="btn-ver-detalhes" data-id="${p.id}">Ver detalhes</button>
        </div>
</article>
`).join('');
});

vitrineDesques.addEventListener("click", (e) => {
  if(e.target.classList.contains("btn-ver-detalhes")){
    const id = e.target.dataset.id;
    const produto = listaProdutos.find(p => p.id === id);
    if(produto){
        abrirModal(produto);
    }
}
});
}

function abrirModal(produto) {

      const tamanhos = produto.estoque;
    const botoeshtml = Object.entries(tamanhos)
          .map(([tam,qtd]) => `
        <button class="btn-tamanho ${qtd === 0 ? 'esgotado' : ''}" 
            data-tamanho="${tam}" 
            ${qtd === 0 ? 'disabled' : ''}>
            ${tam}
        </button>          
          `).join('');

  const modal = document.querySelector(".modal-overlay");
  const conteudo = document.getElementById("detlahes-produtos");

  conteudo.innerHTML = `
<h2>${produto.nome}</h2>
    <img src="${produto.imgURL}" style="max-width: 300px;">
    <p>${produto.descricao}</p>
    <p><strong>Preço:</strong> R$ ${parseFloat(produto.preco).toFixed(2)}</p>
    <div class="seletor-tamanho">${botoeshtml}</div>
      <div id="msg-erro" style="display:none; color:red; font-size:13px; margin-top:8px;">
        Selecione um tamanho antes de adicionar ao carrinho.
      </div>
      <button id="btn-adicionar-carrinho">Adicionar ao Carrinho</button>
    <button id="btn-fechar">X</button> 

    `;
    modal.classList.add('active');

    //adicionando evento para fecha modal
    document.getElementById("btn-fechar").addEventListener("click", () => {
        modal.classList.remove('active');
    });

  /*LOgica botao modal*/
  let tamSelecionado = null;
  const btnTamanho = document.querySelectorAll(".btn-tamanho");
    btnTamanho.forEach(btn => {
      btn.addEventListener("click", selecionado => {
        btnTamanho.forEach(b => b.classList.remove("selecionado"));
        btn.classList.add("selecionado")
        tamSelecionado = btn.dataset.tamanho
      });
    });
    const btnadicionar = document.getElementById("btn-adicionar-carrinho");
    btnadicionar.addEventListener("click", p =>{
      if(tamSelecionado === null){
        document.getElementById("msg-erro").style.display ="block";
      }else{
          const item = {
          id: produto.id,
          nome: produto.nome,
          preco: parseFloat(produto.preco),
          tamanho: tamSelecionado,
          imgURL: produto.imgURL,
          categoria: produto.categoria,
          quantidade: 1,
    };
        const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]")
        carrinho.push(item)
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        modal.classList.remove('active')
      }
    });
  }
  
/*Buscando produtos*/
async function carregarNossosProdutos(){
  const q = query(collection(db, "produtos"));
  const snapshot = await getDocs(q);

  snapshot.forEach((doc) => {
    todosProdutos.push({id: doc.id, ...doc.data()});
  });

  renderizarPagina();
  
}

let paginaAtual = 1;
const produtosPorPagina = 12;
export let todosProdutos = [];

function renderizarPagina(){
  const grid = document.getElementById("vitrine-nossos");
  const inicio = (paginaAtual-1) * produtosPorPagina;
  const fim = paginaAtual * produtosPorPagina;
  const fatia = todosProdutos.slice(inicio,fim);

  if (!grid) return;

  grid.innerHTML = "";
  fatia.forEach((p) =>{
    grid.innerHTML += 
    `
<article class="card-produto" data-id="${p.id}">
    <img src="${p.imgURL}" alt="${p.nome}">
    <div class="conteiner-informacao">
      <span class="descricao">${p.categoria}</span>
      <h3>${p.nome}</h3>
      <p class="preco">R$ ${p.preco}</p>
<button class="btn-ver-detalhes" data-id="${p.id}">Ver detalhes</button>
    </div>
</article>
      `;
  });

  const gridGeral = document.getElementById("vitrine-nossos");
  if(gridGeral){
    gridGeral.addEventListener("click", (e) => {
      if(e.target.classList.contains("btn-ver-detalhes")){
        const btn = e.target;
        const id = btn.dataset.id;

        const produtos = todosProdutos.find(p => p.id === id);
        console.log("id:", id, "produto:", produtos, "todos:", todosProdutos);

        if(produtos){
          abrirModal(produtos);
        }
      }

    });
  }

}

carregarNossosProdutos();
