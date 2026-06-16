import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env variables for the current mode (development / production)
  // so we can read VITE_API_URL inside this config file.
  const env = loadEnv(mode, process.cwd(), '')

  // The backend origin — e.g. http://localhost:3000 in dev
  // or https://restaurant-bot-eqiv.onrender.com in production.
  // Falls back to localhost:3000 if the env var is not set.
  const backendUrl = env.VITE_API_URL || 'http://localhost:3000'

  return {
    plugins: [react()],

    build: {
      // Output directory for Vercel — default is 'dist', Vercel auto-detects it
      outDir: 'dist',
      // Generate source maps in production for easier debugging on Sentry / DevTools
      sourcemap: false,
    },

    server: {
      /**
       * historyApiFallback: for dev only.
       * React Router needs the dev server to always serve index.html for unknown
       * paths, so /analytics refreshes work locally.
       * On Vercel this is handled by vercel.json rewrites instead.
       */
      historyApiFallback: true,

      /**
       * WHY A PROXY (dev only):
       * In dev, VITE_API_URL can still point at the Render backend or at
       * localhost:3000 (mock server). The proxy here proxies any /api/* and
       * /socket.io/* requests to the backend so we avoid CORS in dev.
       *
       * In production (Vercel build), this proxy block is IGNORED — the browser
       * talks directly to VITE_API_URL (Render). CORS must be allowed on the
       * backend for this to work.
       */
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/socket.io': {
          target: backendUrl,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})
