import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

const PORT = 5173;

// The host only ever knows a name and a URL. Where that URL points is a
// deployment decision, not a code one:
//   dev       → each remote's own server on localhost
//   build     → same-origin subpaths, filled by the bundled deploy (see
//               scripts/bundle-remotes.mjs)
//   anywhere  → set VITE_REMOTE_<NAME> to the origin that remote ships from,
//               and it is picked up without touching the host's code
const REMOTES = {
  catalog: { port: 5001, path: '/catalog' },
  cart: { port: 5002, path: '/cart' },
  checkout: { port: 5003, path: '/checkout' },
};

function resolveOrigins(env, isDev) {
  return Object.fromEntries(
    Object.entries(REMOTES).map(([name, { port, path }]) => {
      const override = env[`VITE_REMOTE_${name.toUpperCase()}`];
      const origin = override || (isDev ? `http://localhost:${port}` : path);
      return [name, origin.replace(/\/+$/, '')];
    }),
  );
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const origins = resolveOrigins(env, command === 'serve');

  return {
    plugins: [
      react(),
      federation({
        name: 'host',
        remotes: Object.fromEntries(
          Object.entries(origins).map(([name, origin]) => [
            name,
            `${origin}/assets/remoteEntry.js`,
          ]),
        ),
        shared: ['react', 'react-dom'],
      }),
    ],
    // The same map the federation plugin was given, so the UI can report the
    // real endpoints instead of guessing at ports.
    define: { __REMOTE_ORIGINS__: JSON.stringify(origins) },
    server: { port: PORT, strictPort: true },
    preview: { port: PORT, strictPort: true },
    build: {
      // The repo root's dist/ — Vercel serves the Output Directory relative to
      // the project Root Directory, which must be the repo root here so the
      // remotes are buildable at all. Emitting straight to ./dist means the
      // deploy works on Vercel's default Output Directory, with or without
      // vercel.json being honoured.
      outDir: '../dist',
      emptyOutDir: true,
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
      modulePreload: false,
    },
  };
});
