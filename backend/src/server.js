import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import employeesRouter from './routes/employees.js';
import salesRouter from './routes/sales.js';
import expensesRouter from './routes/expenses.js';
import dashboardRouter from './routes/dashboard.js';
import suppliersRouter from './routes/suppliers.js';
import scheduleRouter from './routes/schedule.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Coffee Store FMS API',
    status: 'running',
    frontend: 'http://localhost:5173',
    endpoints: {
      health: '/api/health',
      sales: '/api/sales',
      employees: '/api/employees',
      products: '/api/products',
      dashboard: '/api/dashboard/metrics',
      suppliers: '/api/suppliers',
      schedule: '/api/schedule'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/sales', salesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/schedule', scheduleRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
