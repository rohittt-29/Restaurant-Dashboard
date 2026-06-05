/**
 * StatusBadge.jsx — Color-coded status pill component
 *
 * WHY THIS IS A SEPARATE COMPONENT:
 * The status badge appears in multiple places: order cards, history table, etc.
 * By making it a component, we define the color logic ONCE.
 * If the design changes (e.g., "done" becomes purple), we fix it in one file.
 *
 * @param {string} status - 'pending' | 'preparing' | 'done'
 */

const StatusBadge = ({ status }) => {
  // Map each status string to a CSS class that controls the badge color
  // The classes are defined in index.css
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'badge badge--pending',
    },
    preparing: {
      label: 'Preparing',
      className: 'badge badge--preparing',
    },
    done: {
      label: 'Done',
      className: 'badge badge--done',
    },
  };

  // Fall back gracefully if an unknown status is passed (defensive programming)
  const config = statusConfig[status] || {
    label: status,
    className: 'badge badge--pending',
  };

  return <span className={config.className}>{config.label}</span>;
};

export default StatusBadge;
