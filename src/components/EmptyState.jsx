/**
 * EmptyState.jsx — Reusable empty state component
 *
 * WHY THIS EXISTS:
 * When there's no data to show (no orders yet, no menu items, etc.),
 * we should show a helpful message instead of just a blank white screen.
 * Blank screens make users think something broke — empty states guide them.
 *
 * @param {string} icon - Emoji or icon to display prominently
 * @param {string} title - Short headline (e.g., "No orders yet")
 * @param {string} message - Helpful explanation of what to expect
 */

const EmptyState = ({ icon = '📭', title = 'Nothing here yet', message = '' }) => {
  return (
    <div className="empty-state">
      {/* Large icon/emoji makes the empty state friendly and easy to scan */}
      <div className="empty-state__icon">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>
      {/* Only render the message paragraph if a message was provided */}
      {message && <p className="empty-state__message">{message}</p>}
    </div>
  );
};

export default EmptyState;
