import { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '../components/Table';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    cost: '',
    price: '',
    category_id: '',
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        size: formData.size || undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
      };

      await axios.post('/api/products', payload);
      setSuccess('Product added successfully!');
      setFormData({
        name: '',
        size: '',
        cost: '',
        price: '',
        category_id: '',
      });
      setShowForm(false);
      fetchProducts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
      console.error(err);
    }
  };

  const columns = [
    { key: 'product_id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'size', label: 'Size' },
    { key: 'category_name', label: 'Category' },
    {
      key: 'cost',
      label: 'Cost',
      render: (value) => (value ? `$${parseFloat(value).toFixed(2)}` : '-'),
    },
    {
      key: 'price',
      label: 'Price',
      render: (value) => (value ? `$${parseFloat(value).toFixed(2)}` : '-'),
    },
  ];

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {showForm && (
        <div className="card">
          <h2>Add New Product</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Size</label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Cost</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Add Product
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <Table columns={columns} rows={products} />
      </div>
    </div>
  );
}

export default Products;

