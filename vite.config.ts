import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://nae.grup.com.ng',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/api/, ''), // ⬅️ add this line
      },
    },
  },
})
