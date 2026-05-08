import"./modulepreload-polyfill.js";/* empty css           */import{c as e,d as t,g as n,n as r,o as i,t as a,u as o,y as s}from"./firebase.js";var c=document.getElementById(`icone-perfil`),l=document.getElementById(`dropdown-perfil`);c.addEventListener(`click`,()=>{l.classList.toggle(`ativo`)}),n(a,async e=>{e?(l.innerHTML=`
                    <a href="minha-conta.html">MINHA CONTA</a>
                    <a href="meus-pedidos.html">MEUS PEDIDOS</a>
                    <a href="meus-dados.html">MEUS DADOS</a>
                    <a href="enderecos.html">ENDEREÇO</a>
                    <a href="#" id="btn-sair">SAIR</a>
                `,document.getElementById(`btn-sair`).addEventListener(`click`,async()=>{await s(a),window.location.href=`/login.html`}),await u(e.uid)):window.location.href=`/login.html`});async function u(n){let a=document.getElementById(`lista-pedidos`);try{let s=await i(e(t(r,`pedidos`),o(`usuarioId`,`==`,n)));if(s.empty){a.innerHTML=`
                        <div class="pedidos-vazio">
                            <p>Você ainda não fez nenhum pedido.</p>
                            <a href="index.html">Explorar coleção</a>
                        </div>`;return}a.innerHTML=``,s.forEach(e=>{let t=e.data(),n=t.status||`andamento`,r={concluido:`Concluído`,andamento:`Em andamento`,cancelado:`Cancelado`}[n],i={concluido:`status-concluido`,andamento:`status-andamento`,cancelado:`status-cancelado`}[n],o=(t.itens||[]).map(e=>`
                        <div class="pedido-card__item">
                            <img src="${e.imgURL||``}" alt="${e.nome}">
                            <div class="pedido-card__item-info">
                                <p>${e.nome}</p>
                                <span>Qtd: ${e.quantidade} · R$ ${parseFloat(e.preco).toFixed(2)}</span>
                            </div>
                        </div>`).join(``);a.innerHTML+=`
                        <div class="pedido-card">
                            <div class="pedido-card__header">
                                <span class="pedido-card__numero">Pedido #${e.id.slice(0,8).toUpperCase()}</span>
                                <span class="pedido-card__status ${i}">${r}</span>
                            </div>
                            ${o}
                            <div class="pedido-card__footer">
                                <span class="pedido-card__total">Total: <strong>R$ ${parseFloat(t.total||0).toFixed(2)}</strong></span>
                            </div>
                        </div>`})}catch(e){a.innerHTML=`<p style="color:var(--color-label)">Erro ao carregar pedidos.</p>`,console.error(e)}}