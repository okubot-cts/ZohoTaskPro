<<<<<<< HEAD
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/ZohoTaskPro/',
  plugins: [react()],
  build: {
    outDir: 'docs',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/zoho-api': {
        target: 'https://www.zohoapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zoho-api/, ''),
        secure: false,
      },
    },
  },
});
=======
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
}) 
>>>>>>> 27514c7 (ローカル作業分の一時コミット)
