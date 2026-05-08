import"../modulepreload-polyfill.js";/* empty css      *//* empty css            */import{n as e,r as t,t as n}from"../produtos.js";var r=document.getElementById(`listar-produtos-estoque`);t(e=>{r.innerHTML=e.map(e=>`
        <tr>
            <td><img src="${e.imgURL}" width="50"></td>
            <td>${e.nome}</td>
            <td>${e.categoria}</td>
            <td class="${e.estoque.quantidade<3?`alerta`:``}">
            ${e.estoque.quantidade}</td>
            <td>
                <button class="btn-excluir" data-id="${e.id}">Excluir</button>
            </td>
        </tr>
        `).join(``)}),r.addEventListener(`click`,async t=>{if(t.target.classList.contains(`btn-excluir`)){let n=t.target.dataset.id;if(confirm(`Deseja mesmo remover este item do catálogo?`))try{await e(n),alert(`Produto removido com sucesso!`)}catch(e){console.error(`Erro ao remover: `,e)}}}),document.getElementById(`btn-adicionar-produto`).addEventListener(`click`,async e=>{e.preventDefault();let t=document.getElementById(`nome-produto`).value,r=parseFloat(document.getElementById(`valor-produto`).value),i=document.getElementById(`imagem-produto`),a=document.getElementById(`descricao-produto`).value,o=document.getElementById(`categoria-produto`).value,s=i.files[0];if(!s||t===``){alert(`Preencha todos os campos obrigatórios`);return}let c={nome:t,preco:r,descricao:a,categoria:o,imagem:s,destaque:document.getElementById(`destaque-produto`).checked,estoque:{P:parseInt(document.getElementById(`qtd-p`).value)||0,M:parseInt(document.getElementById(`qtd-m`).value)||0,G:parseInt(document.getElementById(`qtd-g`).value)||0,GG:parseInt(document.getElementById(`qtd-gg`).value)||0}};try{await n(c),alert(`Produto adicionado com sucesso!`),document.querySelector(`.adicionarProduto`).reset()}catch(e){console.error(`Erro ao adicionar produto: `,e),alert(`Erro ao adicionar produto. Veja o console para detalhes.`)}});