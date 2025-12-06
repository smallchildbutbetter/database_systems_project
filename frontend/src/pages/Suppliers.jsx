import { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '../components/Table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  FaBuilding,
  FaPhone,
  FaBox,
  FaDollarSign,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import './Suppliers.css';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [priceComparison, setPriceComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' or 'prices'
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  const [productPrices, setProductPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suppliersRes, pricesRes] = await Promise.all([
        axios.get('/api/suppliers'),
        axios.get('/api/suppliers/prices/comparison'),
      ]);
      setSuppliers(suppliersRes.data);
      setPriceComparison(pricesRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load supplier data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductPrices = async (productId) => {
    if (productPrices[productId]) {
      // Already loaded
      return;
    }

    try {
      setLoadingPrices((prev) => new Set(prev).add(productId));
      const response = await axios.get(`/api/suppliers/prices/product/${productId}`);
      setProductPrices((prev) => ({
        ...prev,
        [productId]: response.data,
      }));
    } catch (err) {
      console.error(`Failed to load prices for product ${productId}`, err);
    } finally {
      setLoadingPrices((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const toggleProduct = (productId) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
      fetchProductPrices(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const expandAll = async () => {
    if (priceComparison.length === 0) return;
    
    const allProductIds = priceComparison.map(item => item.product_id);
    const newExpanded = new Set(allProductIds);
    setExpandedProducts(newExpanded);
    
    // Fetch prices for all products that haven't been loaded yet
    const productsToFetch = allProductIds.filter(id => !productPrices[id]);
    if (productsToFetch.length > 0) {
      // Fetch all prices in parallel
      const fetchPromises = productsToFetch.map(id => {
        setLoadingPrices((prev) => new Set(prev).add(id));
        return axios.get(`/api/suppliers/prices/product/${id}`)
          .then(response => {
            setProductPrices((prev) => ({
              ...prev,
              [id]: response.data,
            }));
          })
          .catch(err => {
            console.error(`Failed to load prices for product ${id}`, err);
          })
          .finally(() => {
            setLoadingPrices((prev) => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
          });
      });
      
      await Promise.all(fetchPromises);
    }
  };

  const collapseAll = () => {
    setExpandedProducts(new Set());
  };

  const supplierColumns = [
    { key: 'supplier_id', label: 'ID' },
    { 
      key: 'name', 
      label: 'Supplier Name',
      render: (value) => (
        <div className="supplier-name-cell">
          <FaBuilding className="cell-icon" />
          <span>{value || '-'}</span>
        </div>
      ),
    },
    { 
      key: 'contact', 
      label: 'Contact',
      render: (value) => (
        <div className="supplier-contact-cell">
          <FaPhone className="cell-icon" />
          <span>{value || '-'}</span>
        </div>
      ),
    },
    { 
      key: 'ingredient_type', 
      label: 'Ingredient Type',
      render: (value) => (
        <div className="supplier-type-cell">
          <FaBox className="cell-icon" />
          <span>{value || '-'}</span>
        </div>
      ),
    },
    { 
      key: 'product_count', 
      label: 'Products',
      render: (value) => value || 0,
    },
    { 
      key: 'expense_count', 
      label: 'Expenses',
      render: (value) => value || 0,
    },
  ];

  if (loading) {
    return (
      <div className="suppliers-loading">
        <div className="loading-spinner"></div>
        <p>Loading suppliers...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="suppliers-page">
      <div className="page-header">
        <h1 className="page-title">Suppliers</h1>
        <p className="page-subtitle">Manage supplier information and pricing</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('suppliers')}
        >
          <FaBuilding className="tab-icon" />
          All Suppliers
        </button>
        <button
          className={`tab-button ${activeTab === 'prices' ? 'active' : ''}`}
          onClick={() => setActiveTab('prices')}
        >
          <FaDollarSign className="tab-icon" />
          Price Comparison
        </button>
      </div>

      {activeTab === 'suppliers' && (
        <div className="card">
          <div className="card-header-section">
            <h2>Supplier Directory</h2>
            <span className="card-badge">{suppliers.length} suppliers</span>
          </div>
          <Table columns={supplierColumns} rows={suppliers} />
        </div>
      )}

      {activeTab === 'prices' && (
        <div className="price-comparison-section">
          <div className="card">
            <div className="card-header-section">
              <div>
                <h2>Supplier Price Comparison</h2>
                <span className="card-badge">Best vs Worst Prices</span>
              </div>
              <div className="expand-controls">
                <button
                  className="expand-all-button"
                  onClick={expandAll}
                  disabled={priceComparison.length === 0 || expandedProducts.size === priceComparison.length}
                >
                  <FaChevronDown className="button-icon" />
                  Expand All
                </button>
                <button
                  className="collapse-all-button"
                  onClick={collapseAll}
                  disabled={expandedProducts.size === 0}
                >
                  <FaChevronUp className="button-icon" />
                  Collapse All
                </button>
              </div>
            </div>
            {priceComparison && priceComparison.length > 0 ? (
              <div className="price-table">
                <div className="price-header">
                  <div className="price-col product-col">Product</div>
                  <div className="price-col supplier-col">Best Supplier</div>
                  <div className="price-col price-col-header">Best Price</div>
                  <div className="price-col supplier-col">Worst Supplier</div>
                  <div className="price-col price-col-header">Worst Price</div>
                  <div className="price-col diff-col">Difference</div>
                </div>
                {priceComparison.map((item, idx) => {
                  const bestSuppliers = Array.isArray(item.best_suppliers) 
                    ? item.best_suppliers 
                    : JSON.parse(item.best_suppliers || '[]');
                  const worstSuppliers = Array.isArray(item.worst_suppliers) 
                    ? item.worst_suppliers 
                    : JSON.parse(item.worst_suppliers || '[]');
                  const bestPrice = parseFloat(item.best_price) || 0;
                  const worstPrice = parseFloat(item.worst_price) || 0;
                  const diff = worstPrice - bestPrice;
                  const productId = item.product_id;
                  const isExpanded = expandedProducts.has(productId);
                  const prices = productPrices[productId] || [];
                  const isLoading = loadingPrices.has(productId);

                  // Prepare chart data
                  const chartData = prices.map((p) => ({
                    name: p.supplier_name.length > 15 
                      ? p.supplier_name.substring(0, 15) + '...' 
                      : p.supplier_name,
                    price: parseFloat(p.price) || 0,
                    fullName: p.supplier_name,
                  })).sort((a, b) => a.price - b.price);

                  // Calculate Y-axis domain to make differences more noticeable
                  const pricesOnly = chartData.map(d => d.price);
                  let adjustedMin = 0;
                  let adjustedMax = 100;
                  
                  if (pricesOnly.length > 0) {
                    const minPrice = Math.min(...pricesOnly);
                    const maxPrice = Math.max(...pricesOnly);
                    const priceRange = maxPrice - minPrice;
                    
                    if (priceRange > 0) {
                      // Set domain to show padding below min and above max
                      // Use more padding for smaller ranges to emphasize differences
                      const paddingPercent = priceRange < 1 ? 0.2 : 0.1;
                      adjustedMin = Math.max(0, minPrice - (priceRange * paddingPercent));
                      adjustedMax = maxPrice + (priceRange * paddingPercent);
                    } else {
                      // All prices are the same, show a small range around that price
                      adjustedMin = Math.max(0, minPrice - (minPrice * 0.05));
                      adjustedMax = maxPrice + (maxPrice * 0.05);
                    }
                  }

                  return (
                    <div key={idx}>
                      <div 
                        className="price-row"
                        onClick={() => toggleProduct(productId)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="price-col product-col">
                          <div className="product-header">
                            <strong>{item.product_name}</strong>
                            <button
                              className="expand-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProduct(productId);
                              }}
                            >
                              {isExpanded ? (
                                <FaChevronUp />
                              ) : (
                                <FaChevronDown />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="price-col supplier-col">
                          {bestSuppliers.length > 0 ? (
                            <div className="supplier-info">
                              {bestSuppliers.map((sup, i) => (
                                <div key={i} className="supplier-tag best">
                                  {sup.name}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="no-data">-</span>
                          )}
                        </div>
                        <div className="price-col price-col-value best">
                          ${bestPrice.toFixed(2)}
                        </div>
                        <div className="price-col supplier-col">
                          {worstSuppliers.length > 0 ? (
                            <div className="supplier-info">
                              {worstSuppliers.map((sup, i) => (
                                <div key={i} className="supplier-tag worst">
                                  {sup.name}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="no-data">-</span>
                          )}
                        </div>
                        <div className="price-col price-col-value worst">
                          ${worstPrice.toFixed(2)}
                        </div>
                        <div className="price-col diff-col">
                          <span className={`price-diff ${diff > 0 ? 'positive' : ''}`}>
                            ${diff.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="price-chart-container">
                          {isLoading ? (
                            <div className="chart-loading">Loading chart data...</div>
                          ) : chartData.length > 0 ? (
                            <div className="chart-wrapper">
                              <h4 className="chart-title">All Supplier Prices</h4>
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
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
                                    label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                                    domain={[adjustedMin, adjustedMax]}
                                    tickFormatter={(value) => `$${value.toFixed(2)}`}
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
                                    dataKey="price" 
                                    fill="#8B5CF6" 
                                    name="Price"
                                    radius={[8, 8, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div className="no-data">No supplier price data available</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-data">No price comparison data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Suppliers;

