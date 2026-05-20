import { db } from "./firebase.js";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

const formCupom = document.getElementById('form-cupom');
const listaCupons = document.getElementById('listar-cupons');
let cupomEmEdicao = null;

formCupom.addEventListener('submit', async (e) => {
    e.preventDefault();

    const codigo = document.getElementById('codigo-cupom').value.trim().toUpperCase();

    if(!codigo){
        alert("Digite um código de cupom.")
        return;
    }
    const tipo = document.getElementById('tipo-cupom').value;
    const valor = Number(document.getElementById('valor-cupom').value);
    const minimoPedido = Number(document.getElementById('minimo-cupom').value) || 0;
    const usosMaximos = Number(document.getElementById('limite-cupom').value) || 1;
    const expiraEm = document.getElementById('validade-cupom').value;
    const ativo = document.getElementById('ativo-cupom').checked;

    if(tipo !== 'frete_gratis' && valor <= 0){
        alert("Informe um valor de desconto válido.")
        return;
    }

    try{
        const cupom = {
            codigo,
            tipo,
            valor,
            minimoPedido,
            usosMaximos,
            usosAtuais:0,
            expiraEm,
            ativo,
            criadoEm: serverTimestamp()
        };
        await setDoc(doc(db, 'cupons', codigo), cupom, { merge: true });
        alert(cupomEmEdicao ? "Cupom atualizado com sucesso!" : "Cupom criado com sucesso!");
        cupomEmEdicao = null;
        formCupom.reset();
        document.getElementById('ativo-cupom').checked = true;
        document.getElementById('codigo-cupom').disabled = false;
    }catch(error){
        console.error("Erro ao criar cupom:", error);
        alert("Erro ao criar cupom. Veja o console")
    }
});


onSnapshot(collection(db, 'cupons'), (snapshot) => {

    listaCupons.innerHTML = '';

    if (snapshot.empty) {
        listaCupons.innerHTML = `
            <tr>
                <td colspan="8">Nenhum cupom cadastrado.</td>
            </tr>
        `;
        return;
    }

    snapshot.forEach((documento) => {
        const corpoListCupom = documento.data();
        const validade = corpoListCupom.expiraEm || "Sem validade";
        const textoStatus = corpoListCupom.ativo ? 'Desativar' : 'Ativar';

        listaCupons.innerHTML += `
            <tr>
                <td>${corpoListCupom.codigo}</td>
                <td>${corpoListCupom.tipo}</td>
                <td>${corpoListCupom.valor}</td>
                <td>${corpoListCupom.minimoPedido}</td>
                <td>${corpoListCupom.usosAtuais} / ${corpoListCupom.usosMaximos}</td>
                <td>${validade}</td>
                <td>${corpoListCupom.ativo ? 'Ativo' : 'Inativo'}</td>
                <td>
                    <button class="btn-editar" data-id="${documento.id}">Editar</button>
                    <button class="btn-alternar" data-id="${documento.id}" data-ativo="${corpoListCupom.ativo}">${textoStatus}</button>
                    <button class="btn-excluir" data-id="${documento.id}">Excluir</button>
                </td>
            </tr>
        `;
    })

});

listaCupons.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;

    if (!id) return;

    if (e.target.classList.contains('btn-excluir')) {
        const confirmar = confirm(`Deseja excluir o cupom ${id}?`);

        if (!confirmar) return;

        try {
            await deleteDoc(doc(db, 'cupons', id));
            alert("Cupom excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir cupom:", error);
            alert("Erro ao excluir cupom. Veja o console.");
        }
    }

    if (e.target.classList.contains('btn-alternar')) {
        const ativoAtual = e.target.dataset.ativo === 'true';

        try {
            await updateDoc(doc(db, 'cupons', id), {
                ativo: !ativoAtual
            });
        } catch (error) {
            console.error("Erro ao alterar status do cupom:", error);
            alert("Erro ao alterar status do cupom. Veja o console.");
        }
    }

    if (e.target.classList.contains('btn-editar')) {
        const linha = e.target.closest('tr');
        const celulas = linha.querySelectorAll('td');

        cupomEmEdicao = id;
        document.getElementById('codigo-cupom').value = celulas[0].textContent;
        document.getElementById('codigo-cupom').disabled = true;
        document.getElementById('tipo-cupom').value = celulas[1].textContent;
        document.getElementById('valor-cupom').value = celulas[2].textContent;
        document.getElementById('minimo-cupom').value = celulas[3].textContent;
        document.getElementById('limite-cupom').value = celulas[4].textContent.split('/')[1].trim();
        document.getElementById('validade-cupom').value = celulas[5].textContent === 'Sem validade' ? '' : celulas[5].textContent;
        document.getElementById('ativo-cupom').checked = celulas[6].textContent === 'Ativo';
        document.getElementById('gestao-cupons').scrollIntoView({ behavior: 'smooth' });
    }
});
