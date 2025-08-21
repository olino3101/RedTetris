import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const DOMAIN_NAME = process.env.DOMAIN_NAME || "localhost"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [DOMAIN_NAME]
  }
})
