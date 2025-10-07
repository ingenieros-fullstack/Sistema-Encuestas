import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // 🧩 Cargar variables de entorno desde la carpeta actual del frontend
  const env = loadEnv(mode, path.resolve(__dirname, "."));

  // ✅ Forzar el valor de la API en caso de que Vite no lea el .env.production
  process.env.VITE_API_URL = env.VITE_API_URL || "https://corehr.mx/encuestas";

  console.log("🌍 API base configurada para build:", process.env.VITE_API_URL);

  return {
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
    },
  };
});
