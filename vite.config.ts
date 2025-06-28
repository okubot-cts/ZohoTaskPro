import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/ZohoTaskPro/' : '/',
  plugins: [react()],
  build: {
    outDir: 'docs',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3000,
    open: true,
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
