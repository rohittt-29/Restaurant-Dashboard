/**
 * LiveOrders.jsx — The main page: real-time order feed
 *
 * HOW THIS PAGE WORKS:
 * 1. On first load: fetches all current orders from GET /orders via the useOrders hook
 * 2. While the backend processes WhatsApp orders: Socket.IO pushes new orders automatically
 * 3. Owner clicks buttons to update status → optimistic UI update + PATCH /orders/:id/status
 *
 * WHY SOCKET.IO HERE AND NOT ELSEWHERE:
 * This is the only page where INSTANT updates matter.
 * Menu and analytics can wait for a page refresh — order notifications cannot.
 * A customer expects their order to be seen within seconds of sending a WhatsApp message.
 */

import { useEffect, useRef, useCallback } from 'react';
import useOrders from '../hooks/useOrders';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

/**
 * playNewOrderSound — Generates a pleasant alert tone using the Web Audio API
 *
 * WHY WEB AUDIO API INSTEAD OF AN AUDIO FILE:
 * - No external audio file dependency (no 404 risk)
 * - Works immediately without loading delays
 * - Generates a recognizable "ding" programmatically
 * - The AudioContext is only created when needed (browser policy requires user interaction first)
 */
const playNewOrderSound = () => {
  try {
    // AudioContext is the entry point to the Web Audio API
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // OscillatorNode generates a waveform (the actual sound)
    const oscillator = audioCtx.createOscillator();

    // GainNode controls the volume — we'll ramp it down to create a fade-out effect
    const gainNode = audioCtx.createGain();

    // Connect: oscillator → volume control → speakers
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // 'sine' wave type produces a clean, pleasant tone (not harsh like 'square')
    oscillator.type = 'sine';

    // Play two notes: a high note then a slightly higher note — classic "ding-dong"
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);        // A5 note
    oscillator.frequency.setValueAtTime(1046.5, audioCtx.currentTime + 0.15); // C6 note

    // Start at full volume, then fade to silence over 0.5 seconds
    gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    // Start playing immediately, stop after 0.5 seconds
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (error) {
    // Some browsers block audio — fail silently rather than breaking the page
    console.warn('Could not play notification sound:', error);
  }
};

const LiveOrders = () => {
  // useOrders hook gives us all orders + real-time updates + status change handler
  const { orders, isLoading, error, handleStatusUpdate, reload } = useOrders();

  // Track whether this is the initial load so we don't play sound on first fetch
  // We only want the sound when a genuinely NEW order arrives via socket
  const isFirstLoad = useRef(true);

  // Track the previous orders count to detect when a new order actually arrived
  const previousOrderCount = useRef(0);

  // Flash a visual notification in the browser tab title when a new order arrives
  // This helps if the owner has the tab in the background
  const flashTitle = useCallback(() => {
    const originalTitle = document.title;
    let isFlashing = false;
    const interval = setInterval(() => {
      document.title = isFlashing ? originalTitle : '🔔 New Order!';
      isFlashing = !isFlashing;
    }, 600);
    // Stop flashing after 5 seconds and restore the original title
    setTimeout(() => {
      clearInterval(interval);
      document.title = originalTitle;
    }, 5000);
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) {
      // Mark first load as done once we have data
      if (!isLoading) {
        isFirstLoad.current = false;
        previousOrderCount.current = orders.length;
      }
      return;
    }

    // If orders count increased, a new order arrived via Socket.IO
    if (orders.length > previousOrderCount.current) {
      playNewOrderSound();
      flashTitle();
      previousOrderCount.current = orders.length;
    }
  }, [orders.length, isLoading, flashTitle]);

  // Separate active orders (pending/preparing) from completed ones
  // Active orders go at the top — done orders go in a separate "Completed" section
  const activeOrders = orders.filter(
    (order) => order.status === 'pending' || order.status === 'preparing'
  );
  const completedOrders = orders.filter((order) => order.status === 'done');

  // Show loading spinner while initial data is being fetched
  if (isLoading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  // Show error banner if backend connection failed, with a retry button
  if (error) {
    return (
      <div className="page-container">
        <div className="error-banner">
          <span className="error-banner__icon">⚠️</span>
          <div>
            <p className="error-banner__title">Backend Unreachable</p>
            <p className="error-banner__message">{error}</p>
          </div>
          {/* Allow the owner to retry without refreshing the whole page */}
          <button className="btn btn--outline" onClick={reload}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page header with live indicator dot */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Live Orders</h2>
          <p className="page-subtitle">
            {activeOrders.length} active · {completedOrders.length} completed today
          </p>
        </div>
        {/* Pulsing green dot shows Socket.IO is connected and listening */}
        <div className="live-indicator">
          <span className="live-indicator__dot" aria-hidden="true" />
          <span className="live-indicator__text">Live</span>
        </div>
      </div>

      {/* ACTIVE ORDERS SECTION — what needs attention right now */}
      <section aria-label="Active orders">
        {activeOrders.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="All caught up!"
            message="No pending or preparing orders. New orders will appear here automatically."
          />
        ) : (
          <div className="orders-grid">
            {activeOrders.map((order) => (
              // key prop is required by React to efficiently update the list
              // We use order._id (MongoDB ObjectId) as it's guaranteed unique
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </section>

      {/* COMPLETED ORDERS SECTION — shown separately below active work */}
      {completedOrders.length > 0 && (
        <section className="completed-section" aria-label="Completed orders">
          <h3 className="section-divider">
            <span>Completed Today ({completedOrders.length})</span>
          </h3>
          <div className="orders-grid orders-grid--muted">
            {completedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default LiveOrders;
