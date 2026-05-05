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
        redefinir: resolve(__dirname, 'redefinirSenha.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        estoque: resolve(__dirname, 'admin/estoque.html')
      },
    },
  },
})