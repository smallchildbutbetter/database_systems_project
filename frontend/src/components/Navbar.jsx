import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Coffee Store FMS ☕
        </Link>
        <div className="navbar-links">
          <Link
            to="/"
            className={isActive('/') ? 'active' : ''}
          >
            Dashboard
          </Link>
          <Link
            to="/products"
            className={isActive('/products') ? 'active' : ''}
          >
            Products
          </Link>
          <Link
            to="/sales"
            className={isActive('/sales') ? 'active' : ''}
          >
            Sales
          </Link>
          <Link
            to="/employees"
            className={isActive('/employees') ? 'active' : ''}
          >
            Employees
          </Link>
          <Link
            to="/expenses"
            className={isActive('/expenses') ? 'active' : ''}
          >
            Expenses
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

