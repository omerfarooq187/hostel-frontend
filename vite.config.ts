import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group React core libraries into a separate chunk
          vendor: ['react', 'react-dom', 'react-router-dom'], // add any other major dependencies you have
        },
      },
    },
    // Optional: adjust the chunk size warning limit (default is 500 kB)
    chunkSizeWarningLimit: 1000, // set to 1000 kB if you want to suppress warnings
  },
})