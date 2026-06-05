/**
 * api.js — Centralized API service
 *
 * WHY THIS FILE EXISTS:
 * Instead of writing axios.get('http://localhost:3000/...') in every component,
 * we put ALL backend calls here. This means:
 * - If the backend URL ever changes, we fix it in ONE place
 * - Each page imports clean functions like fetchOrders() instead of raw URLs
 * - Easy to add auth headers or error logging in one spot later
 */

import axios from 'axios';

// Base URL for all API calls.
// WHY EMPTY STRING: We use Vite's proxy (configured in vite.config.js) to forward
// requests to the backend. Setting this to '' means axios sends to '/orders', '/menu' etc.
// which go to Vite's own port — Vite then proxies them to http://localhost:3000.
// This avoids CORS entirely: the browser only ever talks to localhost:5174.
const BASE_URL = '';

// Create a single axios instance with the base URL pre-configured
// This avoids repeating the full URL in every function
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Fail after 10 seconds so the UI doesn't hang forever
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── ORDERS ──────────────────────────────────────────────────────────────────

/**
 * Fetches all orders from the backend (pending, preparing, and done)
 * Used by LiveOrders page on first load and OrderHistory page
 */
export const fetchOrders = async () => {
  const response = await apiClient.get('/orders');
  return response.data;
};

/**
 * Updates the status of a specific order
 * @param {string} orderId - The unique ID of the order
 * @param {string} status - New status: 'pending' | 'preparing' | 'done'
 *
 * Called when restaurant owner clicks "Mark as Preparing" or "Mark as Done"
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

// ─── MENU ─────────────────────────────────────────────────────────────────────

/**
 * Fetches all menu items (name, price, availability)
 * Used by MenuManagement page
 */
export const fetchMenu = async () => {
  const response = await apiClient.get('/menu');
  return response.data;
};

/**
 * Adds a brand new menu item
 * @param {Object} itemData - { name: string, price: number }
 */
export const addMenuItem = async (itemData) => {
  const response = await apiClient.post('/menu', itemData);
  return response.data;
};

/**
 * Updates an existing menu item (name, price, or availability)
 * @param {string} itemId - The ID of the menu item to update
 * @param {Object} updates - Fields to update (e.g., { available: false })
 */
export const updateMenuItem = async (itemId, updates) => {
  const response = await apiClient.patch(`/menu/${itemId}`, updates);
  return response.data;
};

/**
 * Permanently deletes a menu item
 * @param {string} itemId - The ID of the menu item to delete
 */
export const deleteMenuItem = async (itemId) => {
  const response = await apiClient.delete(`/menu/${itemId}`);
  return response.data;
};

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

/**
 * Fetches analytics data: today's totals, most ordered item, daily chart data
 * Used by Analytics page
 */
export const fetchAnalytics = async () => {
  const response = await apiClient.get('/analytics');
  return response.data;
};

export default apiClient;
