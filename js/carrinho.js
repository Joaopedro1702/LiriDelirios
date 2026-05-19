import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../admin/firebase.js";
import { addDoc, collection } from "firebase/firestore";

    //guardar pedido por usuário até a realização do pagamento.
let usuarioAtual = null;

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

    const totalFinal = frete + total;

    document.querySelector('.resumo__total-valor').textContent = `R$ ${totalFinal.toFixed(2)}`;
    document.querySelector('.resumo__valor').textContent = `R$ ${total.toFixed(2)}`;
    document.querySelector('.resumo__frete-gratis').textContent = frete === 0 ? 'GRÁTIS ✦' : `R$ ${frete.toFixed(2)}`;
}

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
        const docRef = await addDoc(collection(db, "pedidos"), {
                usuarioId: usuarioAtual.uid,
                itens: carrinho,
                status: "pendente",
                criadoEm: new Date()    
            });
            const pedidoId = docRef.id;

            const resposta = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itens: carrinho, pedidoId: docRef.id, frete })
            });
            const dados = await resposta.json();
            console.log(dados);
            const link = dados.links.find(l => l.rel === "PAY");
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

renderizarCarrinho();