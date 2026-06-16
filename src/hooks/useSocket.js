/**
 * useSocket.js — Custom hook for managing the Socket.IO connection
 *
 * WHY THIS EXISTS AS A SEPARATE HOOK:
 * Socket.IO needs careful lifecycle management:
 * - Connect when the component mounts
 * - Listen for events
 * - DISCONNECT when the component unmounts (otherwise you get duplicate listeners
 *   and memory leaks every time React re-renders)
 *
 * Putting this in a hook means any page can subscribe to real-time events
 * with just one line, without worrying about cleanup.
 *
 * HOW THE URL IS RESOLVED:
 * - import.meta.env.VITE_API_URL is injected by Vite at build time
 * - In dev:  can be http://localhost:3000 or the Render URL
 *            (Vite also proxies /socket.io → backend if proxy target is set)
 * - In prod: resolves to https://restaurant-bot-eqiv.onrender.com
 *            The browser opens a WebSocket directly to the Render backend.
 *            CORS must be allowed on the backend for this to work.
 *
 * WHY NOT '/' ANYMORE:
 * '/' resolved to the Vite dev server in development (and Vercel in production).
 * Vercel is a static CDN — it has no Socket.IO server. Connecting to '/'
 * in production silently fails, meaning real-time orders never appear.
 */

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// The Socket.IO server URL — always the backend, not the Vite dev server.
// Falls back to '/' only if VITE_API_URL is not set (legacy dev behavior).
const SOCKET_URL = import.meta.env.VITE_API_URL || '/';

/**
 * useSocket — connects to the Socket.IO server and listens for a specific event
 *
 * @param {string} eventName - The event to listen for (e.g., 'new_order')
 * @param {Function} onEvent - Callback function called when the event fires
 * @returns {{ isConnected: boolean }} - Whether the socket is currently connected
 */
const useSocket = (eventName, onEvent) => {
  // useRef keeps the socket instance alive across re-renders without causing re-renders
  const socketRef = useRef(null);

  useEffect(() => {
    // Create the Socket.IO connection.
    // transports: ['websocket'] skips the polling fallback that can cause CORS
    // issues on some configurations. If you see connection errors, remove this
    // option to allow polling → websocket upgrade as normal.
    const socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      // Use websocket transport directly — avoids an extra HTTP polling request
      // that would need CORS preflight on the backend.
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Register the event listener
    socket.on(eventName, onEvent);

    // CLEANUP — called when the component unmounts
    return () => {
      socket.off(eventName, onEvent);
      socket.disconnect();
    };

    // We intentionally exclude onEvent from deps to avoid reconnecting on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName]);

  return {
    isConnected: socketRef.current?.connected ?? false,
  };
};

export default useSocket;
