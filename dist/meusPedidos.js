import{c as e,d as t,f as n,n as r,o as i,t as a,v as o,x as s}from"./firebase.js";/* empty css           */var c=document.getElementById(`icone-perfil`),l=document.getElementById(`dropdown-perfil`);c.addEventListener(`click`,()=>{l.classList.toggle(`ativo`)}),o(a,async e=>{e?(l.innerHTML=`
                    <a href="minha-conta.html">MINHA CONTA</a>
                    <a href="meus-pedidos.html">MEUS PEDIDOS</a>
                    <a href="meus-dados.html">MEUS DADOS</a>
                    <a href="enderecos.html">ENDEREÇO</a>
                    <a href="#" id="btn-sair">SAIR</a>
                `,document.getElementById(`btn-sair`).addEventListener(`click`,async()=>{await s(a),window.location.href=`/login.html`}),await u(e.uid)):window.location.href=`/login.html`});async function u(a){let o=document.getElementById(`lista-pedidos`);try{let s=await i(e(n(r,`pedidos`),t(`usuarioId`,`==`,a)));if(s.empty){o.innerHTML=`
                        <div class="pedidos-vazio">
                            <p>Você ainda não fez nenhum pedido.</p>
                            <a href="index.html">Explorar coleção</a>
                        </div>`;return}o.innerHTML=``,s.forEach(e=>{let t=e.data(),n=t.status||`andamento`,r={concluido:`Concluído`,andamento:`Em andamento`,cancelado:`Cancelado`}[n],i={concluido:`status-concluido`,andamento:`status-andamento`,cancelado:`status-cancelado`}[n],a=(t.itens||[]).map(e=>`
                        <div class="pedido-card__item">
                            <img src="${e.imgURL||``}" alt="${e.nome}">
                            <div class="pedido-card__item-info">
                                <p>${e.nome}</p>
                                <span>Qtd: ${e.quantidade} · R$ ${parseFloat(e.preco).toFixed(2)}</span>
                            </div>
                        </div>`).join(``);o.innerHTML+=`
                        <div class="pedido-card">
                            <div class="pedido-card__header">
                                <span class="pedido-card__numero">Pedido #${e.id.slice(0,8).toUpperCase()}</span>
                                <span class="pedido-card__status ${i}">${r}</span>
                            </div>
                            ${a}
                            <div class="pedido-card__footer">
                                <span class="pedido-card__total">Total: <strong>R$ ${parseFloat(t.total||0).toFixed(2)}</strong></span>
                            </div>
                        </div>`})}catch(e){o.innerHTML=`<p style="color:var(--color-label)">Erro ao carregar pedidos.</p>`,console.error(e)}}