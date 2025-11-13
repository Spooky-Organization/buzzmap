import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true, // Listen on all addresses for Docker
    hmr: {
      clientPort: 3000, // HMR client port
    },
    watch: {
      usePolling: true, // Enable polling for Docker volume mounts
    },
    // Serve docs folder for documentation access
    fs: {
      allow: ['..'],
    },
  },
  // Copy docs to public folder during build
  publicDir: 'public',
})

