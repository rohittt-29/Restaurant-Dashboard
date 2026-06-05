/**
 * main.jsx — Application entry point
 *
 * WHY THIS FILE EXISTS:
 * Vite needs a JavaScript entry point to start bundling.
 * This file mounts the React component tree into the HTML page.
 * It's deliberately kept minimal — all real logic lives in App.jsx.
 *
 * StrictMode: Enabled in development to catch common mistakes early
 * (like missing cleanup in useEffect). It has no effect in production.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Global styles — imported here so they apply to the whole app
import App from './App.jsx';

// Find the <div id="root"> in index.html and mount the entire React app inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
