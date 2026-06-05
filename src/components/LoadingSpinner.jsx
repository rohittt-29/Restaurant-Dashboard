/**
 * LoadingSpinner.jsx — Reusable loading state component
 *
 * WHY THIS EXISTS:
 * Every page has a loading state while fetching data from the backend.
 * Instead of duplicating the spinner HTML in 4 pages, we use this component.
 * The message prop lets each page show a context-specific loading message.
 *
 * @param {string} message - Optional text shown below the spinner
 */

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      {/* CSS-animated spinner ring — no external library needed */}
      <div className="spinner" aria-label="Loading" role="status" />
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
