/**
 * Sidebar.jsx — Desktop navigation sidebar
 *
 * WHY THIS EXISTS SEPARATELY FROM BottomNav:
 * On desktop (≥768px) we want a permanent left sidebar — standard dashboard pattern.
 * On mobile (<768px) we want a bottom tab bar — standard mobile app pattern.
 * CSS hides/shows each component depending on screen width, so only one renders visually.
 *
 * By keeping them as separate components:
 * - Each has its own HTML structure suited to its layout
 * - Styles for each don't interfere with each other
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Navigation items array — adding a new page only requires adding an entry here
const navItems = [
  { to: '/',         icon: '🟢', label: 'Live Orders'   },
  { to: '/history',  icon: '📋', label: 'Order History'  },
  { to: '/menu',     icon: '🍽️', label: 'Menu'           },
  { to: '/analytics',icon: '📊', label: 'Analytics'      },
];

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    // aria-label makes this accessible to screen readers as the main navigation landmark
    <nav className="sidebar" aria-label="Main navigation">
      {/* Logo / Brand area */}
      <div className="sidebar__brand">
        <span className="sidebar__brand-icon">🍴</span>
        <div>
          <h1 className="sidebar__brand-name">RestaurantOS</h1>
          <p className="sidebar__brand-subtitle">Order Dashboard</p>
        </div>
      </div>

      {/* Navigation links */}
      <ul className="sidebar__nav" role="list">
        {navItems.map((item) => (
          <li key={item.to}>
            {/*
             * NavLink automatically adds an "active" class when the current URL matches.
             * We use this to highlight the current page in the sidebar.
             * `end` prop on the root "/" ensures it's only active on exactly "/" not all routes
             */}
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <span className="sidebar__link-icon" aria-hidden="true">{item.icon}</span>
              <span className="sidebar__link-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer area — version info + logout button */}
      <div className="sidebar__footer">
        <p className="sidebar__footer-text">WhatsApp AI System</p>
        <button
          onClick={logout}
          className="btn btn--ghost sidebar__logout"
          id="sidebar-logout-btn"
          aria-label="Log out of dashboard"
        >
          <span aria-hidden="true">🚪</span> Logout
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
