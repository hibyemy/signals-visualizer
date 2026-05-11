import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Cloudflare Pages compatibility
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  resolve: {
    alias: {
      'plotly.js/dist/plotly': 'plotly.js-basic-dist',
    },
  },
  optimizeDeps: {
    include: ['react-plotly.js', 'plotly.js-basic-dist'],
  },
})
