import"./modulepreload-polyfill.js";/* empty css     *//* empty css           */import{c as e,d as t,g as n,n as r,o as i,t as a,y as o}from"./firebase.js";import{r as s}from"./produtos.js";var c=document.getElementById(`icone-perfil`),l=document.getElementById(`dropdown-perfil`);c.addEventListener(`click`,()=>{l.classList.toggle(`ativo`)}),n(a,e=>{e?(l.innerHTML=`
    <a href="#">MEU PERFIL<a>
    <a href="#" id="btn-sair">SAIR<a>
    <a href="/minha-conta.html">MINHA CONTA</a>

    `,document.getElementById(`btn-sair`).addEventListener(`click`,async()=>{await o(a),window.location.href=`/login.html`})):l.innerHTML=`
    <a href="/login.html">ENTRAR<a>
    <a href="/cadastro.html">CRIAR CONTA</a>
    `});var u=document.getElementById(`icone-busca`),d=document.getElementById(`barra-pesquisa`);u.addEventListener(`click`,()=>{d.classList.toggle(`ativa`)});var f=document.querySelector(`.anterior`),p=document.querySelector(`.proximo`),m=document.getElementById(`vitrine-destaques`),h=304;p&&p.addEventListener(`click`,()=>{m.scrollBy({left:h,behavior:`smooth`})}),f&&f.addEventListener(`click`,()=>{m.scrollBy({left:-h,behavior:`smooth`})});var g=[],_=document.getElementById(`vitrine-destaques`);_&&(s(e=>{g=e,_.innerHTML=e.map(e=>`
<article class="card-produto" data-id="${e.id}">
        <img src="${e.imgURL}" alt="${e.nome}">
        <div class="conteiner-informacao">
          <span class="descricao">${e.categoria}</span>
          <h3>${e.nome}</h3>
            <button class="btnadicionar" 
                data-id="${e.id}"
                data-nome="${e.nome}"
                data-preco="${e.preco}"
                data-img="${e.imgURL}"
                data-categoria="${e.categoria}">
                Adicionar ao Carrinho
            </button>
        </div>
</article>
`).join(``)}),_.addEventListener(`click`,e=>{if(e.target.classList.contains(`btnadicionar`)){let t=e.target,n=JSON.parse(localStorage.getItem(`carrinho`)||`[]`),r={id:t.dataset.id,nome:t.dataset.nome,preco:parseFloat(t.dataset.preco),imgURL:t.dataset.img,categoria:t.dataset.categoria,quantidade:1},i=n.find(e=>e.id===r.id);i?i.quantidade+=1:n.push(r),localStorage.setItem(`carrinho`,JSON.stringify(n)),alert(`Produto adicionado ao carrinho!`)}else if(e.target.closest(`.card-produto`)){let t=e.target.closest(`.card-produto`).dataset.id,n=g.find(e=>e.id===t);n&&v(n)}}));function v(e){let t=e.estoque,n=Object.entries(t).map(([e,t])=>`
        <button class="btn-tamanho ${t===0?`esgotado`:``}" 
            data-tamanho="${e}" 
            ${t===0?`disabled`:``}>
            ${e}
        </button>          
          `).join(``),r=document.querySelector(`.modal-overlay`),i=document.getElementById(`detlahes-produtos`);i.innerHTML=`
<h2>${e.nome}</h2>
    <img src="${e.imgURL}" style="max-width: 300px;">
    <p>${e.descricao}</p>
    <p><strong>Preço:</strong> R$ ${parseFloat(e.preco).toFixed(2)}</p>
    <div class="seletor-tamanho">${n}</div>
      <div id="msg-erro" style="display:none; color:red; font-size:13px; margin-top:8px;">
        Selecione um tamanho antes de adicionar ao carrinho.
      </div>
      <button id="btn-adicionar-carrinho">Adicionar ao Carrinho</button>
    <button id="btn-fechar">Fechar</button> 

    `,r.classList.add(`active`),document.getElementById(`btn-fechar`).addEventListener(`click`,()=>{r.classList.remove(`active`)});let a=null,o=document.querySelectorAll(`.btn-tamanho`);o.forEach(e=>{e.addEventListener(`click`,t=>{o.forEach(e=>e.classList.remove(`selecionado`)),e.classList.add(`selecionado`),a=e.dataset.tamanho})}),document.getElementById(`btn-adicionar-carrinho`).addEventListener(`click`,t=>{if(a===null)document.getElementById(`msg-erro`).style.display=`block`;else{let t={nome:e.nome,preco:parseFloat(e.preco),tamanho:a,imgURL:e.img,categoria:e.categoria,quantidade:1},n=JSON.parse(localStorage.getItem(`carrinho`)||`[]`);n.push(t),localStorage.setItem(`carrinho`,JSON.stringify(n)),r.classList.remove(`active`)}})}async function y(){(await i(e(t(r,`produtos`)))).forEach(e=>{S.push({id:e.id,...e.data()})}),C()}var b=1,x=12,S=[];function C(){let e=document.getElementById(`vitrine-nossos`),t=(b-1)*x,n=b*x,r=S.slice(t,n);if(!e)return;e.innerHTML=``,r.forEach(t=>{e.innerHTML+=`
<article class="card-produto" data-id="${t.id}">
    <img src="${t.imgURL}" alt="${t.nome}">
    <div class="conteiner-informacao">
      <span class="descricao">${t.categoria}</span>
      <h3>${t.nome}</h3>
      <p class="preco">R$ ${t.preco}</p>
      <button class="btnadicionar" 
          data-id="${t.id}"
          data-nome="${t.nome}"
          data-preco="${t.preco}"
          data-img="${t.imgURL}"
          data-categoria="${t.categoria}">
          Adicionar ao Carrinho
      </button>
    </div>
</article>
      `});let i=document.getElementById(`vitrine-nossos`);i&&i.addEventListener(`click`,e=>{if(e.target.classList.contains(`btnadicionar`)){let t=e.target,n=JSON.parse(localStorage.getItem(`carrinho`)||`[]`),r={id:t.dataset.id,nome:t.dataset.nome,preco:parseFloat(t.dataset.preco),imgURL:t.dataset.img,categoria:t.dataset.categoria,quantidade:1},i=n.find(e=>e.id===r.id);i?i.quantidade+=1:n.push(r),localStorage.setItem(`carrinho`,JSON.stringify(n)),alert(`produto adicionado ao carrinho!`)}else if(e.target.closest(`.card-produto`)){let t=e.target.closest(`.card-produto`).dataset.id,n=S.find(e=>e.id===t);console.log(`id:`,t,`produto:`,n,`todos:`,S),n&&v(n)}})}y();async function w(e){let n=e.toLowerCase(),a=(await i(t(r,`produtos`))).docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.nome.toLowerCase().includes(n)||e.categoria.toLowerCase().includes(n));document.querySelector(`main`).style.display=`none`,document.getElementById(`resultados-busca`).style.display=`block`;let o=document.getElementById(`grid-resultados`);o.innerHTML=``,a.forEach(e=>{o.innerHTML+=`
        <article class="card-produto">
            <img src="${e.imgURL}" alt="${e.nome}">
            <div class="conteiner-informacao">
                <span class="descricao">${e.categoria}</span>
                <h3>${e.nome}</h3>
                <p class="preco">R$ ${e.preco}</p>
                <button class="btnadicionar">Adicionar ao Carrinho</button>
            </div>
        </article>`})}document.querySelectorAll(`.buscar`).forEach(e=>{e.addEventListener(`click`,e=>{e.preventDefault();let t=document.getElementById(`busca`).value;w(t)})}),document.getElementById(`ver-tudo`).addEventListener(`click`,e=>{e.preventDefault(),T()});async function T(){console.log(`verTudo carregado`);let e=(await i(t(r,`produtos`))).docs.map(e=>({id:e.id,...e.data()}));document.querySelector(`main`).style.display=`none`,document.getElementById(`resultados-busca`).style.display=`block`;let n=document.getElementById(`grid-resultados`);n.innerHTML=``,e.forEach(e=>{n.innerHTML+=`
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