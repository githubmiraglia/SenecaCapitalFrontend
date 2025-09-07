// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",  // ✅ ensures assets resolve as relative paths
  optimizeDeps: {
    include: ["pdfjs-dist/build/pdf.worker.mjs"],
  },
  define: {
    global: {},
  },
  server: {
    port: 3000,
  },
});
