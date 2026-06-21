/**
 * useOrders.js — Custom hook that manages the live orders state
 *
 * WHY THIS HOOK EXISTS:
 * The LiveOrders page needs to do two things at once:
 * 1. Fetch existing orders from the REST API when the page first loads
 * 2. Add new orders in real time via Socket.IO as they come in
 *
 * Combining both into one hook keeps the page component clean —
 * it just calls useOrders() and gets back a live-updating list.
 *
 * If we removed this hook and put this logic directly in the page,
 * the page would become a mess of useEffect, useState, and socket calls mixed together.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchOrders, updateOrderStatus } from '../services/api';
import useSocket from './useSocket';

/**
 * useOrders — Fetches initial orders and merges real-time new orders
 *
 * @returns {{
 *   orders: Array,           - All orders (sorted: active first, done at bottom)
 *   isLoading: boolean,      - True while the first fetch is in progress
 *   error: string|null,      - Error message if backend is unreachable
 *   handleStatusUpdate: Function - Updates an order's status and syncs with backend
 * }}
 */
const useOrders = () => {
  // The master list of all orders shown in the UI
  const [orders, setOrders] = useState([]);

  // Loading state — true during the initial fetch, shown as a spinner in the UI
  const [isLoading, setIsLoading] = useState(true);

  // Error state — set when the backend is down or API call fails
  const [error, setError] = useState(null);

  // Fetches all current orders from the backend REST API
  // Called once on mount to populate the list before socket events start
  const loadInitialOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous error

      const data = await fetchOrders();

      // Sort orders: pending/preparing first (active work), done orders at the bottom
      const sortedOrders = sortOrders(data);
      setOrders(sortedOrders);
    } catch (err) {
      // Backend is probably down — show a friendly error message instead of crashing
      setError('Could not connect to the backend. Please check your connection and try again.');
      console.error('Failed to fetch orders:', err);
    } finally {
      // Always turn off loading, even if the fetch failed
      setIsLoading(false);
    }
  }, []);

  // Load orders when the hook is first used
  useEffect(() => {
    loadInitialOrders();
  }, [loadInitialOrders]);

  // This function is called by useSocket every time a 'new_order' event arrives
  // We use useCallback so the function reference stays stable and doesn't re-trigger the socket hook
  const handleNewOrder = useCallback((newOrder) => {
    setOrders((previousOrders) => {
      // Add the new order at the TOP of the list so it's immediately visible
      // Then re-sort to ensure active orders stay above done orders
      return sortOrders([newOrder, ...previousOrders]);
    });
  }, []);

  // Connect to Socket.IO and listen for new orders
  // When a customer orders via WhatsApp, this fires instantly — no page refresh needed
  useSocket('new_order', handleNewOrder);

  /**
   * Updates the status of an order both in the UI (immediately) and on the backend
   *
   * WHY OPTIMISTIC UPDATE:
   * We update the UI first before the API responds.
   * This makes the button feel instant — the owner doesn't see a frozen screen.
   * If the API call fails, we revert the change and show an error.
   *
   * @param {string} orderId - The order to update
   * @param {string} newStatus - 'pending' | 'preparing' | 'done'
   */
  const handleStatusUpdate = useCallback(async (orderId, newStatus) => {
    // Save the current orders list in case we need to roll back on API failure
    const previousOrders = orders;

    // Optimistic update — change status in UI immediately
    setOrders((prev) =>
      sortOrders(
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      )
    );

    try {
      // Sync the status change with the backend database
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      // API call failed — roll back to the original list so the UI stays accurate
      console.error('Failed to update order status:', err);
      setOrders(previousOrders);
      alert('Failed to update order status. Please try again.');
    }
  }, [orders]);

  return { orders, isLoading, error, handleStatusUpdate, reload: loadInitialOrders };
};

/**
 * sortOrders — Puts active orders first, done orders at the bottom
 * Within each group, newest orders appear first (by createdAt timestamp)
 *
 * WHY: Restaurant owners need to see what needs action immediately.
 * Completed orders should be visible but not in the way.
 *
 * @param {Array} orderList - The unsorted orders array
 * @returns {Array} - Sorted orders array
 */
const sortOrders = (orderList) => {
 const statusPriority = {
  awaiting_payment: -1,  // Sabse upar — action chahiye jaldi
  pending: 0,
  preparing: 1,
  done: 2,
}
  return [...orderList].sort((a, b) => {
    // First sort by status priority (pending before preparing before done)
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;

    // Within the same status group, show newest orders first
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

export default useOrders;
