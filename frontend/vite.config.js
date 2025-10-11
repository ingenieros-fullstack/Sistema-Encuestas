import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // 🧩 Cargar variables de entorno
  const env = loadEnv(mode, process.cwd());

  // 🔗 API del backend (siempre apunta al subpath /encuestas)
  process.env.VITE_API_URL = env.VITE_API_URL || "https://corehr.mx/encuestas";

  // 🌐 Debe ser raíz absoluta, no relativa
  const base = "/";

  console.log("🌍 API base configurada para build:", process.env.VITE_API_URL);
  console.log("📁 Ruta base configurada:", base);

  return {
    base, // ✅ Usa "/" para que los assets apunten a https://corehr.mx/assets/
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
    },
    define: {
      "process.env": {
        ...env,
        VITE_API_URL: process.env.VITE_API_URL,
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      assetsDir: "assets",
      emptyOutDir: true,
      manifest: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
