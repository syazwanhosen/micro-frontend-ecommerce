import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

const PORT = 5002;

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'cart',
      filename: 'remoteEntry.js',
      exposes: {
        './CartBadge': './src/CartBadge.jsx',
        './CartPage': './src/CartPage.jsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: { port: PORT, strictPort: true, cors: true },
  preview: { port: PORT, strictPort: true, cors: true },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    modulePreload: false,
  },
});
