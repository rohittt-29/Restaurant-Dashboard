/**
 * Analytics.jsx — Business insights dashboard
 *
 * WHAT THIS PAGE SHOWS:
 * 1. Stat cards: Today's orders, today's revenue, most ordered item, avg order value
 * 2. Bar chart: Orders per day for the last 7 days
 *
 * WHY RECHARTS:
 * - Purpose-built for React (not a jQuery plugin wrapped in React)
 * - Composable API — you build charts by composing components like <BarChart>, <Bar>, etc.
 * - Responsive out of the box via <ResponsiveContainer>
 * - Lightweight: only import what you use
 *
 * DATA SOURCE:
 * All data comes from GET /analytics — the backend aggregates the numbers.
 * We don't do complex calculation here; the backend is better suited for database aggregations.
 */

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchAnalytics } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

/**
 * StatCard — A single metric display box
 * Extracted as a local component because it's used 4 times on this page
 * but nowhere else, so it doesn't need its own file.
 */
const StatCard = ({ icon, label, value, sub }) => (
  <div className="stat-card">
    <div className="stat-card__icon">{icon}</div>
    <div className="stat-card__body">
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      {/* Optional sub-label shown in smaller text below the main value */}
      {sub && <p className="stat-card__sub">{sub}</p>}
    </div>
  </div>
);

/**
 * CustomTooltip — Replaces Recharts' default tooltip with our branded style
 * The default tooltip is functional but generic — this matches our green theme.
 */
const CustomTooltip = ({ active, payload, label }) => {
  // Recharts passes `active` as true when the user is hovering over a bar
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">{label}</p>
        <p className="chart-tooltip__value">{payload[0].value} orders</p>
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  // Analytics data returned by GET /analytics
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics once on page load
  // Analytics doesn't need real-time updates — a snapshot is sufficient
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAnalytics();
        setAnalyticsData(data);
      } catch (err) {
        setError('Failed to load analytics. Is the backend running?');
        console.error('Analytics fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (isLoading) return <LoadingSpinner message="Loading analytics..." />;

  if (error) {
    return (
      <div className="page-container">
        <div className="error-banner">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="page-container">
        <EmptyState
          icon="📊"
          title="No analytics available"
          message="Analytics data will appear once orders start coming in."
        />
      </div>
    );
  }

  // Destructure expected fields from the analytics response.
  // Field names must EXACTLY match what the backend sends.
  // API returns: { ordersToday, revenueToday, mostOrdered, avgOrderValue, dailyOrders }
  const {
    ordersToday = 0,
    revenueToday = 0,
    mostOrdered = 'N/A',
    avgOrderValue = 0,
    dailyOrders = [], // Array of { date: 'Mon', count: 12 } for the bar chart
  } = analyticsData;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="page-subtitle">Today's performance at a glance</p>
        </div>
      </div>

      {/* STAT CARDS ROW — 4 key metrics */}
      <div className="stat-cards-grid">
        <StatCard
          icon="🛒"
          label="Orders Today"
          value={ordersToday}
          sub="total orders placed"
        />
        <StatCard
          icon="💰"
          label="Revenue Today"
          value={`₹${Number(revenueToday).toFixed(2)}`}
          sub="total earnings"
        />
        <StatCard
          icon="🏆"
          label="Most Ordered"
          value={mostOrdered}
          sub="most popular item"
        />
        <StatCard
          icon="📈"
          label="Avg Order Value"
          value={`₹${Number(avgOrderValue).toFixed(2)}`}
          sub="per order"
        />
      </div>

      {/* BAR CHART — Orders per day for the last 7 days */}
      <div className="chart-card">
        <h3 className="chart-card__title">Orders — Last 7 Days</h3>
        <p className="chart-card__subtitle">Daily order volume trend</p>

        {dailyOrders.length === 0 ? (
          <EmptyState
            icon="📉"
            title="No chart data yet"
            message="Data will appear once you have at least one day of orders."
          />
        ) : (
          /*
           * ResponsiveContainer makes the chart fill its parent width automatically.
           * Without it, the chart would have a fixed pixel width and break on mobile.
           */
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={dailyOrders}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              {/* Subtle grid lines help the eye track values horizontally */}
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

              {/* X axis shows the day labels (Mon, Tue, etc.) from the data */}
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#888' }}
              />

              {/* Y axis shows the count — hide axis line for cleaner look */}
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#888' }}
                allowDecimals={false}
              />

              {/* Our custom tooltip component replaces the default grey box */}
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdf4' }} />

              {/* The actual bars — filled with our green accent color */}
              <Bar
                dataKey="count"
                fill="#1D9E75"
                radius={[6, 6, 0, 0]} // Rounded top corners on bars — modern look
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Analytics;
