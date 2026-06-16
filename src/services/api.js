/**
 * api.js — Centralized API service
 *
 * WHY THIS FILE EXISTS:
 * Instead of writing the full backend URL in every component,
 * we put ALL backend calls here. This means:
 * - If the backend URL ever changes, we fix it in ONE place
 * - Each page imports clean functions like fetchOrders() instead of raw URLs
 * - Auth headers or retry logic can be added here once and apply everywhere
 *
 * HOW THE URL IS RESOLVED:
 * - import.meta.env.VITE_API_URL is injected by Vite at build time
 * - In development:  set in .env → e.g. https://restaurant-bot-eqiv.onrender.com
 *                    (Vite's proxy also intercepts /api/* calls as a fallback
 *                     if you want to use the local mock server instead)
 * - In production:   set as an Environment Variable in Vercel's project settings
 *                    → https://restaurant-bot-eqiv.onrender.com
 *
 * IMPORTANT: VITE_* prefix is required. Vite strips all env vars that don't
 * start with VITE_ from the client bundle for security.
 */

import axios from 'axios';

// Read the backend base URL from Vite's env system.
// This is baked into the JS bundle at build time — not a runtime variable.
// Fallback to empty string (which enables the Vite dev proxy) if unset.
const BASE_URL = import.meta.env.VITE_API_URL || '';

// Create a single axios instance with the base URL pre-configured.
const apiClient = axios.create({
  baseURL: BASE_URL,

  // Render's free tier cold-starts can take up to 30–50 seconds after
  // inactivity. 30 seconds is safer than the previous 10-second timeout
  // to avoid false "backend unreachable" errors on first page load.
  timeout: 30000,

  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── ORDERS ──────────────────────────────────────────────────────────────────

/**
 * Fetches all orders from the backend (pending, preparing, and done).
 * Used by LiveOrders page on first load and OrderHistory page.
 */
export const fetchOrders = async () => {
  const response = await apiClient.get('/api/orders');
  return response.data;
};

/**
 * Updates the status of a specific order.
 * @param {string} orderId - The unique ID of the order
 * @param {string} status - New status: 'pending' | 'preparing' | 'done'
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await apiClient.patch(`/api/orders/${orderId}/status`, { status });
  return response.data;
};

// ─── MENU ─────────────────────────────────────────────────────────────────────

/**
 * Fetches all menu items (name, price, availability).
 * Used by MenuManagement page.
 */
export const fetchMenu = async () => {
  const response = await apiClient.get('/api/menu');
  return response.data;
};

/**
 * Adds a brand new menu item.
 * @param {Object} itemData - { name: string, price: number }
 */
export const addMenuItem = async (itemData) => {
  const response = await apiClient.post('/api/menu', itemData);
  return response.data;
};

/**
 * Updates an existing menu item (name, price, or availability).
 * @param {string} itemId - The ID of the menu item to update
 * @param {Object} updates - Fields to update (e.g., { available: false })
 */
export const updateMenuItem = async (itemId, updates) => {
  const response = await apiClient.patch(`/api/menu/${itemId}`, updates);
  return response.data;
};

/**
 * Permanently deletes a menu item.
 * @param {string} itemId - The ID of the menu item to delete
 */
export const deleteMenuItem = async (itemId) => {
  const response = await apiClient.delete(`/api/menu/${itemId}`);
  return response.data;
};

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

/**
 * Fetches analytics data: today's totals, most ordered item, daily chart data.
 * Used by Analytics page.
 */
export const fetchAnalytics = async () => {
  const response = await apiClient.get('/api/analytics');
  return response.data;
};

export default apiClient;
