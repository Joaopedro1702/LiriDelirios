import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../admin/firebase.js';

    document.body.style.visibility = 'visible';

    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get('oobCode');

    if (!oobCode) {
      window.location.href = 'login.html';
    }

    // Indicador de força de senha
    const novaSenha = document.getElementById('nova-senha');
    const barras = [
      document.getElementById('barra1'),
      document.getElementById('barra2'),
      document.getElementById('barra3'),
      document.getElementById('barra4'),
    ];
    const forcaLabel = document.getElementById('forca-label');

    const cores = ['#e74c3c', '#e67e22', '#f1c40f', '#27ae60'];
    const labels = ['Muito fraca', 'Fraca', 'Boa', 'Forte'];

    novaSenha.addEventListener('input', () => {
      const val = novaSenha.value;
      let forca = 0;
      if (val.length >= 8) forca++;
      if (/[A-Z]/.test(val)) forca++;
      if (/[0-9]/.test(val)) forca++;
      if (/[^A-Za-z0-9]/.test(val)) forca++;

      barras.forEach((b, i) => {
        b.style.background = i < forca ? cores[forca - 1] : 'var(--borda)';
      });
      forcaLabel.textContent = val.length === 0 ? 'Força da senha' : labels[forca - 1] || 'Muito fraca';
    });

    // Redefinir senha
    document.getElementById('btn-redefinir').addEventListener('click', async () => {
      const senha = document.getElementById('nova-senha').value;
      const confirmar = document.getElementById('confirmar-senha').value;

      if (senha.length < 8) {
        alert('A senha deve ter pelo menos 8 caracteres.');
        return;
      }
      if (senha !== confirmar) {
        alert('As senhas não coincidem.');
        return;
      }

      try {
        await verifyPasswordResetCode(auth, oobCode);
        await confirmPasswordReset(auth, oobCode, senha);

        document.getElementById('form-redefinir').style.display = 'none';
        document.getElementById('sucesso').style.display = 'flex';
      } catch (erro) {
        alert('Link inválido ou expirado. Solicite um novo link de redefinição.');
      }
    });