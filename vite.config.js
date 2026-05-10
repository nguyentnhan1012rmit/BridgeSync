import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (err.code === 'ECONNREFUSED') {
              res.writeHead(502, { 'Content-Type': 'text/plain' });
              res.end('Backend server is starting up...');
            }
          });
        },
      },
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
  },
})
