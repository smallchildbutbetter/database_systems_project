import { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '../components/Table';

function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sale_date: '',
    store_id: '1',
    emp_id: '',
    customer_id: '',
    payment_method: 'Credit Card',
    product_id: '',
    qty: '1',
    unit_price: '',
  });

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/sales');
      setSales(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load sales');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to load products for sale form', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        sale_date: formData.sale_date || undefined,
        store_id: parseInt(formData.store_id, 10),
        emp_id: formData.emp_id ? parseInt(formData.emp_id, 10) : undefined,
        customer_id: formData.customer_id ? parseInt(formData.customer_id, 10) : undefined,
        payment_method: formData.payment_method || undefined,
        items: [
          {
            product_id: parseInt(formData.product_id, 10),
            qty: parseInt(formData.qty, 10) || 1,
            unit_price: formData.unit_price ? parseFloat(formData.unit_price) : undefined,
          },
        ],
      };

      await axios.post('/api/sales', payload);
      setSuccess('Sale recorded successfully!');
      setShowForm(false);
      setFormData({
        sale_date: '',
        store_id: '1',
        emp_id: '',
        customer_id: '',
        payment_method: 'Credit Card',
        product_id: '',
        qty: '1',
        unit_price: '',
      });
      fetchSales();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create sale');
      console.error(err);
    }
  };

  const handleDelete = async (saleId) => {
    try {
      await axios.delete(`/api/sales/${saleId}`);
      fetchSales();
    } catch (err) {
      setError('Failed to delete sale');
      console.error(err);
    }
  };

  const columns = [
    { key: 'sale_id', label: 'ID' },
    {
      key: 'sale_date',
      label: 'Date',
      render: (value) => (value ? new Date(value).toLocaleString() : '-'),
    },
    { key: 'store_location', label: 'Store' },
    { key: 'employee_name', label: 'Employee' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'payment_method', label: 'Payment' },
    {
      key: 'total',
      label: 'Total',
      render: (value) => (value ? `$${parseFloat(value).toFixed(2)}` : '-'),
    },
    { key: 'item_count', label: 'Items' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button className="btn-danger" onClick={() => handleDelete(row.sale_id)}>
          Delete
        </button>
      ),
    },
  ];

  if (loading) {
    return <div className="loading">Loading sales...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sales</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Sale'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {showForm && (
        <div className="card">
          <h2>Add Sale</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Sale Date
              <input
                type="datetime-local"
                value={formData.sale_date}
                onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
              />
            </label>
            <label>
              Store ID
              <input
                type="number"
                value={formData.store_id}
                onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                required
              />
            </label>
            <label>
              Employee ID
              <input
                type="number"
                value={formData.emp_id}
                onChange={(e) => setFormData({ ...formData, emp_id: e.target.value })}
              />
            </label>
            <label>
              Customer ID
              <input
                type="number"
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              />
            </label>
            <label>
              Payment Method
              <input
                type="text"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              />
            </label>
            <label>
              Product
              <select
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                required
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input
                type="number"
                min="1"
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
              />
            </label>
            <label>
              Unit Price (optional)
              <input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Save Sale
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <Table columns={columns} rows={sales} />
      </div>
    </div>
  );
}

export default Sales;

