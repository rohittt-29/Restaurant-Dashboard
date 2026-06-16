/**
 * LoginPage.jsx — Password gate before the dashboard loads
 *
 * Redesigned: full-screen split layout
 * Left: dark panel (#0F172A) with product name & tagline
 * Right: white panel with clean minimal login form
 * No emojis — SVG icons only
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// SVG Icons
const LockIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="10" height="8" rx="1.5" />
    <path d="M5 7V5a3 3 0 016 0v2" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 2l12 12M6.7 6.7A2 2 0 0010 9.3M1 8s2.5-5 7-5c1.3 0 2.5.3 3.5.9M15 8s-2 3.8-7 5c-1 .2-2 .2-3-.1" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6.5" />
    <line x1="8" y1="5" x2="8" y2="8.5" />
    <circle cx="8" cy="11" r="0.5" fill="currentColor" />
  </svg>
);

const LoginPage = () => {
  const { login } = useAuth();

  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [shaking, setShaking]     = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = login(password);
    if (!ok) {
      setError('Wrong password, try again');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPassword('');
    }
  };

  return (
    <div className="login-page">
      {/* Left dark panel */}
      <div className="login-left">
        <div className="login-brand-logo">
          OrderOS
          <span className="login-brand-dot" />
        </div>

        <h1 className="login-left-headline">
          Smarter ordering<br />for your restaurant
        </h1>
        <p className="login-left-tagline">
          AI-powered ordering for restaurants — manage live orders, track your menu, and analyze performance in one place.
        </p>

        <div className="login-left-features">
          <div className="login-feature-item">
            <span className="login-feature-dot" />
            Real-time WhatsApp order processing
          </div>
          <div className="login-feature-item">
            <span className="login-feature-dot" />
            Live kitchen status updates
          </div>
          <div className="login-feature-item">
            <span className="login-feature-dot" />
            Revenue analytics & insights
          </div>
        </div>
      </div>

      {/* Right white form panel */}
      <div className="login-right">
        <div className={`login-form-wrap ${shaking ? 'login-form-wrap--shake' : ''}`}>
          <h2 className="login-form-title">Welcome back</h2>
          <p className="login-form-subtitle">Enter your password to continue</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="dashboard-password">
                Password
              </label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">
                  <LockIcon />
                </span>
                <input
                  id="dashboard-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className={`login-input ${error ? 'login-input--error' : ''}`}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  className="login-toggle"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {error && (
                <p className="login-error" role="alert" id="login-error-msg">
                  <AlertIcon />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn--primary login-submit"
              disabled={!password}
              id="login-submit-btn"
            >
              Access Dashboard
            </button>
          </form>

          <p className="login-footer-note">
            Session expires when you close the browser tab
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
