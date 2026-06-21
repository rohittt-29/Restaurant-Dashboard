/**
 * LiveOrders.jsx — The main page: real-time order feed
 *
 * Redesigned: full-width single-column list of horizontal order cards.
 * Sound alert kept, but title flash uses text only (no emoji).
 * No emojis anywhere.
 */

import { useEffect, useRef, useCallback } from 'react';
import useOrders from '../hooks/useOrders';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

/**
 * playNewOrderSound — Generates a pleasant alert tone using the Web Audio API
 */
const playNewOrderSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(1046.5, audioCtx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

// SVG icons for empty states and error
const InboxIcon = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,13 2,19 20,19 20,13" />
    <path d="M2 13l3-9h12l3 9" />
    <path d="M7 13h8" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="9" />
    <line x1="11" y1="7" x2="11" y2="11.5" />
    <circle cx="11" cy="15" r="0.5" fill="currentColor" />
  </svg>
);

const LiveOrders = () => {
  const { orders, isLoading, error, handleStatusUpdate, reload } = useOrders();

  const isFirstLoad = useRef(true);
  const previousOrderCount = useRef(0);

  const flashTitle = useCallback(() => {
    const originalTitle = document.title;
    let isFlashing = false;
    const interval = setInterval(() => {
      document.title = isFlashing ? originalTitle : '[New Order] OrderOS';
      isFlashing = !isFlashing;
    }, 600);
    setTimeout(() => {
      clearInterval(interval);
      document.title = originalTitle;
    }, 5000);
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) {
      if (!isLoading) {
        isFirstLoad.current = false;
        previousOrderCount.current = orders.length;
      }
      return;
    }

    if (orders.length > previousOrderCount.current) {
      playNewOrderSound();
      flashTitle();
      previousOrderCount.current = orders.length;
    }
  }, [orders.length, isLoading, flashTitle]);

const activeOrders = orders.filter(
  (order) => 
    order.status === 'awaiting_payment' || 
    order.status === 'pending' || 
    order.status === 'preparing'
);
  const completedOrders = orders.filter((order) => order.status === 'done');

  if (isLoading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-banner">
          <span className="error-banner__icon"><AlertIcon /></span>
          <div>
            <p className="error-banner__title">Backend Unreachable</p>
            <p className="error-banner__message">{error}</p>
          </div>
          <button className="btn btn--outline" onClick={reload}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page header with live indicator */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Live Orders</h2>
          <p className="page-subtitle">
            {activeOrders.length} active · {completedOrders.length} completed today
          </p>
        </div>
        <div className="live-indicator">
          <span className="live-indicator__dot" aria-hidden="true" />
          <span className="live-indicator__text">Live</span>
        </div>
      </div>

      {/* ACTIVE ORDERS SECTION */}
      <section aria-label="Active orders">
        {activeOrders.length === 0 ? (
          <EmptyState
            icon={<InboxIcon />}
            title="All caught up"
            message="No pending or preparing orders. New orders will appear here automatically."
          />
        ) : (
          <div className="orders-list">
            {activeOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </section>

      {/* COMPLETED ORDERS SECTION */}
      {completedOrders.length > 0 && (
        <section className="completed-section" aria-label="Completed orders">
          <h3 className="section-divider">
            <span>Completed Today ({completedOrders.length})</span>
          </h3>
          <div className="orders-list orders-list--muted">
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
