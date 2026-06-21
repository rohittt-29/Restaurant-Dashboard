import { useState, useEffect, useCallback } from 'react';
import { fetchOrders, updateOrderStatus } from '../services/api';
import useSocket from './useSocket';

const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInitialOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchOrders();
      const sortedOrders = sortOrders(data);
      setOrders(sortedOrders);
    } catch (err) {
      setError('Could not connect to the backend. Please check your connection and try again.');
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialOrders();
  }, [loadInitialOrders]);

  const handleNewOrder = useCallback((newOrder) => {
    setOrders((previousOrders) => {
      return sortOrders([newOrder, ...previousOrders]);
    });
  }, []);

  const handlePaymentConfirmed = useCallback((data) => {
    setOrders((previousOrders) =>
      sortOrders(
        previousOrders.map((order) =>
          order._id === data._id ? { ...order, status: data.status } : order
        )
      )
    );
  }, []);

  useSocket('new_order', handleNewOrder);
  useSocket('payment_confirmed', handlePaymentConfirmed);
  useSocket('order_status_updated', handlePaymentConfirmed);

  const handleStatusUpdate = useCallback(async (orderId, newStatus) => {
    const previousOrders = orders;

    setOrders((prev) =>
      sortOrders(
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      )
    );

    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('Failed to update order status:', err);
      setOrders(previousOrders);
      alert('Failed to update order status. Please try again.');
    }
  }, [orders]);

  return { orders, isLoading, error, handleStatusUpdate, reload: loadInitialOrders };
};

const sortOrders = (orderList) => {
  const statusPriority = {
    awaiting_payment: -1,
    pending: 0,
    preparing: 1,
    done: 2,
  };

  return [...orderList].sort((a, b) => {
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

export default useOrders;