import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl' // <--- 1. Importe isso

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // <--- 2. Adicione isso na lista
  ],
  server: {
    host: true // Libera para a rede
  }
})