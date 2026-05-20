import{t as e,v as t,x as n}from"./firebase.js";/* empty css           */var r=document.getElementById(`icone-perfil`),i=document.getElementById(`dropdown-perfil`);r.addEventListener(`click`,()=>{i.classList.toggle(`ativo`)}),t(e,t=>{t?(document.getElementById(`nome-usuario`).textContent=`Bem-vinda, ${t.displayName||`cliente`}!`,document.getElementById(`email-usuario`).textContent=t.email,i.innerHTML=`
                    <a href="minha-conta.html">MINHA CONTA</a>
                    <a href="meus-pedidos.html">MEUS PEDIDOS</a>
                    <a href="meus-dados.html">MEUS DADOS</a>
                    <a href="enderecos.html">ENDEREÇO</a>
                    <a href="#" id="btn-sair">SAIR</a>
                `,document.getElementById(`btn-sair`).addEventListener(`click`,async()=>{await n(e),window.location.href=`/login.html`})):window.location.href=`/login.html`});