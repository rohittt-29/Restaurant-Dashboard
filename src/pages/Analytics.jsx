/**
 * Analytics.jsx — Business insights dashboard
 *
 * Redesigned:
 * - 4 stat cards in a row, no gaps — unified border treatment
 * - Colored dot accents instead of emoji icons
 * - Big bold numbers
 * - Chart takes full remaining width
 * - No emojis anywhere
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

// SVG icons for empty/error states
const ChartIcon = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,16 7,10 11,13 15,7 20,9" />
    <line x1="2" y1="19" x2="20" y2="19" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="9" />
    <line x1="11" y1="7" x2="11" y2="11.5" />
    <circle cx="11" cy="15" r="0.5" fill="currentColor" />
  </svg>
);

/**
 * StatCard — A single metric display box with colored dot accent
 */
const StatCard = ({ accentClass, label, value, sub }) => (
  <div className="stat-card">
    <p className="stat-card__label">
      <span className={`stat-card__accent ${accentClass}`} aria-hidden="true" />
      {label}
    </p>
    <p className="stat-card__value">{value}</p>
    {sub && <p className="stat-card__sub">{sub}</p>}
  </div>
);

/**
 * CustomTooltip — Branded dark tooltip for bar chart
 */
const CustomTooltip = ({ active, payload, label }) => {
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
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <span className="error-banner__icon"><AlertIcon /></span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<ChartIcon />}
          title="No analytics available"
          message="Analytics data will appear once orders start coming in."
        />
      </div>
    );
  }

  const {
    ordersToday = 0,
    revenueToday = 0,
    mostOrdered = 'N/A',
    avgOrderValue = 0,
    dailyOrders = [],
  } = analyticsData;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="page-subtitle">Today's performance at a glance</p>
        </div>
      </div>

      {/* STAT CARDS — 4 in a row, no gaps, unified border */}
      <div className="stat-cards-grid">
        <StatCard
          accentClass="stat-card__accent--orders"
          label="Orders Today"
          value={ordersToday}
          sub="total orders placed"
        />
        <StatCard
          accentClass="stat-card__accent--revenue"
          label="Revenue Today"
          value={`₹${Number(revenueToday).toFixed(2)}`}
          sub="total earnings"
        />
        <StatCard
          accentClass="stat-card__accent--popular"
          label="Most Ordered"
          value={mostOrdered}
          sub="most popular item"
        />
        <StatCard
          accentClass="stat-card__accent--avg"
          label="Avg Order Value"
          value={`₹${Number(avgOrderValue).toFixed(2)}`}
          sub="per order"
        />
      </div>

      {/* BAR CHART — full remaining width */}
      <div className="chart-card">
        <h3 className="chart-card__title">Orders — Last 7 Days</h3>
        <p className="chart-card__subtitle">Daily order volume trend</p>

        {dailyOrders.length === 0 ? (
          <EmptyState
            icon={<ChartIcon />}
            title="No chart data yet"
            message="Data will appear once you have at least one day of orders."
          />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dailyOrders}
              margin={{ top: 8, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                stroke="#F1F5F9"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94A3B8', fontFamily: 'Inter, sans-serif' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94A3B8', fontFamily: 'Inter, sans-serif' }}
                allowDecimals={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: '#F8FAFC' }}
              />
              <Bar
                dataKey="count"
                fill="#0F172A"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Analytics;
