import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: false, // Désactive la minification des logs en production
  },
  optimizeDeps: {
    exclude: ["react-map-gl"],
  },
});
