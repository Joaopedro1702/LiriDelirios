import emailjs from '@emailjs/browser';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../admin/firebase.js';

emailjs.init({
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
});

const formCadastro = document.querySelector('.auth-form-area .form-box');
formCadastro.addEventListener('submit', async (e) => {
  e.preventDefault();

  const dadosIniciais = {
    nome: document.getElementById('nome').value.trim(),
    sobrenome: document.getElementById('sobrenome').value.trim(),
    cpf: document.getElementById('cpf').value.trim(),
    nascimento: document.getElementById('nascimento').value,
    telefone: document.getElementById('telefone').value.trim(),
    email: document.getElementById('email').value.trim(),
    senha: document.getElementById('senha').value,
    confirmaSenha: document.getElementById('confirma-senha').value,
    termosAceitos: document.getElementById('termos').checked,
    receberNewsletter: document.getElementById('newsletter').checked,
    receberWhatsapp: document.getElementById('whatsapp').checked
  };

  const endereco = {
    cep: document.getElementById('cep').value,
    logradouro: document.getElementById('logradouro').value,
    bairro: document.getElementById('bairro').value,
    cidade: document.getElementById('cidade').value,
    estado: document.getElementById('estado').value,
    numero: document.getElementById('numero').value
  };

  executarFluxoCadastro({ ...dadosIniciais, endereco });
});

async function executarFluxoCadastro({ nome, sobrenome, cpf, nascimento, telefone, email, senha, confirmaSenha, endereco,
  termosAceitos, receberNewsletter, receberWhatsapp }) {

  if (senha !== confirmaSenha) {
    alert('As senhas não coincidem. Por favor, verifique e tente novamente.');
    return;
  }

  if (!termosAceitos) {
    alert('A aceitação dos termos é obrigatória para conformidade com a LGPD.');
    return;
  }

  try {
    const credencial = await createUserWithEmailAndPassword(auth, email, senha);
    const uid = credencial.user.uid;

    await salvarDadosNoBanco({ uid, nome, sobrenome, cpf, nascimento, telefone, email, endereco, receberNewsletter, receberWhatsapp });
    
    try{
      const respostaBrevo = await fetch('/api/brevo-contato', {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid })
      });

      const dadosBrevo = await respostaBrevo.json();

      if(!respostaBrevo.ok){
        console.error('Erro ao integrar com Brevo: ', dadosBrevo);
      }
    }catch(erroBrevo){
      console.error('Falha ao conectar com o Brevo: ', erroBrevo);
    }

    const payloadEmail = {
      nome_usuario: nome,
      email_usuario: email
    }
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      payloadEmail).catch(err => console.error('EmailJS erro: ', err));


    alert('Conta criada com sucesso! Agora você pode fazer login.');
    window.location.href = 'login.html';
  } catch (error) {
    alert('Erro ao criar conta: ' + error.message);
  }
}

async function salvarDadosNoBanco({ uid, nome, sobrenome, cpf, nascimento, telefone, email, endereco, receberNewsletter, receberWhatsapp }) {
  const refCliente = doc(db, 'clientes', uid);

  await setDoc(refCliente, {
    uid,
    nome,
    sobrenome,
    cpf,
    nascimento,
    telefone,
    email,
    endereco,
    receberNewsletter,
    receberWhatsapp,
    dataCadastro: new Date(),
    status: true
  });

}