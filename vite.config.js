import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
	'/uploads': 'https://cloneddrives.club',
      '/api': {
        target: 'https://cloneddrives.club',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})