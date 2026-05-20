// Importando as ferramentas do Firebase (para os botões de excluir/listar)
    import { monitorarEstoque, cadastrarProduto, deletarProduto } from "./produtos.js";
    import { onAuthStateChanged } from "firebase/auth";
    import { auth, db} from "./firebase.js";
    import { onSnapshot, where, query, collection} from "firebase/firestore";
    
    const EMAIL_ADMIN = "contato.liridelirios@gmail.com";

    onAuthStateChanged(auth, (usuario) => {
        if (!usuario || usuario.email !== EMAIL_ADMIN){
            window.location.href = "/admin/login.html";
        }else{
            document.body.style.visibility = "visible";
        }
    })

    const corpoTabela = document.getElementById("listar-produtos-estoque");

    monitorarEstoque((produtos) => {
        corpoTabela.innerHTML = produtos.map(p => `
        <tr>
            <td><img src="${p.imgURL}" width="50"></td>
            <td>${p.nome}</td>
            <td>${p.categoria}</td>
            <td class="${Object.values(p.estoque).reduce((acc, qtd) => acc + qtd, 0) < 3 ? 'alerta' : ''}">
            ${Object.values(p.estoque).reduce((acc, qtd) => acc + qtd, 0)}</td>
            <td>
                <button class="btn-excluir" data-id="${p.id}">Excluir</button>
            </td>
        </tr>
        `).join('');
    });

    corpoTabela.addEventListener("click", async (event) => {
        if (event.target.classList.contains("btn-excluir")){
            const id = event.target.dataset.id;
            const confirmar = confirm("Deseja mesmo remover este item do catálogo?")

            if(confirmar){
                try{
                    await deletarProduto(id);
                    alert("Produto removido com sucesso!")
                }catch(error){
                    console.error("Erro ao remover: ", error);
                }
            }
        }
    })
    const btnSalvar = document.getElementById("btn-adicionar-produto");
    btnSalvar.addEventListener("click", async (event) => {
        event.preventDefault();
        const nomeProduto = document.getElementById("nome-produto").value;
        const precoDigitado = parseFloat(document.getElementById("valor-produto").value);
        const inputFoto = document.getElementById("imagem-produto");
        const descricaoProduto = document.getElementById("descricao-produto").value;
        const categoriaProduto = document.getElementById("categoria-produto").value;

        const arquivoSelecionado = inputFoto.files[0];

        if (!arquivoSelecionado || nomeProduto === ""){
            alert("Preencha todos os campos obrigatórios");
            return;
        }
        const produto = {
            nome: nomeProduto,
            preco: precoDigitado,
            descricao: descricaoProduto,
            categoria: categoriaProduto,
            imagem: arquivoSelecionado,
            destaque: document.getElementById("destaque-produto").checked,
            estoque: {
                P: parseInt(document.getElementById('qtd-p').value) || 0,
                M: parseInt(document.getElementById('qtd-m').value) || 0,
                G: parseInt(document.getElementById('qtd-g').value) || 0,
                GG: parseInt(document.getElementById('qtd-gg').value) || 0,

            }
        };
        try{
            await cadastrarProduto(produto);
            alert("Produto adicionado com sucesso!");
            document.querySelector(".adicionarProduto").reset();
        }catch(error){
            console.error("Erro ao adicionar produto: ", error);
            alert("Erro ao adicionar produto. Veja o console para detalhes.");
        }
    });

    //Card de atualização de pedidos
function iniciarMonitoramentoDePedidos(){
    const regra_de_busca = query(collection(db, "pedidos"), where('status', '==', 'confirmado')); 
    
    onSnapshot(regra_de_busca, (snapshot) => {
        let lista_de_pedidos = [];
        snapshot.forEach((pedido) => {
            const dados = pedido.data();

            const dataBase = dados.dataCriacao || dados.criadoEm;

            if (!dataBase) return;

            const milissegundos = dataBase.seconds * 1000;
            const dataObjeto = new Date(milissegundos);
            const horarioFormatado = dataObjeto.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
                const idCurto = pedido.id.slice(-5).toUpperCase();
                const cidade = dados.endereco?.cidade || "";
                const bairro = dados.endereco?.bairro || "";
                const rua = dados.endereco?.logradouro || "";
                const telefone = dados.telefone || "";

                const localDeEntrega = [rua, bairro, cidade].filter(Boolean).join(", ").trim() || "Endereço não informado";
                const cardHTML = `
                <article class="card-venda-nova">
                    <div class="info-principal">
                        <span class="id-destaque">#${idCurto} 🌸</span>
                        
                        <strong class="nome-cliente">${dados.clienteNome || dados.email || 'Cliente'}</strong>

                        <span class="local-entrega">${localDeEntrega}</span>
                        <span class="telefone-cliente">${telefone}</span>
                    </div>
                    
                    <div class="info-financeira">
                        <span class="valor-total">R$ ${Number(dados.valorTotal || dados.total || 0).toFixed(2)}</span>
                        
                        <time class="horario-venda">${horarioFormatado}</time>
                    </div>
                </article>
            `;
            lista_de_pedidos.push(cardHTML);
        });
        document.getElementById("feed-pedidos").innerHTML = lista_de_pedidos.join("");
    });
}
iniciarMonitoramentoDePedidos();
