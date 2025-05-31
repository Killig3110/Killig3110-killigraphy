import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 80,
    host: true,
    watch: {
      usePolling: true, // Use polling to detect file changes
      interval: 100, // Polling interval in milliseconds
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Backend server URL
        changeOrigin: true,
        secure: false, // If your backend uses HTTPS, set this to true
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api prefix when forwarding
      },
    }
  },
});