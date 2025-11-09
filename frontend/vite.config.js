import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { //if we are under /api route, then do target localhost:3000 as proxy to apply cors
        target: "http://localhost:3000",
      }
    }
  }
})
