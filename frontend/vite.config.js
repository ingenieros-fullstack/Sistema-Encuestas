import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // permite que el contenedor escuche en todas las interfaces
    port: 5173,        // puerto de tu docker-compose
    watch: {
      usePolling: true,  // fuerza a Vite a "escuchar" cambios dentro de Docker
    },
  },
})
