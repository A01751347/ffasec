// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://serranom.com',
        changeOrigin: true
      }
    },
    historyApiFallback: true, // Importante para SPA
  }
})