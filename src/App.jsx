/**
 * App.jsx — Root component: auth gate + routing + layout shell
 *
 * AUTH FLOW:
 * AuthProvider wraps the whole tree so every component can call useAuth().
 * Inside BrowserRouter, if isAuthenticated is false we render LoginPage
 * exclusively — the sidebar, nav and routes are never mounted at all.
 * Once the user logs in, isAuthenticated flips to true and the full
 * dashboard renders.
 *
 * LAYOUT STRATEGY:
 * - Sidebar: always visible on desktop (≥768px) via CSS
 * - BottomNav: always visible on mobile (<768px) via CSS
 * - <Routes>: renders the current page in the main content area
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar    from './components/Layout/Sidebar';
import BottomNav  from './components/Layout/BottomNav';
import LoginPage  from './pages/LoginPage';
import LiveOrders     from './pages/LiveOrders';
import OrderHistory   from './pages/OrderHistory';
import MenuManagement from './pages/MenuManagement';
import Analytics      from './pages/Analytics';

/**
 * DashboardShell — only rendered when the user is authenticated.
 * Keeps the auth-check logic separate from the layout/routing code.
 */
const DashboardShell = () => {
  const { isAuthenticated } = useAuth();

  // Show login page if not authenticated — nothing else renders
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    /*
     * BrowserRouter provides the routing context — all NavLink and useNavigate
     * calls anywhere in the tree will work because of this single wrapper.
     */
    <div className="app-layout">
      {/* Sidebar is shown on desktop, hidden on mobile via CSS */}
      <Sidebar />

      {/* Main content area — this is where page components render */}
      <main className="app-main" id="main-content">
        <Routes>
          {/* Route "/" renders LiveOrders as the homepage */}
          <Route path="/"          element={<LiveOrders />}     />

          {/* Route "/history" renders the order history table */}
          <Route path="/history"   element={<OrderHistory />}   />

          {/* Route "/menu" renders the menu CRUD interface */}
          <Route path="/menu"      element={<MenuManagement />} />

          {/* Route "/analytics" renders the stats and chart */}
          <Route path="/analytics" element={<Analytics />}      />

          {/* Catch-all route — redirect unknown paths to homepage */}
          <Route path="*"          element={<LiveOrders />}     />
        </Routes>
      </main>

      {/* BottomNav is shown on mobile, hidden on desktop via CSS */}
      <BottomNav />
    </div>
  );
};

const App = () => {
  return (
    /*
     * AuthProvider must wrap BrowserRouter so that LoginPage (which is
     * rendered inside BrowserRouter) can also call useAuth().
     */
    <AuthProvider>
      <BrowserRouter>
        <DashboardShell />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
