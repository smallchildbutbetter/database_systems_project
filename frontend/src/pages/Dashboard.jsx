import { useState, useEffect } from 'react';
import axios from 'axios';
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
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Coffee Store Dashboard ☕</h1>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Revenue (7 days)</div>
          <div className="metric-value">
            ${metrics?.revenue_7d?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Cost (7 days)</div>
          <div className="metric-value">
            ${metrics?.expenses_7d?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Profit (7 days)</div>
          <div className="metric-value">
            ${metrics?.profit_7d?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Revenue (30 days)</div>
          <div className="metric-value">
            ${metrics?.revenue_30d?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Cost (30 days)</div>
          <div className="metric-value">
            ${metrics?.expenses_30d?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Profit (30 days)</div>
          <div className="metric-value">
            ${metrics?.profit_30d?.toFixed(2) || '0.00'}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Top Products (profit last 7 days)</h2>
        {metrics?.top_products && metrics.top_products.length > 0 ? (
          <ul className="top-products-list">
            {metrics.top_products.map((product, idx) => (
              <li key={idx}>
                <span className="product-name">{product.name}</span>
                <span className="product-revenue">
                  Rev ${product.revenue.toFixed(2)} | Cost ${product.cost.toFixed(2)} | Profit ${product.profit.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No sales data available</p>
        )}
      </div>

      <div className="card">
        <h2>Bottom Products (profit last 7 days)</h2>
        {metrics?.bottom_products && metrics.bottom_products.length > 0 ? (
          <ul className="top-products-list">
            {metrics.bottom_products.map((product, idx) => (
              <li key={idx}>
                <span className="product-name">{product.name}</span>
                <span className="product-revenue">
                  Rev ${product.revenue.toFixed(2)} | Cost ${product.cost.toFixed(2)} | Profit ${product.profit.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No sales data available</p>
        )}
      </div>

      <div className="card">
        <h2>Drinks per Hour (7 days)</h2>
        {metrics?.drinks_per_hour && metrics.drinks_per_hour.length > 0 ? (
          <ul className="drinks-per-hour-list">
            {metrics.drinks_per_hour.map((item, idx) => (
              <li key={idx}>
                <span className="hour">{item.hour}:00</span>
                <span className="count">{item.count} drinks</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hourly data available</p>
        )}
      </div>

      <div className="card">
        <h2>Supplier Price Comparison</h2>
        {supplierPrices && supplierPrices.length > 0 ? (
          <ul className="top-products-list">
            {supplierPrices.map((item, idx) => (
              <li key={idx}>
                <span className="product-name">{item.product_name}</span>
                <span className="product-revenue">
                  Best ${parseFloat(item.best_price).toFixed(2)} | Worst ${parseFloat(item.worst_price).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No supplier pricing data available</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

