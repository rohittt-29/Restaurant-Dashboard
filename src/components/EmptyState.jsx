/**
 * EmptyState.jsx — Reusable empty state component
 * Redesigned: geometric box icon with SVG instead of emoji
 */

// A simple generic "inbox" icon for empty states
const DefaultIcon = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="16" height="16" rx="2" />
    <line x1="3" y1="9" x2="19" y2="9" />
    <line x1="9" y1="9" x2="9" y2="19" />
  </svg>
);

const EmptyState = ({ icon, title = 'Nothing here yet', message = '' }) => {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        {/* If a custom SVG element is passed use it, otherwise use default */}
        {icon && typeof icon === 'object' ? icon : <DefaultIcon />}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {message && <p className="empty-state__message">{message}</p>}
    </div>
  );
};

export default EmptyState;
