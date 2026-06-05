/**
 * OrderHistory.jsx — Filterable table of all past orders
 *
 * WHY A TABLE INSTEAD OF CARDS:
 * The history page is for reviewing data, not taking action.
 * Tables are better for scanning many rows quickly and comparing columns.
 * Cards are better for individual attention (like in LiveOrders).
 *
 * FILTERS:
 * - Date filter: owner might want to see yesterday's orders
 * - Status filter: might want to see only pending/preparing to find missed orders
 */

import { useState, useEffect, useMemo } from 'react';
import { fetchOrders } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const OrderHistory = () => {
  // All orders fetched from the backend — unfiltered source of truth
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state — controlled by the filter inputs at the top of the table
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'preparing' | 'done'
  const [dateFilter, setDateFilter] = useState('');         // ISO date string like '2024-01-15'

  // Fetch all orders once when the page mounts
  // This page doesn't need real-time updates — history is for reviewing, not monitoring
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const data = await fetchOrders();

        // Sort by newest first so the most recent orders appear at the top of history
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
  }, []); // Empty deps array = runs only once on mount

  /**
   * filteredOrders — computes the displayed orders by applying both filters
   *
   * WHY useMemo:
   * Filtering can be expensive with many orders.
   * useMemo caches the result and only recalculates when allOrders, statusFilter,
   * or dateFilter changes — not on every render.
   */
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      // Apply status filter — skip if set to 'all'
      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter;

      // Apply date filter — compare the date part only (ignore time)
      const matchesDate =
        !dateFilter ||
        new Date(order.createdAt).toISOString().slice(0, 10) === dateFilter;

      // Order must pass BOTH filters to be included
      return matchesStatus && matchesDate;
    });
  }, [allOrders, statusFilter, dateFilter]);

  // Format a timestamp into readable date + time
  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format items array into comma-separated readable string
  const formatItems = (items) => {
    if (!items || items.length === 0) return '—';
    return items.map((item) => `${item.name} ×${item.qty || 1}`).join(', ');
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

      {/* FILTER BAR — allows narrowing down the table */}
      <div className="filter-bar">
        {/* Date picker — filters orders to a specific day */}
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

        {/* Status dropdown */}
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

        {/* Clear filters button — resets both filters at once */}
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
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* ORDERS TABLE */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No orders found"
          message="Try adjusting your filters, or no orders have been placed yet."
        />
      ) : (
        <div className="table-wrapper">
          <table className="orders-table" aria-label="Order history table">
            <thead>
              <tr>
                <th scope="col">Date & Time</th>
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
                      📱 {order.customerPhone || 'Unknown'}
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
