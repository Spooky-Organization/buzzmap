import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      clientPort: 3000,
    },
    watch: {
      usePolling: true,
    },
    fs: {
      allow: ['..'],
    },
  },
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          ui: ['lucide-react', 'tailwind-merge', 'clsx', 'sonner'],
          markdown: ['react-markdown', 'remark-gfm'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
