/**
 * OrderCard.jsx — Displays a single order with all its details and action buttons
 *
 * WHY THIS IS A SEPARATE COMPONENT:
 * The LiveOrders page renders a list of these cards.
 * Keeping each card as its own component means:
 * - The card's internal logic (which buttons to show) is isolated
 * - LiveOrders.jsx stays clean — it just maps orders to <OrderCard /> elements
 * - If card design changes, we edit only this file
 *
 * @param {Object} order - The order data object from the backend
 * @param {Function} onStatusUpdate - Called when owner clicks a status button
 */

import StatusBadge from './StatusBadge';

const OrderCard = ({ order, onStatusUpdate }) => {
  // Format the order timestamp into a human-readable time string
  // Example: "8:45 PM" — owners care about the TIME, not the full date on the live view
  const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Also show the date if the order is from a previous day
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  const isToday =
    new Date(order.createdAt).toDateString() === new Date().toDateString();

  // Format items list into a readable string
  // Expected format: [{ name: "Biryani", qty: 2, price: 150 }, ...]
  const formatItems = (items) => {
    if (!items || items.length === 0) return 'No items';
    return items
      .map((item) => `${item.name} ×${item.qty || 1}`)
      .join(', ');
  };

  // Format the WhatsApp number for display
  // Strip country code prefix if present for cleaner display (e.g., +91 98765 43210)
  const formatPhone = (phone) => {
    if (!phone) return 'Unknown';
    // Format: remove non-digits then format as Indian number if 12 digits with country code
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      const local = digits.slice(2);
      return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
    }
    return phone;
  };

  return (
    <div className={`order-card order-card--${order.status}`}>
      {/* Card header: phone number + status badge + time */}
      <div className="order-card__header">
        <div className="order-card__customer">
          {/* WhatsApp icon indicates this came from WhatsApp */}
          <span className="order-card__whatsapp-icon">📱</span>
          <span className="order-card__phone">{formatPhone(order.customerPhone)}</span>
        </div>
        <div className="order-card__meta">
          <StatusBadge status={order.status} />
          <span className="order-card__time">
            {/* Show date only if order is from a previous day */}
            {isToday ? orderTime : `${orderDate}, ${orderTime}`}
          </span>
        </div>
      </div>

      {/* Items section — the most important info for the kitchen */}
      <div className="order-card__items">
        <p className="order-card__items-label">Order:</p>
        <p className="order-card__items-list">{formatItems(order.items)}</p>
      </div>

      {/* Order total — shown prominently so owner knows the revenue at a glance */}
      <div className="order-card__footer">
        <div className="order-card__total">
          <span className="order-card__total-label">Total</span>
          {/* ₹ is the Indian Rupee symbol — format with toFixed to always show 2 decimal places */}
          <span className="order-card__total-amount">₹{Number(order.totalAmount || 0).toFixed(2)}</span>
        </div>

        {/* Action buttons — only show relevant buttons based on current status */}
        <div className="order-card__actions">
          {/* "Mark as Preparing" only appears when order is still pending */}
          {order.status === 'pending' && (
            <button
              className="btn btn--preparing"
              onClick={() => onStatusUpdate(order._id, 'preparing')}
              aria-label={`Mark order from ${order.customerPhone} as preparing`}
            >
              🍳 Preparing
            </button>
          )}

          {/* "Mark as Done" appears when order is being prepared */}
          {order.status === 'preparing' && (
            <button
              className="btn btn--done"
              onClick={() => onStatusUpdate(order._id, 'done')}
              aria-label={`Mark order from ${order.customerPhone} as done`}
            >
              ✅ Done
            </button>
          )}

          {/* Done orders show a simple confirmation — no action needed */}
          {order.status === 'done' && (
            <span className="order-card__done-label">Order completed</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
