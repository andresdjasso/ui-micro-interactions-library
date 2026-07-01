import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Fixed ports so the recorder always knows where to point Chromium.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Only scan the main entry — keeps the dep optimizer from crawling the
  // built dist-preview/ single-file bundle.
  optimizeDeps: {
    entries: ["index.html"],
  },
  server: {
    port: 5179,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 4188,
    strictPort: true,
  },
});
