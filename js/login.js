import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../admin/firebase.js';

class AuthService {
  async login(email, senha) {
    return await signInWithEmailAndPassword(auth, email, senha);
  }
}

class LoginUI {
  async aoClicarEntrar() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const service = new AuthService();
    await service.login(email, senha);
    window.location.href = '../index.html';
  }
}

onAuthStateChanged(auth, (usuario) => {
  if (usuario) console.log('ainda logada!');
  else console.log('saiu!');
});

const ui = new LoginUI();
document.getElementById('btn-principal').addEventListener('click', () =>{
    ui.aoClicarEntrar();
});

import Swal from 'sweetalert2';

try{
    await service.login(email, senha);
    window.location.href = '../index.html';
}catch(erro){
    Swal.fire({
        icon: 'error',
        title: 'Conta não encontrada',
        text: 'Essa conta não existe. Deseja criar uma conta?',
        confirmButtonText: 'IR PARA CADASTRO',
        confirmButtonColor: '#7B1A2E',
        showCloseButton: true,
    })

    .then((result) => {
        if(result.isConfirmed){
            window.location.href = '../cadastro.html';
        }
    });
}