import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Employees from './pages/Employees';
import Expenses from './pages/Expenses';
import Suppliers from './pages/Suppliers';
import Optimization from './pages/Optimization';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/optimization" element={<Optimization />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

