/**
 * App.jsx — Root component: routing + layout shell
 *
 * WHY THIS FILE EXISTS:
 * React Router needs a single root component that defines all routes.
 * This component also renders the persistent layout (Sidebar + BottomNav)
 * that surrounds every page — so adding a new page doesn't require
 * copy-pasting the navigation into each page file.
 *
 * LAYOUT STRATEGY:
 * - Sidebar: always visible on desktop (≥768px) via CSS
 * - BottomNav: always visible on mobile (<768px) via CSS
 * - <Outlet /> or <Routes>: renders the current page in the main content area
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import BottomNav from './components/Layout/BottomNav';
import LiveOrders from './pages/LiveOrders';
import OrderHistory from './pages/OrderHistory';
import MenuManagement from './pages/MenuManagement';
import Analytics from './pages/Analytics';

const App = () => {
  return (
    /*
     * BrowserRouter provides the routing context — all NavLink and useNavigate
     * calls anywhere in the tree will work because of this single wrapper.
     */
    <BrowserRouter>
      {/* Main layout wrapper: sidebar on left, content on right */}
      <div className="app-layout">
        {/* Sidebar is shown on desktop, hidden on mobile via CSS */}
        <Sidebar />

        {/* Main content area — this is where page components render */}
        <main className="app-main" id="main-content">
          <Routes>
            {/* Route "/" renders LiveOrders as the homepage */}
            <Route path="/" element={<LiveOrders />} />

            {/* Route "/history" renders the order history table */}
            <Route path="/history" element={<OrderHistory />} />

            {/* Route "/menu" renders the menu CRUD interface */}
            <Route path="/menu" element={<MenuManagement />} />

            {/* Route "/analytics" renders the stats and chart */}
            <Route path="/analytics" element={<Analytics />} />

            {/* Catch-all route — redirect unknown paths to homepage */}
            <Route path="*" element={<LiveOrders />} />
          </Routes>
        </main>

        {/* BottomNav is shown on mobile, hidden on desktop via CSS */}
        <BottomNav />
      </div>
    </BrowserRouter>
  );
};

export default App;
