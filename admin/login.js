import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.js";
import Swal from "sweetalert2";

const EMAIL_ADMIN = "contato.liridelirios@gmail.com";

onAuthStateChanged(auth, (usuario) => {
    if (usuario && usuario.email === EMAIL_ADMIN) {
        window.location.href = "./estoque.html";
    }
});

document.getElementById("btn-entrar").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
        const resultado = await signInWithEmailAndPassword(auth, email, senha);

        if (resultado.user.email !== EMAIL_ADMIN) {
            Swal.fire({
                icon: "error",
                title: "Acesso negado",
                text: "Você não tem permissão para acessar esta área.",
                confirmButtonColor: "#7B1A2E"
            });
            return;
        }

        window.location.href = "./estoque.html";

    } catch (erro) {
        Swal.fire({
            icon: "error",
            title: "Erro ao entrar",
            text: "E-mail ou senha incorretos.",
            confirmButtonColor: "#7B1A2E"
        });
    }
});