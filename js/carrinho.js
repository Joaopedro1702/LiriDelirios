import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../admin/firebase.js";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import Swal from "sweetalert2";

    //guardar pedido por usuário até a realização do pagamento.
let usuarioAtual = null;
let cupomAplicado = null;

onAuthStateChanged(auth, (usuario) => {
    if (usuario){
        usuarioAtual = usuario;
    }else{
        window.location.href = '/login.html';
    }
});

function renderizarCarrinho(){
    const lista = document.getElementById('itens-carrinho');
    const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
    
    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    document.querySelector('.secao-subtitulo').textContent = 
    totalItens === 0  
    ? 'SEU CARRINHO ESTÁ VAZIO'
    : `${totalItens} ${totalItens === 1 ? 'ITEM SELECIONADO' : `ITENS SELECIONADOS`}`;
    
    lista.innerHTML = carrinho.map(item => {
        const subtotal = item.preco * item.quantidade;
        return`
        <div class="carrinho-item">
            <div class="item-produto">
                <img src="${item.imgURL}" class="item-img">
                <div class="item-info">
                    <p class="item-info__categoria">${item.categoria}</p>
                    <p class="item-info__nome">${item.nome}</p>
                </div>
            </div>
            <span class="item-preco">R$ ${parseFloat(item.preco).toFixed(2)}</span>
            <div class="quantidade">
                <button class="quantidade__btn btn-menos" data-id="${item.id}">−</button>
                <input class="quantidade__valor" type="text" value="${item.quantidade}" readonly/>
                <button class="quantidade__btn btn-mais" data-id="${item.id}">+</button>
            </div>
            <span class="item-subtotal">R$ ${subtotal.toFixed(2)}</span>
            <button class="item-remover" data-id="${item.id}">Remover</button>
        </div>`;
    }).join('');

    let frete = 10;
    const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

    if(total >= 199) frete = 0;

    let desconto = 0;
    if (cupomAplicado) {
        if (cupomAplicado.tipo === "percentual") {
            desconto = total * (cupomAplicado.valor / 100);
        }
        if (cupomAplicado.tipo === "fixo") {
            desconto = cupomAplicado.valor;
        }
        if (cupomAplicado.tipo === "frete_gratis") {
            frete = 0;
        }
    }

    desconto = Math.min(desconto, total);
    const totalFinal = frete + total - desconto;

    document.querySelector('.resumo__total-valor').textContent = `R$ ${totalFinal.toFixed(2)}`;
    document.querySelector('.resumo__valor').textContent = `R$ ${total.toFixed(2)}`;
    document.getElementById('resumo-desconto').textContent = `− R$ ${desconto.toFixed(2)}`;
    document.querySelector('.resumo__frete-gratis').textContent = frete === 0 ? 'GRÁTIS ✦' : `R$ ${frete.toFixed(2)}`;
}

//Area para validar cupons
document.getElementById('form-cupom-carrinho').addEventListener('submit', async (e) => {
    e.preventDefault();

    const feedback = document.getElementById('cupom-feedback');
    const codigo = document.getElementById('cupom-carrinho').value.trim().toUpperCase();
    const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
    const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

    if (!codigo) {
        cupomAplicado = null;
        localStorage.removeItem('cupom');
        feedback.textContent = 'Digite um cupom para aplicar.';
        feedback.className = 'cupom-feedback erro';
        renderizarCarrinho();
        return;
    }

    try {
        const cupomDoc = await getDoc(doc(db, 'cupons', codigo));

        if (!cupomDoc.exists()) {
            throw new Error('Cupom não encontrado.');
        }

        const cupom = cupomDoc.data();
        const hoje = new Date().toISOString().slice(0, 10);

        if (!cupom.ativo) throw new Error('Cupom inativo.');
        if (cupom.expiraEm && cupom.expiraEm < hoje) throw new Error('Cupom expirado.');
        if (total < Number(cupom.minimoPedido || 0)) throw new Error('Pedido não atingiu o valor mínimo do cupom.');
        if (Number(cupom.usosAtuais || 0) >= Number(cupom.usosMaximos || 1)) throw new Error('Cupom atingiu o limite de usos.');

        cupomAplicado = {
            codigo,
            tipo: cupom.tipo,
            valor: Number(cupom.valor || 0),
            minimoPedido: Number(cupom.minimoPedido || 0)
        };
        localStorage.setItem('cupom', codigo);
        feedback.textContent = `Cupom ${codigo} aplicado.`;
        feedback.className = 'cupom-feedback sucesso';
        renderizarCarrinho();
    } catch (error) {
        cupomAplicado = null;
        localStorage.removeItem('cupom');
        feedback.textContent = error.message;
        feedback.className = 'cupom-feedback erro';
        renderizarCarrinho();
    }
});

document.getElementById('itens-carrinho').addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
    const item = carrinho.find(i => i.id === id);

    if(e.target.classList.contains('btn-mais')) item.quantidade += 1;
    if(e.target.classList.contains('btn-menos') && item.quantidade > 1) item.quantidade -= 1;
    
    if(e.target.classList.contains('item-remover')){
        const novo = carrinho.filter(i => i.id !== id);
        localStorage.setItem('carrinho', JSON.stringify(novo));
        renderizarCarrinho();
        return;
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    renderizarCarrinho();
});

    const botao = document.getElementById("finalizar");

    botao.addEventListener('click', async function(){
        try{
        const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
        const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        const frete = total >= 199 ? 0 : 10;
        const cupom = localStorage.getItem("cupom");
        const clienteDoc = await getDoc(doc(db, "clientes", usuarioAtual.uid));

        if (!clienteDoc.exists()) {
            throw new Error("Dados da cliente nao encontrados.");
        }

        const cliente = clienteDoc.data();
        const clienteNome = [cliente.nome, cliente.sobrenome].filter(Boolean).join(" ").trim() || "Cliente";

        const docRef = await addDoc(collection(db, "pedidos"), {
                usuarioId: usuarioAtual.uid,
                clienteNome,
                telefone: cliente.telefone || "",
                email: cliente.email || usuarioAtual.email || "",
                endereco: cliente.endereco || null,
                itens: carrinho,
                status: "pendente",
                criadoEm: serverTimestamp(),
                dataCriacao: serverTimestamp(),
                total,
                frete,
                valorTotal: total + frete,
                cupom: cupom || null
            });
            const pedidoId = docRef.id;
            const idToken = await usuarioAtual.getIdToken();

            const resposta = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
                body: JSON.stringify({ itens: carrinho, pedidoId: docRef.id, frete, cupom })
            });
            const dados = await resposta.json();

            if (!resposta.ok) throw new Error(dados.error || "Erro ao criar checkout.");

            const link = dados.links?.find(l => l.rel === "PAY");
            if (!link) throw new Error("Link de pagamento nao encontrado.");

            window.location.href = link.href;
            }catch(erro){
                Swal.fire({
                    icon: "error",
                    title: "Erro ao finalizar",
                    text: "Ocorreu um problema ao processar seu pedido. Tente novamente.",
                    confirmButtonColor: "#7B1A2E"
                });
                console.error(erro);
            }
        });

const cupomSalvo = localStorage.getItem('cupom');
if (cupomSalvo) {
    document.getElementById('cupom-carrinho').value = cupomSalvo;
}

renderizarCarrinho();
