import { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '../components/Table';

function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sale_date: '',
    store_id: '',
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
    fetchStores();
    fetchEmployees();
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

  const fetchStores = async () => {
    try {
      const response = await axios.get('/api/stores');
      setStores(response.data);
      // Set default store if available
      if (response.data.length > 0 && !formData.store_id) {
        setFormData(prev => ({ ...prev, store_id: response.data[0].store_id.toString() }));
      }
    } catch (err) {
      console.error('Failed to load stores', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to load employees', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert datetime-local to ISO string if provided
      let saleDate = undefined;
      if (formData.sale_date) {
        // datetime-local format is YYYY-MM-DDTHH:mm, convert to ISO
        saleDate = new Date(formData.sale_date).toISOString();
      }

      const payload = {
        sale_date: saleDate,
        store_id: parseInt(formData.store_id, 10),
        emp_id: formData.emp_id ? parseInt(formData.emp_id, 10) : null,
        customer_id: formData.customer_id ? parseInt(formData.customer_id, 10) : null,
        payment_method: formData.payment_method || null,
        items: [
          {
            product_id: parseInt(formData.product_id, 10),
            qty: parseInt(formData.qty, 10) || 1,
            unit_price: formData.unit_price ? parseFloat(formData.unit_price) : undefined,
          },
        ],
      };

      if (!formData.product_id) {
        setError('Please select a product');
        return;
      }

      await axios.post('/api/sales', payload);
      setSuccess('Sale recorded successfully!');
      setError(null);
      setShowForm(false);
      setFormData({
        sale_date: '',
        store_id: stores.length > 0 ? stores[0].store_id.toString() : '',
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
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create sale';
      setError(errorMessage);
      console.error('Sale creation error:', err);
      setTimeout(() => setError(null), 5000);
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
              Store *
              <select
                value={formData.store_id}
                onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                required
              >
                <option value="">Select store</option>
                {stores.map((store) => (
                  <option key={store.store_id} value={store.store_id}>
                    {store.location}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Employee
              <select
                value={formData.emp_id}
                onChange={(e) => setFormData({ ...formData, emp_id: e.target.value })}
              >
                <option value="">Select employee (optional)</option>
                {employees.map((emp) => (
                  <option key={emp.emp_id} value={emp.emp_id}>
                    {emp.name} {emp.role ? `(${emp.role})` : ''}
                  </option>
                ))}
              </select>
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

