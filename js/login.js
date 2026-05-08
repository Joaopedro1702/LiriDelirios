import { signInWithEmailAndPassword, onAuthStateChanged, deleteUser } from "firebase/auth";
import { auth, db } from "../admin/firebase.js";
import Swal from "sweetalert2";
import { doc, deleteDoc } from "firebase/firestore";

//Camada de Serviço: Responsável pela regra de negócio e comunicação com Firebase
class AuthService {
  async login(email, senha) {
    return await signInWithEmailAndPassword(auth, email, senha);
  }

  async deletarConta(usuario) {
    if (!usuario) throw new Error("Nenhum usuário autenticado encontrado.");

    // Remove do Firestore primeiro para evitar perda de permissão
    const clienteRef = doc(db, "clientes", usuario.uid);
    await deleteDoc(clienteRef);

    // Remove do Authentication
    await deleteUser(usuario);
  }
}

let loginEmAndamento = false;

onAuthStateChanged(auth, (usuario) => {
  // Se já estiver logado e não estiver no meio do processo de login, vai para a home
  if (usuario && !loginEmAndamento) {
    if (window.location.pathname.includes('login.html')) {
        window.location.href = '../index.html';
    }
  }
});

//Camada de Interface (UI): Responsável pela interação com o usuário
class LoginUI {
  constructor() {
    this.service = new AuthService();
  }

  async aoClicarEntrar() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
      loginEmAndamento = true;
      await this.service.login(email, senha);
      window.location.href = "../index.html";
    } catch (erro) {
      loginEmAndamento = false;
      this.tratarErroLogin(erro);
    }
  }

  async aoClicarDeletar() {
    const { isConfirmed } = await Swal.fire({
      title: "Excluir conta permanentemente?",
      text: "Esta ação não pode ser desfeita. Todos os seus dados serão removidos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7B1A2E",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar"
    });

    if (isConfirmed) {
      try {
        await this.service.deletarConta(auth.currentUser);
        await Swal.fire("Conta removida", "Seus dados foram apagados com sucesso.", "success");
        window.location.href = "../index.html";
      } catch (erro) {
        this.tratarErroExclusao(erro);
      }
    }
  }

  tratarErroLogin(erro) {
    if (erro.code === "auth/wrong-password" || erro.code === "auth/invalid-credential") {
      Swal.fire({
        icon: "error",
        title: "Email ou Senha incorreta!",
        text: "Verifique seus dados.",
        confirmButtonColor: "#7B1A2E",
      });
    } else if (erro.code === "auth/user-not-found") {
      Swal.fire({
        icon: "error",
        title: "Conta não encontrada",
        text: "Deseja criar uma conta?",
        confirmButtonText: "IR PARA CADASTRO",
        confirmButtonColor: "#7B1A2E",
      }).then((result) => {
        if (result.isConfirmed) window.location.href = "../cadastro.html";
      });
    } else {
      Swal.fire({ icon: "error", title: "Erro ao entrar", text: erro.message });
    }
  }

  tratarErroExclusao(erro) {
    if (erro.code === "auth/requires-recent-login") {
      Swal.fire({
        icon: "info",
        title: "Ação de segurança",
        text: "Por favor, faça login novamente para confirmar a exclusão da conta."
      });
    } else {
      Swal.fire("Erro", "Falha ao excluir conta: " + erro.message, "error");
    }
  }
}

const ui = new LoginUI();

const btnEntrar = document.getElementById("btn-principal");
if (btnEntrar) {
  btnEntrar.addEventListener("click", () => ui.aoClicarEntrar());
}

const btnDeletar = document.getElementById("btn-deletar-conta");
if (btnDeletar) {
  btnDeletar.addEventListener("click", () => ui.aoClicarDeletar());
}