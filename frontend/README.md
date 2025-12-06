# Frontend

React + Vite frontend for the Coffee Store FMS.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or similar Vite port).

The Vite dev server is configured to proxy `/api/*` requests to `http://localhost:5000`, so you don't need to worry about CORS issues.

## Pages

- **Dashboard** (`/`) - Shows KPIs, top products, and drinks per hour
- **Products** (`/products`) - Lists products and allows adding new ones
- **Sales** (`/sales`) - Lists recent sales transactions
- **Employees** (`/employees`) - Lists employees
- **Expenses** (`/expenses`) - Lists recent expenses

## Build

```bash
npm run build
```

This creates a production build in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Screenshot Checklist

- ✅ Dashboard showing "Coffee Store Dashboard ☕" title
- ✅ Dashboard metrics populated (revenue, expenses, top products, drinks per hour)
- ✅ Products page listing all products with category names
- ✅ Products page "Add Product" form working and updating the list
- ✅ Navigation between pages working

