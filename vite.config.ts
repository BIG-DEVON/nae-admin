import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // Dev server (we'll proxy /api to your live server)
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://server.nasmehalloffame.com.ng', // ✅ your live base
        changeOrigin: true,
        // Keep this rewrite ONLY if your backend routes are at root (e.g. GET /gallery)
        // and you use "/api/..." on the frontend.
        rewrite: (p) => p.replace(/^\/api/, ''),
        // Leave TLS verification ON for a real cert (default is true)
        // secure: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
});
