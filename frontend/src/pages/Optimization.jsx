import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  FaLightbulb,
  FaDollarSign,
  FaChartLine,
  FaUsers,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import './Optimization.css';

function Optimization() {
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOptimization();
  }, []);

  const fetchOptimization = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/suppliers/optimization');
      setOptimization(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load optimization data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="optimization-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing supplier data and calculating optimizations...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!optimization || !optimization.recommendations) {
    return <div className="error">No optimization data available</div>;
  }

  const { recommendations, summary } = optimization;

  // Prepare chart data
  const costComparisonData = [
    {
      name: 'Current Cost',
      value: parseFloat(summary.total_current_cost),
    },
    {
      name: 'Optimized Cost',
      value: parseFloat(summary.total_optimized_cost),
    },
  ];

  const savingsData = recommendations
    .filter((rec) => rec.savings > 0)
    .slice(0, 10)
    .map((rec) => ({
      name: rec.product_name.length > 20 
        ? rec.product_name.substring(0, 20) + '...' 
        : rec.product_name,
      savings: rec.savings,
      fullName: rec.product_name,
    }))
    .sort((a, b) => b.savings - a.savings);

  const supplierUsageData = summary.supplier_usage.map((su) => ({
    name: su.supplier_name.length > 15 
      ? su.supplier_name.substring(0, 15) + '...' 
      : su.supplier_name,
    value: su.product_count,
    fullName: su.supplier_name,
  }));

  const COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#6366F1', '#EF4444'];

  return (
    <div className="optimization-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-text">Supplier Optimization</span>
            <FaLightbulb className="title-icon" />
          </h1>
          <p className="page-subtitle">
            AI-powered recommendations to minimize costs while maintaining supplier reliability
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card savings">
          <div className="summary-icon">
            <FaDollarSign />
          </div>
          <div className="summary-content">
            <div className="summary-label">Total Savings</div>
            <div className="summary-value">
              ${parseFloat(summary.total_savings).toFixed(2)}
            </div>
            <div className="summary-change positive">
              <FaArrowDown className="change-icon" />
              {summary.savings_percent}% reduction
            </div>
          </div>
        </div>

        <div className="summary-card current">
          <div className="summary-icon">
            <FaChartLine />
          </div>
          <div className="summary-content">
            <div className="summary-label">Current Cost</div>
            <div className="summary-value">
              ${parseFloat(summary.total_current_cost).toFixed(2)}
            </div>
            <div className="summary-change">Baseline</div>
          </div>
        </div>

        <div className="summary-card optimized">
          <div className="summary-icon">
            <FaCheckCircle />
          </div>
          <div className="summary-content">
            <div className="summary-label">Optimized Cost</div>
            <div className="summary-value">
              ${parseFloat(summary.total_optimized_cost).toFixed(2)}
            </div>
            <div className="summary-change positive">Recommended</div>
          </div>
        </div>

        <div className="summary-card diversity">
          <div className="summary-icon">
            <FaUsers />
          </div>
          <div className="summary-content">
            <div className="summary-label">Supplier Diversity</div>
            <div className="summary-value">{summary.diversity_score}%</div>
            <div className="summary-change">
              {summary.unique_suppliers_recommended} suppliers
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3 className="chart-title">Cost Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={costComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis 
                stroke="#666"
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                }}
                formatter={(value) => `$${parseFloat(value).toFixed(2)}`}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                fill="#8B5CF6" 
                name="Cost"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Supplier Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={supplierUsageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {supplierUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                }}
                formatter={(value, name, props) => [
                  `${value} products`,
                  props.payload.fullName,
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Savings Chart */}
      {savingsData.length > 0 && (
        <div className="chart-card full-width">
          <h3 className="chart-title">Top Savings Opportunities</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={savingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                stroke="#666"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#666"
                label={{ value: 'Savings ($)', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                }}
                formatter={(value, name, props) => [
                  `$${value.toFixed(2)}`,
                  props.payload.fullName,
                ]}
              />
              <Legend />
              <Bar 
                dataKey="savings" 
                fill="#10B981" 
                name="Potential Savings"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recommendations Table */}
      <div className="recommendations-section">
        <div className="card">
          <div className="card-header-section">
            <h2>Detailed Recommendations</h2>
            <span className="card-badge">
              {recommendations.length} products analyzed
            </span>
          </div>
          <div className="recommendations-table">
            <div className="recommendations-header">
              <div className="rec-col product-col">Product</div>
              <div className="rec-col supplier-col">Current Supplier</div>
              <div className="rec-col price-col">Current Price</div>
              <div className="rec-col supplier-col">Recommended Supplier</div>
              <div className="rec-col price-col">Recommended Price</div>
              <div className="rec-col savings-col">Savings</div>
            </div>
            {recommendations.map((rec, idx) => (
              <div key={idx} className="recommendation-row">
                <div className="rec-col product-col">
                  <strong>{rec.product_name}</strong>
                </div>
                <div className="rec-col supplier-col">
                  <span className="supplier-badge current">
                    Current
                  </span>
                </div>
                <div className="rec-col price-col current-price">
                  ${rec.current_supplier_price.toFixed(2)}
                </div>
                <div className="rec-col supplier-col">
                  <span className="supplier-badge recommended">
                    {rec.recommended_supplier_name}
                  </span>
                </div>
                <div className="rec-col price-col recommended-price">
                  ${rec.recommended_price.toFixed(2)}
                </div>
                <div className="rec-col savings-col">
                  {rec.savings > 0 ? (
                    <span className="savings-badge positive">
                      <FaArrowDown className="savings-icon" />
                      ${rec.savings.toFixed(2)} ({rec.savings_percent}%)
                    </span>
                  ) : rec.savings < 0 ? (
                    <span className="savings-badge negative">
                      <FaArrowUp className="savings-icon" />
                      ${Math.abs(rec.savings).toFixed(2)} increase
                    </span>
                  ) : (
                    <span className="savings-badge neutral">No change</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Optimization;

