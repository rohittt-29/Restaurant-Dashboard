/**
 * OrderHistory.jsx — Filterable table of all past orders
 *
 * Redesigned: clean full-width table, alternating row backgrounds,
 * small status pills, stripped ORDER_CONFIRMED prefix from items,
 * no emojis.
 */

import { useState, useEffect, useMemo } from 'react';
import { fetchOrders } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

// SVG icons
const SearchIcon = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7" />
    <line x1="15" y1="15" x2="20" y2="20" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="9" />
    <line x1="11" y1="7" x2="11" y2="11.5" />
    <circle cx="11" cy="15" r="0.5" fill="currentColor" />
  </svg>
);

const OrderHistory = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const data = await fetchOrders();
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAllOrders(sorted);
      } catch (err) {
        setError('Failed to load order history. Is the backend running?');
        console.error('OrderHistory fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter;
      const matchesDate =
        !dateFilter ||
        new Date(order.createdAt).toISOString().slice(0, 10) === dateFilter;
      return matchesStatus && matchesDate;
    });
  }, [allOrders, statusFilter, dateFilter]);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  /**
   * formatItems — strips ORDER_CONFIRMED prefix if present, then shows item names
   * Handles both array of item objects and raw text strings
   */
  const formatItems = (items) => {
    if (!items) return '—';
    // Guard against non-array values (raw string from old data)
    if (!Array.isArray(items)) {
      return String(items).replace(/ORDER_CONFIRMED\s*/gi, '').trim() || '—';
    }
    if (items.length === 0) return '—';
    return items
      .map((item) => {
        if (item && typeof item === 'object' && item.name) {
          const cleanName = String(item.name)
            .replace(/ORDER_CONFIRMED\s*/gi, '')
            .trim();
          const qty = item.qty ?? item.quantity ?? 1;
          return `${cleanName} ×${qty}`;
        }
        if (typeof item === 'string') {
          return item.replace(/ORDER_CONFIRMED\s*/gi, '').trim();
        }
        return String(item);
      })
      .filter(Boolean)
      .join(', ');
  };

  if (isLoading) return <LoadingSpinner message="Loading order history..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Order History</h2>
          <p className="page-subtitle">{filteredOrders.length} orders shown</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="filter-bar__group">
          <label htmlFor="date-filter" className="filter-bar__label">Date</label>
          <input
            id="date-filter"
            type="date"
            className="filter-bar__input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div className="filter-bar__group">
          <label htmlFor="status-filter" className="filter-bar__label">Status</label>
          <select
            id="status-filter"
            className="filter-bar__select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="done">Done</option>
          </select>
        </div>

        {(statusFilter !== 'all' || dateFilter) && (
          <button
            className="btn btn--ghost"
            onClick={() => {
              setStatusFilter('all');
              setDateFilter('');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="error-banner">
          <span className="error-banner__icon"><AlertIcon /></span>
          <p>{error}</p>
        </div>
      )}

      {/* ORDERS TABLE */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<SearchIcon />}
          title="No orders found"
          message="Try adjusting your filters, or no orders have been placed yet."
        />
      ) : (
        <div className="table-wrapper">
          <table className="orders-table" aria-label="Order history table">
            <thead>
              <tr>
                <th scope="col">Date &amp; Time</th>
                <th scope="col">Customer</th>
                <th scope="col">Items</th>
                <th scope="col">Total</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="orders-table__row">
                  <td className="orders-table__cell orders-table__cell--date">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="orders-table__cell">
                    <span className="orders-table__phone">
                      {order.customerPhone || 'Unknown'}
                    </span>
                  </td>
                  <td className="orders-table__cell orders-table__cell--items">
                    {formatItems(order.items)}
                  </td>
                  <td className="orders-table__cell orders-table__cell--amount">
                    ₹{Number(order.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="orders-table__cell">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
