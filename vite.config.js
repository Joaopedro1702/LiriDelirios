import { resolve } from 'path'
import { defineConfig } from 'vite'

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