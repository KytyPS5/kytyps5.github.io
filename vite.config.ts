import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages organization site: https://kytyps5.github.io/
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2022",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/framer-motion")) return "motion";
          if (id.includes("node_modules/@radix-ui")) return "radix-ui";
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-router")
          ) {
            return "react-vendor";
          }
        },
      },
    },
  },
});
