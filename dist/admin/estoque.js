import{c as e,d as t,f as n,i as r,l as i,m as a,n as o,p as s,s as c,t as l,u,v as d}from"../firebase.js";/* empty css      *//* empty css            */import{n as f,r as p,t as m}from"../produtos.js";var h=`contato.liridelirios@gmail.com`;d(l,e=>{!e||e.email!==h?window.location.href=`/admin/login.html`:document.body.style.visibility=`visible`});var g=document.getElementById(`listar-produtos-estoque`);p(e=>{g.innerHTML=e.map(e=>`
        <tr>
            <td><img src="${e.imgURL}" width="50"></td>
            <td>${e.nome}</td>
            <td>${e.categoria}</td>
            <td class="${Object.values(e.estoque).reduce((e,t)=>e+t,0)<3?`alerta`:``}">
            ${Object.values(e.estoque).reduce((e,t)=>e+t,0)}</td>
            <td>
                <button class="btn-excluir" data-id="${e.id}">Excluir</button>
            </td>
        </tr>
        `).join(``)}),g.addEventListener(`click`,async e=>{if(e.target.classList.contains(`btn-excluir`)){let t=e.target.dataset.id;if(confirm(`Deseja mesmo remover este item do catálogo?`))try{await f(t),alert(`Produto removido com sucesso!`)}catch(e){console.error(`Erro ao remover: `,e)}}}),document.getElementById(`btn-adicionar-produto`).addEventListener(`click`,async e=>{e.preventDefault();let t=document.getElementById(`nome-produto`).value,n=parseFloat(document.getElementById(`valor-produto`).value),r=document.getElementById(`imagem-produto`),i=document.getElementById(`descricao-produto`).value,a=document.getElementById(`categoria-produto`).value,o=r.files[0];if(!o||t===``){alert(`Preencha todos os campos obrigatórios`);return}let s={nome:t,preco:n,descricao:i,categoria:a,imagem:o,destaque:document.getElementById(`destaque-produto`).checked,estoque:{P:parseInt(document.getElementById(`qtd-p`).value)||0,M:parseInt(document.getElementById(`qtd-m`).value)||0,G:parseInt(document.getElementById(`qtd-g`).value)||0,GG:parseInt(document.getElementById(`qtd-gg`).value)||0}};try{await m(s),alert(`Produto adicionado com sucesso!`),document.querySelector(`.adicionarProduto`).reset()}catch(e){console.error(`Erro ao adicionar produto: `,e),alert(`Erro ao adicionar produto. Veja o console para detalhes.`)}});function _(){c(e(n(o,`pedidos`),t(`status`,`==`,`confirmado`)),e=>{let t=[];e.forEach(e=>{let n=e.data(),r=n.dataCriacao||n.criadoEm;if(!r)return;let i=r.seconds*1e3,a=new Date(i).toLocaleTimeString(`pt-BR`,{hour:`2-digit`,minute:`2-digit`}),o=e.id.slice(-5).toUpperCase(),s=n.endereco?.cidade||``,c=n.endereco?.bairro||``,l=n.endereco?.logradouro||``,u=n.telefone||``,d=[l,c,s].filter(Boolean).join(`, `).trim()||`Endereço não informado`,f=`
                <article class="card-venda-nova">
                    <div class="info-principal">
                        <span class="id-destaque">#${o} 🌸</span>
                        
                        <strong class="nome-cliente">${n.clienteNome||n.email||`Cliente`}</strong>

                        <span class="local-entrega">${d}</span>
                        <span class="telefone-cliente">${u}</span>
                    </div>
                    
                    <div class="info-financeira">
                        <span class="valor-total">R$ ${Number(n.valorTotal||n.total||0).toFixed(2)}</span>
                        
                        <time class="horario-venda">${a}</time>
                    </div>

                    <div class="card-venda-nova__acoes">
                        <input
                            class="input-rastreio"
                            type="text"
                            placeholder="Código de rastreio"
                            data-id="${e.id}"
                        >
                        <button
                            class="btn-marcar-enviado"
                            type="button"
                            data-id="${e.id}"
                        >
                            Marcar enviado
                        </button>
                    </div>
                </article>
            `;t.push(f)}),document.getElementById(`feed-pedidos`).innerHTML=t.join(``)});async function r(e,t){await u(s(o,`pedidos`,e),{status:`enviado`,transportadora:`correios`,codRastreio:t,enviadoEm:a(),atualizadoEm:a()}),console.log(`Encomenda ${e} marcada como enviada com código de rastreio: ${t}`)}document.getElementById(`feed-pedidos`).addEventListener(`click`,async e=>{if(!e.target.classList.contains(`btn-marcar-enviado`))return;let t=e.target,n=e.target.dataset.id,i=document.querySelector(`.input-rastreio[data-id="${n}"]`);if(!i){alert(`Campo de código de rastreio não encontrado para este pedido.`);return}let a=i.value.trim();if(!a){alert(`Por favor, insira o código de rastreio antes de marcar como enviado.`);return}if(confirm(`Deseja marcar este pedido como enviado?`))try{t.disabled=!0,t.textContent=`Atualizando...`,await r(n,a),alert(`Pedido marcado como enviado com sucesso!`)}catch(e){console.error(`Erro ao marcar pedido como enviado: `,e),t.disabled=!1,t.textContent=`Marcar enviado`,alert(`Erro ao marcar pedido como enviado. Tente novamente.`)}})}_();var v=document.getElementById(`form-cupom`),y=document.getElementById(`listar-cupons`),b=null;v.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`codigo-cupom`).value.trim().toUpperCase();if(!t){alert(`Digite um código de cupom.`);return}let n=document.getElementById(`tipo-cupom`).value,r=Number(document.getElementById(`valor-cupom`).value),c=Number(document.getElementById(`minimo-cupom`).value)||0,l=Number(document.getElementById(`limite-cupom`).value)||1,u=document.getElementById(`validade-cupom`).value,d=document.getElementById(`ativo-cupom`).checked;if(n!==`frete_gratis`&&r<=0){alert(`Informe um valor de desconto válido.`);return}try{let e={codigo:t,tipo:n,valor:r,minimoPedido:c,usosMaximos:l,usosAtuais:0,expiraEm:u,ativo:d,criadoEm:a()};await i(s(o,`cupons`,t),e,{merge:!0}),alert(b?`Cupom atualizado com sucesso!`:`Cupom criado com sucesso!`),b=null,v.reset(),document.getElementById(`ativo-cupom`).checked=!0,document.getElementById(`codigo-cupom`).disabled=!1}catch(e){console.error(`Erro ao criar cupom:`,e),alert(`Erro ao criar cupom. Veja o console`)}}),c(n(o,`cupons`),e=>{if(y.innerHTML=``,e.empty){y.innerHTML=`
            <tr>
                <td colspan="8">Nenhum cupom cadastrado.</td>
            </tr>
        `;return}e.forEach(e=>{let t=e.data(),n=t.expiraEm||`Sem validade`,r=t.ativo?`Desativar`:`Ativar`;y.innerHTML+=`
            <tr>
                <td>${t.codigo}</td>
                <td>${t.tipo}</td>
                <td>${t.valor}</td>
                <td>${t.minimoPedido}</td>
                <td>${t.usosAtuais} / ${t.usosMaximos}</td>
                <td>${n}</td>
                <td>${t.ativo?`Ativo`:`Inativo`}</td>
                <td>
                    <button class="btn-editar" data-id="${e.id}">Editar</button>
                    <button class="btn-alternar" data-id="${e.id}" data-ativo="${t.ativo}">${r}</button>
                    <button class="btn-excluir" data-id="${e.id}">Excluir</button>
                </td>
            </tr>
        `})}),y.addEventListener(`click`,async e=>{let t=e.target.dataset.id;if(t){if(e.target.classList.contains(`btn-excluir`)){if(!confirm(`Deseja excluir o cupom ${t}?`))return;try{await r(s(o,`cupons`,t)),alert(`Cupom excluído com sucesso!`)}catch(e){console.error(`Erro ao excluir cupom:`,e),alert(`Erro ao excluir cupom. Veja o console.`)}}if(e.target.classList.contains(`btn-alternar`)){let n=e.target.dataset.ativo===`true`;try{await u(s(o,`cupons`,t),{ativo:!n})}catch(e){console.error(`Erro ao alterar status do cupom:`,e),alert(`Erro ao alterar status do cupom. Veja o console.`)}}if(e.target.classList.contains(`btn-editar`)){let n=e.target.closest(`tr`).querySelectorAll(`td`);b=t,document.getElementById(`codigo-cupom`).value=n[0].textContent,document.getElementById(`codigo-cupom`).disabled=!0,document.getElementById(`tipo-cupom`).value=n[1].textContent,document.getElementById(`valor-cupom`).value=n[2].textContent,document.getElementById(`minimo-cupom`).value=n[3].textContent,document.getElementById(`limite-cupom`).value=n[4].textContent.split(`/`)[1].trim(),document.getElementById(`validade-cupom`).value=n[5].textContent===`Sem validade`?``:n[5].textContent,document.getElementById(`ativo-cupom`).checked=n[6].textContent===`Ativo`,document.getElementById(`gestao-cupons`).scrollIntoView({behavior:`smooth`})}}});