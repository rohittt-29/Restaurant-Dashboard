/**
 * BottomNav.jsx — Mobile bottom navigation bar
 * Redesigned: dark background matching sidebar, SVG icons, no emojis.
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Reusable SVG icons — same as Sidebar
const IconOrders = () => (
  <svg className="bottom-nav__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="12" height="3" rx="1" />
    <rect x="2" y="7" width="12" height="3" rx="1" />
    <rect x="2" y="12" width="7" height="2" rx="1" />
  </svg>
);

const IconHistory = () => (
  <svg className="bottom-nav__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <polyline points="8,5 8,8 10,10" />
  </svg>
);

const IconMenu = () => (
  <svg className="bottom-nav__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="4" x2="13" y2="4" />
    <line x1="3" y1="8" x2="13" y2="8" />
    <line x1="3" y1="12" x2="9" y2="12" />
  </svg>
);

const IconAnalytics = () => (
  <svg className="bottom-nav__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,12 5,8 8,10 11,5 14,7" />
    <line x1="2" y1="14" x2="14" y2="14" />
  </svg>
);

const IconLogout = () => (
  <svg className="bottom-nav__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 11l4-4-4-4" />
    <line x1="14" y1="7" x2="6" y2="7" />
    <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" />
  </svg>
);

const navItems = [
  { to: '/',          icon: <IconOrders />,    label: 'Orders'   },
  { to: '/history',   icon: <IconHistory />,   label: 'History'  },
  { to: '/menu',      icon: <IconMenu />,      label: 'Menu'     },
  { to: '/analytics', icon: <IconAnalytics />, label: 'Analytics'},
];

const BottomNav = () => {
  const { logout } = useAuth();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
          }
        >
          {item.icon}
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}

      <button
        onClick={logout}
        className="bottom-nav__item bottom-nav__item--logout"
        id="bottom-nav-logout-btn"
        aria-label="Log out of dashboard"
      >
        <IconLogout />
        <span className="bottom-nav__label">Logout</span>
      </button>
    </nav>
  );
};

export default BottomNav;
