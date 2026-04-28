import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../admin/firebase.js";

class AuthService {
  async login(email, senha) {
    return await signInWithEmailAndPassword(auth, email, senha);
  }
}

import Swal from "sweetalert2";

let loginEmAndamento = false;
onAuthStateChanged(auth, (usuario) => {
  if (usuario && !loginEmAndamento) window.location.href = '../index.html';
});

class LoginUI {
  async aoClicarEntrar() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const service = new AuthService();

    try {
      loginEmAndamento = true;
      await service.login(email, senha);
      window.location.href = "../index.html";
    } catch (erro) {
      loginEmAndamento = false;
      if (erro.code === "auth/wrong-password" || erro.code === "auth/invalid-credential") {
    Swal.fire({
      icon: "error",
      title: "Email ou Senha incorreta!",
      text: "Verifique seu email e senha.",
      confirmButtonText: "VOLTAR",
      confirmButtonColor: "#7B1A2E",
      showCloseButton: true,
    });
  } else if (erro.code === "auth/user-not-found") {
    Swal.fire({
      icon: "error",
      title: "Conta não encontrada",
      text: "Essa conta não existe. Deseja criar uma conta?",
      confirmButtonText: "IR PARA CADASTRO",
      confirmButtonColor: "#7B1A2E",
      showCloseButton: true,
    }).then((result) => {
      if (result.isConfirmed) window.location.href = "../cadastro.html";
    });
  } else {
    Swal.fire({ icon: "error", title: "Erro ao entrar", text: erro.message });
  }
}
  }
}

const ui = new LoginUI();
document.getElementById("btn-principal").addEventListener("click", () => {
  ui.aoClicarEntrar();
});

