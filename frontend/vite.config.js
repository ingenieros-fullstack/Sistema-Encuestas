import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // 🔗 Cargar las variables desde la raíz del proyecto
  const env = loadEnv(mode, path.resolve(__dirname, '..'))

  return {
    plugins: [react()],
    server: {
      port: 5173,
    },
    define: {
      'process.env': env,
    },
  }
})
