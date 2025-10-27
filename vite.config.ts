// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },

  // So other devices on the LAN can reach dev server (and proxy)
  server: {
    host: true,          // listen on 0.0.0.0
    port: 5173,          // change if you already use this port
    proxy: {
      // We only proxy in DEV. In PROD we hit the full URL directly from env.
      "/api": {
        target: "http://192.168.0.112:9000",
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },

  // Make `vite preview` behave like dev when you test the build locally
  preview: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://192.168.0.112:9000",
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },

  // No special base; Coolify will serve at /
  base: "/",
});
