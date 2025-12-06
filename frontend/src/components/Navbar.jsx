import { Link, useLocation } from 'react-router-dom';
import {
  FaCoffee,
  FaChartBar,
  FaBox,
  FaDollarSign,
  FaUsers,
  FaMoneyBillWave,
  FaBuilding,
  FaLightbulb,
} from 'react-icons/fa';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sidebar">
      <div className="sidebar-content">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <FaCoffee />
          </div>
          <div className="logo-text">Coffee Store</div>
        </div>

        {/* Navigation Section */}
        <div className="sidebar-section">
          <div className="section-title">OVERVIEW</div>
          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <FaChartBar />
              </span>
              <span className="nav-text">Dashboard</span>
            </Link>
            <Link
              to="/products"
              className={`nav-link ${isActive('/products') ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <FaBox />
              </span>
              <span className="nav-text">Products</span>
            </Link>
            <Link
              to="/sales"
              className={`nav-link ${isActive('/sales') ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <FaDollarSign />
              </span>
              <span className="nav-text">Sales</span>
            </Link>
            <Link
              to="/employees"
              className={`nav-link ${isActive('/employees') ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <FaUsers />
              </span>
              <span className="nav-text">Employees</span>
            </Link>
            <Link
              to="/expenses"
              className={`nav-link ${isActive('/expenses') ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <FaMoneyBillWave />
              </span>
              <span className="nav-text">Expenses</span>
            </Link>
            <Link
              to="/suppliers"
              className={`nav-link ${isActive('/suppliers') ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <FaBuilding />
              </span>
              <span className="nav-text">Suppliers</span>
            </Link>
            <Link
              to="/optimization"
              className={`nav-link ${isActive('/optimization') ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <FaLightbulb />
              </span>
              <span className="nav-text">Optimization</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
