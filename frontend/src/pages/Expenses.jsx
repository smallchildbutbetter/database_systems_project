import { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '../components/Table';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/expenses');
      setExpenses(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load expenses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'expense_id', label: 'ID' },
    { key: 'category', label: 'Category' },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => (value ? `$${parseFloat(value).toFixed(2)}` : '-'),
    },
    {
      key: 'date',
      label: 'Date',
      render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
    },
    { key: 'store_location', label: 'Store' },
    { key: 'note', label: 'Note' },
  ];

  if (loading) {
    return <div className="loading">Loading expenses...</div>;
  }

  return (
    <div>
      <h1 className="page-title">Expenses</h1>
      {error && <div className="error">{error}</div>}
      <div className="card">
        <Table columns={columns} rows={expenses} />
      </div>
    </div>
  );
}

export default Expenses;

