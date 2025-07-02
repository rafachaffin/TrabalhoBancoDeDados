import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': '/views',
      '@components': '/views/components',
      '@pages': '/views/pages',
      '@contexts': '/views/contexts',
      '@services': '/views/services',
      '@hooks': '/views/hooks',
      '@models': '/models',
      '@controllers': '/controllers',
      '@utils': '/utils'
    }
  }
}) 