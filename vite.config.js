import { resolve } from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cadastro: resolve(__dirname, 'cadastro.html'),
        carrinho: resolve(__dirname, 'carrinho.html'),
        login: resolve(__dirname, 'login.html'),
        minhaConta: resolve(__dirname, 'minha-conta.html'),
        meusPedidos: resolve(__dirname, 'meus-pedidos.html'),
        meusDados: resolve(__dirname, 'meus-dados.html'),
        enderecos: resolve(__dirname, 'enderecos.html'),
        esqueciSenha: resolve(__dirname, 'esqueciSenha.html'),
        redefinirSenha: resolve(__dirname, 'redefinirSenha.html'),
        sucesso: resolve(__dirname, 'sucesso.html'),
        politica: resolve(__dirname, 'politica.html'),
        'admin/login': resolve(__dirname, 'admin/login.html'),
        'admin/index': resolve(__dirname, 'admin/index.html'),
        'admin/estoque': resolve(__dirname, 'admin/estoque.html'),
      },
      
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      }
    },
  },
})