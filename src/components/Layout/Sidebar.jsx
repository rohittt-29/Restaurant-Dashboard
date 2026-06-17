/**
 * Sidebar.jsx — Desktop navigation sidebar
 * Redesigned: dark background (#0F172A), clean text-only logo "OrderOS",
 * white pill active state, subtle logout button at bottom.
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// SVG icon components — no emojis
const IconOrders = () => (
  <svg className="sidebar__link-icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="12" height="3" rx="1" />
    <rect x="2" y="7" width="12" height="3" rx="1" />
    <rect x="2" y="12" width="7" height="2" rx="1" />
  </svg>
);

const IconHistory = () => (
  <svg className="sidebar__link-icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <polyline points="8,5 8,8 10,10" />
  </svg>
);

const IconMenu = () => (
  <svg className="sidebar__link-icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="4" x2="13" y2="4" />
    <line x1="3" y1="8" x2="13" y2="8" />
    <line x1="3" y1="12" x2="9" y2="12" />
  </svg>
);

const IconAnalytics = () => (
  <svg className="sidebar__link-icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,12 5,8 8,10 11,5 14,7" />
    <line x1="2" y1="14" x2="14" y2="14" />
  </svg>
);

const IconLogout = () => (
  <svg className="sidebar__link-icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 11l4-4-4-4" />
    <line x1="14" y1="7" x2="6" y2="7" />
    <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" />
  </svg>
);

const navItems = [
  { to: '/',          icon: <IconOrders />,   label: 'Live Orders'   },
  { to: '/history',   icon: <IconHistory />,  label: 'Order History' },
  { to: '/menu',      icon: <IconMenu />,     label: 'Menu'          },
  { to: '/analytics', icon: <IconAnalytics />,label: 'Analytics'     },
];

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <nav className="sidebar" aria-label="Main navigation">
      {/* Logo — text only, no icon */}
      <div className="sidebar__brand">
        <span className="sidebar__logo-text">
          ServeAI<span className="sidebar__logo-dot" />
        </span>
      </div>

      {/* Navigation links */}
      <ul className="sidebar__nav" role="list">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              {item.icon}
              <span className="sidebar__link-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer — logout only, no subtitle text */}
      <div className="sidebar__footer">
        <button
          onClick={logout}
          className="sidebar__logout"
          id="sidebar-logout-btn"
          aria-label="Log out of dashboard"
        >
          <IconLogout />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
