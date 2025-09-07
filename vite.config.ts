// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["pdfjs-dist/build/pdf.worker.mjs"],
  },
  define: {
    global: {}, // ✅ Fixes "global is not defined" for plotly.js-dist-min
  },
  server: {
    port: 3000,
  },
  // 🔑 Ensure assets are served relative to index.html
  base: "./",
});
