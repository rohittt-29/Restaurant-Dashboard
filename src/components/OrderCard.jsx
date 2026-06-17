/**
 * OrderCard.jsx — Horizontal order card spanning full width
 *
 * Redesigned layout:
 * Left column:  customer number + time + status badge
 * Middle:       items list
 * Right:        total amount + action buttons
 *
 * No emojis — clean text and SVG only.
 */

import StatusBadge from './StatusBadge';

const OrderCard = ({ order, onStatusUpdate }) => {
  const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  const isToday =
    new Date(order.createdAt).toDateString() === new Date().toDateString();

  const formatItems = (items) => {
    // Guard: items might not be an array (e.g. raw string from old socket events)
    if (!items) return 'No items';
    if (!Array.isArray(items)) return String(items);
    if (items.length === 0) return 'No items';
    return items
      .map((item) => {
        const name = item?.name || String(item);
        const qty = item?.qty ?? item?.quantity ?? 1;
        return `${name} ×${qty}`;
      })
      .join(', ');
  };

  const formatPhone = (phone) => {
    if (!phone) return 'Unknown';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      const local = digits.slice(2);
      return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
    }
    return phone;
  };

  return (
    <div className={`order-card order-card--${order.status}`}>
      {/* Left column: customer + time + badge */}
      <div className="order-card__left">
        <span className="order-card__phone">{formatPhone(order.customerPhone)}</span>
        <span className="order-card__time">
          {isToday ? orderTime : `${orderDate}, ${orderTime}`}
        </span>
        <div className="order-card__badge-wrap">
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Middle column: items */}
      <div className="order-card__middle">
        <p className="order-card__items-label">Items</p>
        <p className="order-card__items-list">{formatItems(order.items)}</p>
      </div>

      {/* Right column: total + actions */}
      <div className="order-card__right">
        <span className="order-card__total-amount">
          ₹{Number(order.totalAmount || 0).toFixed(2)}
        </span>

        <div className="order-card__actions">
          {order.status === 'pending' && (
            <button
              className="btn btn--preparing btn--sm"
              onClick={() => onStatusUpdate(order._id, 'preparing')}
              aria-label={`Mark order from ${order.customerPhone} as preparing`}
            >
              Preparing
            </button>
          )}

          {order.status === 'preparing' && (
            <button
              className="btn btn--done btn--sm"
              onClick={() => onStatusUpdate(order._id, 'done')}
              aria-label={`Mark order from ${order.customerPhone} as done`}
            >
              Done
            </button>
          )}

          {order.status === 'done' && (
            <span className="order-card__done-label">Completed</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
