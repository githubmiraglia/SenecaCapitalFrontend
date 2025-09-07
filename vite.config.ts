// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: ".", // garante que o Vite use a raiz atual (onde está o index.html)
  plugins: [react()],
  base: "./", // 🔑 deixa os caminhos relativos no build (./favicon.ico, ./src/...)
  build: {
    outDir: "dist", // saída do build
    emptyOutDir: true, // limpa a pasta dist antes de cada build
  },
  optimizeDeps: {
    include: ["pdfjs-dist/build/pdf.worker.mjs"],
  },
  define: {
    global: {}, // evita erro de dependências que usam "global"
  },
  server: {
    port: 3000,
    open: true, // abre no navegador ao rodar "npm run dev"
  },
});
