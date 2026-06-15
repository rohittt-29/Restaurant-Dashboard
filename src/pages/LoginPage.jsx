/**
 * LoginPage.jsx — Password gate before the dashboard loads
 *
 * DESIGN DECISIONS:
 * - White card on the same --color-bg background used everywhere
 * - Green accent #1D9E75 matches the rest of the dashboard exactly
 * - Single password field only — no username complexity
 * - Error message appears inline below the input, not as a modal/toast
 * - "Show / Hide" password toggle for usability on mobile
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
      // Shake animation to give tactile feedback on failure
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPassword('');
    }
  };

  return (
    <div className="login-page">
      <div className={`login-card ${shaking ? 'login-card--shake' : ''}`}>

        {/* Brand header — same branding as the Sidebar */}
        <div className="login-brand">
          <span className="login-brand__icon">🍴</span>
          <div>
            <h1 className="login-brand__name">RestaurantOS</h1>
            <p className="login-brand__subtitle">Order Dashboard</p>
          </div>
        </div>

        <div className="login-divider" />

        <div className="login-body">
          <h2 className="login-title">Welcome back</h2>
          <p className="login-desc">Enter your password to access the dashboard</p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Password field with show/hide toggle */}
            <div className="login-field">
              <label className="login-label" htmlFor="dashboard-password">
                Password
              </label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">🔒</span>
                <input
                  id="dashboard-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(''); // Clear error as user types
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
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Inline error message */}
              {error && (
                <p className="login-error" role="alert" id="login-error-msg">
                  ⚠️ {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn--primary login-submit"
              disabled={!password}
              id="login-submit-btn"
            >
              Unlock Dashboard →
            </button>
          </form>
        </div>

        <p className="login-footer-note">
          🔐 Session expires when you close the browser tab
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
