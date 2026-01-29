import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    viteReact(),
    tanstackRouter(),
    tailwindcss(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
  ],

  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "components", replacement: path.resolve(__dirname, "./src/components") },
      { find: "stores", replacement: path.resolve(__dirname, "./src/stores") },
      { find: "utils", replacement: path.resolve(__dirname, "./src/utils") },
      { find: "types", replacement: path.resolve(__dirname, "./src/types") },
      { find: "features", replacement: path.resolve(__dirname, "./src/features") },
    ],
  },

  // Prevent Vite from obscuring rust errors
  clearScreen: false,
  // Tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
