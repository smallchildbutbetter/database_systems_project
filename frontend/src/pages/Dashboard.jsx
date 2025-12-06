import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FaCoffee,
  FaDollarSign,
  FaMoneyBillWave,
  FaChartLine,
  FaChartBar,
  FaChartArea,
  FaBullseye,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import './Dashboard.css';

function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [supplierPrices, setSupplierPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsRes, supplierRes] = await Promise.all([
        axios.get('/api/dashboard/metrics'),
        axios.get('/api/suppliers/prices/comparison'),
      ]);
      setMetrics(metricsRes.data);
      setSupplierPrices(supplierRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  // Prepare data for charts
  const revenueComparisonData = [
    {
      period: '7 Days',
      revenue: metrics?.revenue_7d || 0,
      expenses: metrics?.expenses_7d || 0,
      profit: metrics?.profit_7d || 0,
    },
    {
      period: '30 Days',
      revenue: metrics?.revenue_30d || 0,
      expenses: metrics?.expenses_30d || 0,
      profit: metrics?.profit_30d || 0,
    },
  ];

  const drinksPerHourData = metrics?.drinks_per_hour?.map((item) => ({
    hour: `${item.hour}:00`,
    drinks: item.count,
  })) || [];

  const topProductsData = metrics?.top_products?.slice(0, 5).map((product) => ({
    name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
    profit: product.profit,
    revenue: product.revenue,
  })) || [];

  // Calculate profit margin percentage
  const profitMargin7d = metrics?.revenue_7d
    ? ((metrics.profit_7d / metrics.revenue_7d) * 100).toFixed(1)
    : 0;
  const profitMargin30d = metrics?.revenue_30d
    ? ((metrics.profit_30d / metrics.revenue_30d) * 100).toFixed(1)
    : 0;

  const COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'];

  return (
    <div className="dashboard-modern">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-text">Coffee Store Dashboard</span>
            <FaCoffee className="title-icon" />
          </h1>
          <p className="dashboard-subtitle">Monitor your business performance at a glance</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid-modern">
        <div className="metric-card-modern revenue">
          <div className="metric-icon">
            <FaDollarSign />
          </div>
          <div className="metric-content">
            <div className="metric-label">Revenue (7 days)</div>
            <div className="metric-value">${metrics?.revenue_7d?.toFixed(2) || '0.00'}</div>
            <div className="metric-change positive">
              <FaArrowUp className="change-icon" /> Margin: {profitMargin7d}%
            </div>
          </div>
        </div>

        <div className="metric-card-modern expenses">
          <div className="metric-icon">
            <FaMoneyBillWave />
          </div>
          <div className="metric-content">
            <div className="metric-label">Expenses (7 days)</div>
            <div className="metric-value">${metrics?.expenses_7d?.toFixed(2) || '0.00'}</div>
            <div className="metric-change">Cost tracking</div>
          </div>
        </div>

        <div className="metric-card-modern profit">
          <div className="metric-icon">
            <FaChartLine />
          </div>
          <div className="metric-content">
            <div className="metric-label">Profit (7 days)</div>
            <div className="metric-value">${metrics?.profit_7d?.toFixed(2) || '0.00'}</div>
            <div className="metric-change positive">
              {metrics?.profit_7d > 0 ? (
                <>
                  <FaArrowUp className="change-icon" /> Profitable
                </>
              ) : (
                <>
                  <FaArrowDown className="change-icon" /> Loss
                </>
              )}
            </div>
          </div>
        </div>

        <div className="metric-card-modern revenue-30">
          <div className="metric-icon">
            <FaChartBar />
          </div>
          <div className="metric-content">
            <div className="metric-label">Revenue (30 days)</div>
            <div className="metric-value">${metrics?.revenue_30d?.toFixed(2) || '0.00'}</div>
            <div className="metric-change positive">
              <FaArrowUp className="change-icon" /> Margin: {profitMargin30d}%
            </div>
          </div>
        </div>

        <div className="metric-card-modern expenses-30">
          <div className="metric-icon">
            <FaChartArea />
          </div>
          <div className="metric-content">
            <div className="metric-label">Expenses (30 days)</div>
            <div className="metric-value">${metrics?.expenses_30d?.toFixed(2) || '0.00'}</div>
            <div className="metric-change">Monthly tracking</div>
          </div>
        </div>

        <div className="metric-card-modern profit-30">
          <div className="metric-icon">
            <FaBullseye />
          </div>
          <div className="metric-content">
            <div className="metric-label">Profit (30 days)</div>
            <div className="metric-value">${metrics?.profit_30d?.toFixed(2) || '0.00'}</div>
            <div className="metric-change positive">
              {metrics?.profit_30d > 0 ? (
                <>
                  <FaArrowUp className="change-icon" /> Growing
                </>
              ) : (
                <>
                  <FaArrowDown className="change-icon" /> Needs attention
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3 className="chart-title">Revenue vs Expenses Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="period" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                }}
                formatter={(value) => `$${value.toFixed(2)}`}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#EC4899" name="Expenses" radius={[8, 8, 0, 0]} />
              <Bar dataKey="profit" fill="#10B981" name="Profit" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Sales by Hour (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={drinksPerHourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="hour" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="drinks"
                stroke="#06B6D4"
                strokeWidth={3}
                name="Drinks Sold"
                dot={{ fill: '#06B6D4', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Products and Supplier Data */}
      <div className="data-row">
        <div className="data-card">
          <div className="card-header">
            <h3>Top Performing Products</h3>
            <span className="card-badge">Last 7 Days</span>
          </div>
          {metrics?.top_products && metrics.top_products.length > 0 ? (
            <div className="products-list">
              {metrics.top_products.map((product, idx) => (
                <div key={idx} className="product-item">
                  <div className="product-info">
                    <div className="product-rank">{idx + 1}</div>
                    <div className="product-details">
                      <div className="product-name">{product.name}</div>
                      <div className="product-stats">
                        <span className="stat-item revenue-stat">
                          Rev: ${product.revenue.toFixed(2)}
                        </span>
                        <span className="stat-item cost-stat">
                          Cost: ${product.cost.toFixed(2)}
                        </span>
                        <span className="stat-item profit-stat">
                          Profit: ${product.profit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="product-bar">
                    <div
                      className="product-bar-fill"
                      style={{
                        width: `${Math.min((product.profit / (metrics.top_products[0]?.profit || 1)) * 100, 100)}%`,
                        backgroundColor: COLORS[idx % COLORS.length],
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No sales data available</p>
          )}
        </div>

        <div className="data-card">
          <div className="card-header">
            <h3>Products Needing Attention</h3>
            <span className="card-badge warning">Low Profit</span>
          </div>
          {metrics?.bottom_products && metrics.bottom_products.length > 0 ? (
            <div className="products-list">
              {metrics.bottom_products.map((product, idx) => (
                <div key={idx} className="product-item">
                  <div className="product-info">
                    <div className="product-rank warning">{idx + 1}</div>
                    <div className="product-details">
                      <div className="product-name">{product.name}</div>
                      <div className="product-stats">
                        <span className="stat-item revenue-stat">
                          Rev: ${product.revenue.toFixed(2)}
                        </span>
                        <span className="stat-item cost-stat">
                          Cost: ${product.cost.toFixed(2)}
                        </span>
                        <span className="stat-item profit-stat negative">
                          Profit: ${product.profit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="product-bar">
                    <div
                      className="product-bar-fill warning"
                      style={{
                        width: `${Math.max(
                          Math.abs((product.profit / (metrics.bottom_products[0]?.profit || 1)) * 100),
                          10
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No sales data available</p>
          )}
        </div>
      </div>

      {/* Supplier Price Comparison */}
      <div className="data-card full-width">
        <div className="card-header">
          <h3>Supplier Price Comparison</h3>
          <span className="card-badge">Cost Analysis</span>
        </div>
        {supplierPrices && supplierPrices.length > 0 ? (
          <div className="supplier-table">
            <div className="supplier-header">
              <div className="supplier-col product-col">Product</div>
              <div className="supplier-col price-col">Best Price</div>
              <div className="supplier-col price-col">Worst Price</div>
              <div className="supplier-col diff-col">Price Difference</div>
            </div>
            {supplierPrices.map((item, idx) => {
              const diff = parseFloat(item.worst_price) - parseFloat(item.best_price);
              return (
                <div key={idx} className="supplier-row">
                  <div className="supplier-col product-col">{item.product_name}</div>
                  <div className="supplier-col price-col best">
                    ${parseFloat(item.best_price).toFixed(2)}
                  </div>
                  <div className="supplier-col price-col worst">
                    ${parseFloat(item.worst_price).toFixed(2)}
                  </div>
                  <div className="supplier-col diff-col">
                    <span className="price-diff">
                      ${diff.toFixed(2)} difference
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-data">No supplier pricing data available</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
