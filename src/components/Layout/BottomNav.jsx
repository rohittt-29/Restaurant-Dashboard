/**
 * BottomNav.jsx — Mobile bottom navigation bar
 *
 * WHY BOTTOM NAV ON MOBILE:
 * The restaurant owner will use this on their phone.
 * Bottom navigation is the standard mobile pattern (used by Instagram, WhatsApp, etc.)
 * because thumbs naturally reach the bottom of the screen.
 * Sidebar navigation on mobile requires stretching to the top — bad UX.
 *
 * This component is HIDDEN on desktop via CSS (display: none above 768px breakpoint).
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Same nav items as Sidebar — kept DRY by importing from a shared constants file
// (For simplicity, defined inline here since Sidebar is the canonical nav definition)
const navItems = [
  { to: '/',          icon: '🟢', label: 'Orders'    },
  { to: '/history',   icon: '📋', label: 'History'   },
  { to: '/menu',      icon: '🍽️', label: 'Menu'      },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
];

const BottomNav = () => {
  const { logout } = useAuth();

  return (
    // role="navigation" with aria-label identifies this as a navigation region
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
          {/* Icon shown larger on mobile for easy tapping */}
          <span className="bottom-nav__icon" aria-hidden="true">{item.icon}</span>
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}

      {/* Logout button — styled identically to a nav item for visual consistency */}
      <button
        onClick={logout}
        className="bottom-nav__item bottom-nav__item--logout"
        id="bottom-nav-logout-btn"
        aria-label="Log out of dashboard"
      >
        <span className="bottom-nav__icon" aria-hidden="true">🚪</span>
        <span className="bottom-nav__label">Logout</span>
      </button>
    </nav>
  );
};

export default BottomNav;
