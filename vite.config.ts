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
  server: {
    port: 5179,
    strictPort: true,
  },
  preview: {
    port: 4188,
    strictPort: true,
  },
});
