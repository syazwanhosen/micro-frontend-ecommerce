import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

const PORT = 5173;

// In a real deployment these would be per-environment URLs (CDN, S3, k8s
// ingress…). Each remote ships on its own schedule; the host only knows a URL.
const remotes = {
  catalog: 'http://localhost:5001/assets/remoteEntry.js',
  cart: 'http://localhost:5002/assets/remoteEntry.js',
  checkout: 'http://localhost:5003/assets/remoteEntry.js',
};

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host',
      remotes,
      shared: ['react', 'react-dom'],
    }),
  ],
  server: { port: PORT, strictPort: true },
  preview: { port: PORT, strictPort: true },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    modulePreload: false,
  },
});
