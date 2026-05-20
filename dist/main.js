import{f as e,n as t,o as n}from"./firebase.js";/* empty css     *//* empty css           */import"./pesquisa.js";document.getElementById(`ver-tudo`).addEventListener(`click`,e=>{e.preventDefault(),r()});async function r(){console.log(`verTudo carregado`);let r=(await n(e(t,`produtos`))).docs.map(e=>({id:e.id,...e.data()}));document.querySelector(`main`).style.display=`none`,document.getElementById(`resultados-busca`).style.display=`block`;let i=document.getElementById(`grid-resultados`);i.innerHTML=``,r.forEach(e=>{i.innerHTML+=`
        <article class="card-produto">
            <img src="${e.imgURL}" alt="${e.nome}">
            <div class="conteiner-informacao">
                <span class="descricao">${e.categoria}</span>
                <h3>${e.nome}</h3>
                <p class="preco">R$ ${e.preco}</p>
                <button class="btnadicionar">Adicionar ao Carrinho</button>
            </div>
        </article>
        `})}