
function renderizarCarrinho(){
    const lista = document.getElementById('itens-carrinho');
    const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
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
            <div class="quantidade">
                <button class="quantidade__btn btn-menos" data-id="${item.id}">−</button>
                <input class="quantidade__valor" type="text" value="${item.quantidade}" readonly/>
                <button class="quantidade__btn btn-mais" data-id="${item.id}">+</button>
                </div>
        </div>
        <span class="item-preco">R$ ${parseFloat(item.preco).toFixed(2)}</span>
    </div>

        `;
}).join('');

const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
document.querySelector('.resumo__total-valor').textContent = `RS ${total.toFixed(2)}`;

document.querySelector('.resumo__valor').textContent = `R$ ${total.toFixed(2)}`;

let frete = 10;

if(total >= 199){
    frete = 0;
}

document.querySelector('.resumo__frete-gratis').textContent = frete === 0 ? 'GRÁTIS ✦' : `R$ ${frete.toFixed(2)}`;
}


document.getElementById('itens-carrinho').addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
    const item = carrinho.find(i => i.id === id);

    if(e.target.classList.contains('btn-mais')){
        item.quantidade += 1;
    }
    if (e.target.classList.contains('btn-menos') && item.quantidade > 1){
        item.quantidade -= 1;
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    renderizarCarrinho();
});

renderizarCarrinho();