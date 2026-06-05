/**
 * mock-server.js — Local test backend for the Restaurant Dashboard
 *
 * WHY THIS FILE EXISTS:
 * The real backend (your WhatsApp AI system) may not always be running during
 * frontend development. This mock server:
 *  - Runs on http://localhost:3000 (same port your real backend will use)
 *  - Implements ALL the same API endpoints the dashboard expects
 *  - Emits fake 'new_order' Socket.IO events every 30 seconds so you can
 *    test real-time notifications without a real WhatsApp message
 *  - Stores data in memory (resets when you restart the server)
 *
 * USAGE:
 *   node mock-server.js
 *   (in a separate terminal while npm run dev is also running)
 *
 * DELETE THIS FILE when your real backend is ready.
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

// Allow JSON request bodies (needed for POST and PATCH routes)
app.use(express.json());

// CORS: allow requests from any localhost port (Vite uses different ports)
app.use(cors({
  origin: /^http:\/\/localhost:\d+$/,  // Matches any localhost port
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));

// Create HTTP server and attach Socket.IO to it
// (Socket.IO needs to share the same HTTP server as Express)
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: /^http:\/\/localhost:\d+$/,  // Allow any localhost port
    methods: ['GET', 'POST'],
  },
});

// ─── IN-MEMORY DATA STORE ────────────────────────────────────────────────────
// In a real backend this would be MongoDB / PostgreSQL.
// We use simple arrays here — data resets when the server restarts.

let orders = [
  {
    _id: 'ord_001',
    customerPhone: '+919876543210',
    items: [
      { name: 'Chicken Biryani', qty: 2, price: 280 },
      { name: 'Raita', qty: 1, price: 40 },
    ],
    totalAmount: 600,
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
  },
  {
    _id: 'ord_002',
    customerPhone: '+919123456789',
    items: [
      { name: 'Paneer Butter Masala', qty: 1, price: 220 },
      { name: 'Naan', qty: 3, price: 30 },
    ],
    totalAmount: 310,
    status: 'preparing',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
  },
  {
    _id: 'ord_003',
    customerPhone: '+918765432109',
    items: [
      { name: 'Veg Thali', qty: 2, price: 150 },
    ],
    totalAmount: 300,
    status: 'done',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    _id: 'ord_004',
    customerPhone: '+917654321098',
    items: [
      { name: 'Mutton Curry', qty: 1, price: 320 },
      { name: 'Rice', qty: 1, price: 60 },
      { name: 'Lassi', qty: 2, price: 80 },
    ],
    totalAmount: 540,
    status: 'done',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
];

let menuItems = [
  { _id: 'menu_001', name: 'Chicken Biryani',       price: 280, available: true  },
  { _id: 'menu_002', name: 'Paneer Butter Masala',  price: 220, available: true  },
  { _id: 'menu_003', name: 'Veg Thali',             price: 150, available: true  },
  { _id: 'menu_004', name: 'Mutton Curry',          price: 320, available: true  },
  { _id: 'menu_005', name: 'Naan',                  price: 30,  available: true  },
  { _id: 'menu_006', name: 'Raita',                 price: 40,  available: true  },
  { _id: 'menu_007', name: 'Rice',                  price: 60,  available: true  },
  { _id: 'menu_008', name: 'Lassi',                 price: 80,  available: false }, // Example: unavailable
];

// Counter used to generate unique IDs for new orders/menu items
let idCounter = 100;
const generateId = (prefix) => `${prefix}_${++idCounter}`;

// ─── ORDER ROUTES ─────────────────────────────────────────────────────────────

// GET /orders — returns all orders (used by LiveOrders and OrderHistory pages)
app.get('/orders', (req, res) => {
  console.log('[GET /orders] Returning', orders.length, 'orders');
  res.json(orders);
});

// PATCH /orders/:id/status — updates an order's status
// Body: { status: 'pending' | 'preparing' | 'done' }
app.patch('/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate the incoming status value
  const validStatuses = ['pending', 'preparing', 'done'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  // Find and update the order in the array
  const orderIndex = orders.findIndex((o) => o._id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: `Order ${id} not found` });
  }

  orders[orderIndex] = { ...orders[orderIndex], status };
  console.log(`[PATCH /orders/${id}/status] Updated to: ${status}`);
  res.json(orders[orderIndex]);
});

// ─── MENU ROUTES ──────────────────────────────────────────────────────────────

// GET /menu — returns all menu items
app.get('/menu', (req, res) => {
  console.log('[GET /menu] Returning', menuItems.length, 'items');
  res.json(menuItems);
});

// POST /menu — adds a new menu item
// Body: { name: string, price: number, available?: boolean }
app.post('/menu', (req, res) => {
  const { name, price, available = true } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'name and price are required' });
  }

  const newItem = { _id: generateId('menu'), name, price: Number(price), available };
  menuItems.push(newItem);
  console.log('[POST /menu] Added:', newItem.name);
  res.status(201).json(newItem);
});

// PATCH /menu/:id — updates name, price, or availability of a menu item
app.patch('/menu/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body; // Can be { name, price, available } or any subset

  const itemIndex = menuItems.findIndex((m) => m._id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: `Menu item ${id} not found` });
  }

  menuItems[itemIndex] = { ...menuItems[itemIndex], ...updates };
  console.log(`[PATCH /menu/${id}] Updated:`, updates);
  res.json(menuItems[itemIndex]);
});

// DELETE /menu/:id — removes a menu item permanently
app.delete('/menu/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = menuItems.length;
  menuItems = menuItems.filter((m) => m._id !== id);

  if (menuItems.length === initialLength) {
    return res.status(404).json({ error: `Menu item ${id} not found` });
  }

  console.log(`[DELETE /menu/${id}] Deleted`);
  res.json({ success: true });
});

// ─── ANALYTICS ROUTE ──────────────────────────────────────────────────────────

// GET /analytics — returns today's stats + last 7 days chart data
app.get('/analytics', (req, res) => {
  const today = new Date().toDateString();

  // Calculate today's stats from the in-memory orders array
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === today
  );

  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Find most ordered item by counting item name occurrences across all orders
  const itemCounts = {};
  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.qty || 1);
    });
  });
  const mostOrderedItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const averageOrderValue = orders.length
    ? orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / orders.length
    : 0;

  // Build last 7 days chart data — { date: 'Mon', count: 3 }
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyOrders = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i)); // Go back 6 days to today
    const dateString = date.toDateString();
    const dayLabel = dayNames[date.getDay()];
    const count = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === dateString
    ).length;
    return { date: dayLabel, count };
  });

  // Add some fake historical data so the chart isn't all zeros during testing
  const fakeHistorical = [5, 8, 12, 6, 9, 11, todayOrders.length];
  dailyOrders.forEach((day, i) => {
    if (day.count === 0) day.count = fakeHistorical[i]; // Use fake data for empty days
  });

  console.log('[GET /analytics] Returning analytics data');
  res.json({
    todayOrderCount: todayOrders.length || 4,  // Show 4 if none today (demo data)
    todayRevenue: todayRevenue || 1750,
    mostOrderedItem,
    averageOrderValue: Math.round(averageOrderValue) || 437,
    dailyOrders,
  });
});

// ─── SOCKET.IO ────────────────────────────────────────────────────────────────

// Track connected clients (for logging)
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Names and phone numbers used to generate realistic fake orders
const FAKE_CUSTOMERS = ['+919876501234', '+918765409876', '+917654398765', '+916543287654'];
const FAKE_ITEMS_POOL = [
  { name: 'Chicken Biryani', price: 280 },
  { name: 'Paneer Butter Masala', price: 220 },
  { name: 'Veg Thali', price: 150 },
  { name: 'Mutton Curry', price: 320 },
  { name: 'Naan', price: 30 },
  { name: 'Lassi', price: 80 },
  { name: 'Dal Makhani', price: 180 },
  { name: 'Butter Chicken', price: 300 },
];

/**
 * Emit a fake new order every 30 seconds to simulate a WhatsApp customer ordering.
 * This lets you test the real-time sound alert and card animation in the dashboard.
 *
 * WHY 30 SECONDS: Short enough to see it working during testing,
 * long enough that it's not annoying.
 */
setInterval(() => {
  // Pick 1–3 random items from the pool
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...FAKE_ITEMS_POOL].sort(() => Math.random() - 0.5);
  const selectedItems = shuffled.slice(0, itemCount).map((item) => ({
    ...item,
    qty: Math.floor(Math.random() * 2) + 1, // 1 or 2 of each
  }));

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const newOrder = {
    _id: generateId('ord'),
    customerPhone: FAKE_CUSTOMERS[Math.floor(Math.random() * FAKE_CUSTOMERS.length)],
    items: selectedItems,
    totalAmount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // Add to in-memory store so it also appears in GET /orders
  orders.unshift(newOrder);

  // Emit to ALL connected dashboard clients — this triggers the sound alert
  io.emit('new_order', newOrder);
  console.log(`[Socket.IO] Emitted new_order: ${newOrder.items.map(i => i.name).join(', ')} — ₹${newOrder.totalAmount}`);
}, 30000); // Every 30 seconds

// ─── START SERVER ─────────────────────────────────────────────────────────────

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   Mock Backend running on port 3001       ║');
  console.log('║   REST API:  http://localhost:3001        ║');
  console.log('║   Socket.IO: ws://localhost:3001          ║');
  console.log('║                                           ║');
  console.log('║   A fake new order will arrive every      ║');
  console.log('║   30 seconds to test real-time alerts.    ║');
  console.log('╚═══════════════════════════════════════════╝\n');
});
