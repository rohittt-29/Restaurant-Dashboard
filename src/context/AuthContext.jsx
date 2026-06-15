/**
 * AuthContext.jsx — Provides authentication state to the whole app
 *
 * WHY A CONTEXT:
 * Both Sidebar and BottomNav need to know if the user is logged in
 * (to show the Logout button). The Login page and App.jsx also need it.
 * Rather than prop-drilling through every component, React Context gives
 * any component instant access to auth state via useAuth().
 *
 * SESSION STORAGE:
 * We persist the auth flag in sessionStorage so the user stays logged in
 * when they refresh the page — but the session clears automatically when
 * the browser tab / window is closed (unlike localStorage which persists
 * forever). Perfect for a single-device restaurant dashboard.
 */

import { createContext, useContext, useState } from 'react';

// ─── CHANGE PASSWORD HERE ─────────────────────────────────────────────────────
// To update the password, simply change the string below.
const DASHBOARD_PASSWORD = 'admin123';
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Read the saved session flag — true if user authenticated this tab session
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('dashboard_auth') === 'true'
  );

  /**
   * login — checks the submitted password against DASHBOARD_PASSWORD
   * Returns true on success (so LoginPage can react), false on failure.
   */
  const login = (password) => {
    if (password === DASHBOARD_PASSWORD) {
      sessionStorage.setItem('dashboard_auth', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  /**
   * logout — clears the session flag and sends the user back to Login
   */
  const logout = () => {
    sessionStorage.removeItem('dashboard_auth');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Convenience hook — import useAuth() anywhere instead of useContext(AuthContext)
export const useAuth = () => useContext(AuthContext);
