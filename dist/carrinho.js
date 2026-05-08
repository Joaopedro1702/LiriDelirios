import"./modulepreload-polyfill.js";/* empty css           */function e(){let e=document.getElementById(`itens-carrinho`),t=JSON.parse(localStorage.getItem(`carrinho`)||`[]`);e.innerHTML=t.map(e=>{let t=e.preco*e.quantidade;return`
        <div class="carrinho-item">
            <div class="item-produto">
                <img src="${e.imgURL}" class="item-img">
                <div class="item-info">
                    <p class="item-info__categoria">${e.categoria}</p>
                    <p class="item-info__nome">${e.nome}</p>
                </div>
            </div>
            <span class="item-preco">R$ ${parseFloat(e.preco).toFixed(2)}</span>
            <div class="quantidade">
                <button class="quantidade__btn btn-menos" data-id="${e.id}">−</button>
                <input class="quantidade__valor" type="text" value="${e.quantidade}" readonly/>
                <button class="quantidade__btn btn-mais" data-id="${e.id}">+</button>
            </div>
            <span class="item-subtotal">R$ ${t.toFixed(2)}</span>
            <button class="item-remover" data-id="${e.id}">Remover</button>
        </div>`}).join(``);let n=10,r=t.reduce((e,t)=>e+t.preco*t.quantidade,0);r>=199&&(n=0);let i=n+r;document.querySelector(`.resumo__total-valor`).textContent=`R$ ${i.toFixed(2)}`,document.querySelector(`.resumo__valor`).textContent=`R$ ${r.toFixed(2)}`,document.querySelector(`.resumo__frete-gratis`).textContent=n===0?`GRÁTIS ✦`:`R$ ${n.toFixed(2)}`}document.getElementById(`itens-carrinho`).addEventListener(`click`,t=>{let n=t.target.dataset.id,r=JSON.parse(localStorage.getItem(`carrinho`)||`[]`),i=r.find(e=>e.id===n);if(t.target.classList.contains(`btn-mais`)&&(i.quantidade+=1),t.target.classList.contains(`btn-menos`)&&i.quantidade>1&&--i.quantidade,t.target.classList.contains(`item-remover`)){let t=r.filter(e=>e.id!==n);localStorage.setItem(`carrinho`,JSON.stringify(t)),e();return}localStorage.setItem(`carrinho`,JSON.stringify(r)),e()}),document.getElementById(`finalizar`).addEventListener(`click`,async function(){let e=JSON.parse(localStorage.getItem(`carrinho`)||`[]`),t=await(await fetch(`/api/checkout`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({itens:e})})).json();console.log(t);let n=t.links.find(e=>e.rel===`PAY`);window.location.href=n.href}),e();