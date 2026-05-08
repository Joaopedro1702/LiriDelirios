import"./modulepreload-polyfill.js";/* empty css           */import{g as e,t,y as n}from"./firebase.js";var r=document.getElementById(`icone-perfil`),i=document.getElementById(`dropdown-perfil`);r.addEventListener(`click`,()=>{i.classList.toggle(`ativo`)}),e(t,e=>{e?(document.getElementById(`nome-usuario`).textContent=`Bem-vinda, ${e.displayName||`cliente`}!`,document.getElementById(`email-usuario`).textContent=e.email,i.innerHTML=`
                    <a href="minha-conta.html">MINHA CONTA</a>
                    <a href="meus-pedidos.html">MEUS PEDIDOS</a>
                    <a href="meus-dados.html">MEUS DADOS</a>
                    <a href="enderecos.html">ENDEREÇO</a>
                    <a href="#" id="btn-sair">SAIR</a>
                `,document.getElementById(`btn-sair`).addEventListener(`click`,async()=>{await n(t),window.location.href=`/login.html`})):window.location.href=`/login.html`});