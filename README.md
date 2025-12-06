# Coffee Store FMS ☕

A full-stack coffee store management system with PostgreSQL, Express.js, and React.

## Tech Stack

- **Database**: PostgreSQL
- **Backend**: Node.js + Express.js (ES Modules)
- **Frontend**: React 18 + Vite
- **Validation**: Zod
- **HTTP Client**: Axios

## Quick Start

### 1) Database

```bash
createdb coffee_store
psql -d coffee_store -f database/schema.sql
psql -d coffee_store -f database/seed.sql
psql -d coffee_store -f database/add_expenses_and_suppliers.sql
psql -d coffee_store -f database/add_sales_data.sql
```

### 2) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The backend will run on `http://localhost:5001` (or the port specified in your `.env` file)

### 3) Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` (or similar Vite port)

### Verify Setup

```bash
# Health check
curl http://localhost:5001/api/health

# Get products
curl http://localhost:5001/api/products
```

## Project Structure

```
coffee-store-fms/
├── backend/          # Express API server
├── frontend/         # React application
├── database/         # SQL schema, seeds, queries
├── data/             # CSV datasets (Kaggle + generated)
├── scripts/          # Data generation scripts (Python) and utility scripts
├── docs/             # Documentation files
└── README.md         # This file
```

## Screenshots Placeholders

### 📊 ERD (Entity Relationship Diagram)
_Add screenshot of database schema visualization_

### 🗄️ pgAdmin
_Add screenshot of tables in pgAdmin showing seeded data_

### 📮 Postman
_Add screenshot of API endpoints tested in Postman_

### 🎨 React Dashboard
_Add screenshot of the running React application showing dashboard metrics_

## Development

- Backend uses ES Modules (`"type": "module"`)
- Frontend uses Vite for fast HMR
- Database uses parameterized queries for security
- All API errors handled centrally via middleware

