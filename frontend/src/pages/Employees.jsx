import { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '../components/Table';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    wage: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        role: formData.role || undefined,
        wage: formData.wage ? parseFloat(formData.wage) : undefined,
      };
      await axios.post('/api/employees', payload);
      setSuccess('Employee added');
      setFormData({ name: '', role: '', wage: '' });
      setShowForm(false);
      fetchEmployees();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add employee');
      console.error(err);
    }
  };

  const handleDelete = async (empId) => {
    try {
      await axios.delete(`/api/employees/${empId}`);
      fetchEmployees();
    } catch (err) {
      setError('Failed to delete employee');
      console.error(err);
    }
  };

  const columns = [
    { key: 'emp_id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    {
      key: 'wage',
      label: 'Wage',
      render: (value) => (value ? `$${parseFloat(value).toFixed(2)}` : '-'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button className="btn-danger" onClick={() => handleDelete(row.emp_id)}>
          Delete
        </button>
      ),
    },
  ];

  if (loading) {
    return <div className="loading">Loading employees...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Employees</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Employee'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {showForm && (
        <div className="card">
          <h2>Add Employee</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Name *
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </label>
            <label>
              Role
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </label>
            <label>
              Wage
              <input
                type="number"
                step="0.01"
                value={formData.wage}
                onChange={(e) => setFormData({ ...formData, wage: e.target.value })}
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <Table columns={columns} rows={employees} />
      </div>
    </div>
  );
}

export default Employees;

