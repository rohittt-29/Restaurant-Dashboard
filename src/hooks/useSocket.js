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
 */

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// WHY EMPTY STRING: Socket.IO will connect to the same origin as the page (Vite's port).
// Vite proxies '/socket.io' WebSocket traffic to http://localhost:3000 (see vite.config.js).
// This means the browser never makes a cross-origin WebSocket request — no CORS issue.
const SOCKET_URL = '/';

/**
 * useSocket — connects to the Socket.IO server and listens for a specific event
 *
 * @param {string} eventName - The event to listen for (e.g., 'new_order')
 * @param {Function} onEvent - Callback function called when the event fires
 *                             Receives the event payload as its argument
 * @returns {{ isConnected: boolean }} - Whether the socket is currently connected
 *
 * Usage:
 *   useSocket('new_order', (order) => setOrders(prev => [order, ...prev]));
 */
const useSocket = (eventName, onEvent) => {
  // useRef keeps the socket instance alive across re-renders WITHOUT causing re-renders itself
  // If we used useState for the socket, every status change would trigger a full re-render
  const socketRef = useRef(null);

  useEffect(() => {
    // Create the Socket.IO connection when this hook is first used
    // autoConnect: true means it tries to connect immediately
    const socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnectionAttempts: 5,         // Try to reconnect 5 times before giving up
      reconnectionDelay: 2000,         // Wait 2 seconds between each reconnection attempt
    });

    // Save reference so we can disconnect later
    socketRef.current = socket;

    // Register the event listener — this fires every time the server sends the event
    // For example: when a customer places a WhatsApp order, server emits 'new_order'
    socket.on(eventName, onEvent);

    // CLEANUP FUNCTION — React calls this when the component unmounts
    // This is CRITICAL: without it, old listeners stack up and 'new_order' fires multiple times
    return () => {
      socket.off(eventName, onEvent); // Remove this specific listener
      socket.disconnect();             // Close the WebSocket connection entirely
    };

    // We intentionally exclude onEvent from deps to avoid reconnecting on every render
    // The event name is stable (a string), so it's safe in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName]);

  return {
    // Expose connection state so components can show "Live" or "Disconnected" indicator
    isConnected: socketRef.current?.connected ?? false,
  };
};

export default useSocket;
