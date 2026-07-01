import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";

// Builds preview.html into a single self-contained HTML file (JS + CSS + fonts
// inlined) so the interactive Search Portal can be opened / rendered anywhere.
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    outDir: "dist-preview",
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000, // inline the woff2 fonts as data URIs
    rollupOptions: {
      input: path.resolve(__dirname, "preview.html"),
    },
  },
});
