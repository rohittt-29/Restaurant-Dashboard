import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    /**
     * WHY A PROXY:
     * The browser blocks cross-origin requests (CORS) when the frontend at
     * localhost:5174 tries to directly call the backend at localhost:3000.
     *
     * Instead of requiring the backend to set CORS headers, we tell Vite to
     * act as a middleman: any request starting with /orders, /menu, /analytics,
     * or /socket.io gets SILENTLY forwarded to http://localhost:3000 by Vite's
     * own server. Since it's server-to-server, CORS rules don't apply.
     *
     * This means axios calls use relative URLs like '/orders' instead of
     * 'http://localhost:3000/orders', and the browser never sees a cross-origin request.
     */
    proxy: {
      // Proxy all REST API routes to the backend
      '/orders': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/menu': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/analytics': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Proxy Socket.IO WebSocket connection to the backend
      // ws: true enables WebSocket proxying (not just HTTP)
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,  // Critical: allows the WebSocket upgrade for Socket.IO
      },
    },
  },
})

