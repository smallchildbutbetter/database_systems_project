# Database Setup

This directory contains the PostgreSQL database schema, seed data, and sample queries for the Coffee Store FMS.

## Files

- `schema.sql` - Database schema with all tables, relationships, and indexes
- `seed.sql` - Sample data for testing and development
- `add_expenses_and_suppliers.sql` - Additional expense and supplier data
- `add_sales_data.sql` - Additional sales transaction data
- `sample_queries.sql` - Example queries demonstrating common operations

## Setup Commands

```bash
# Create the database
createdb coffee_store

# Load the schema
psql -d coffee_store -f database/schema.sql

# Load seed data
psql -d coffee_store -f database/seed.sql

# Load additional expenses and suppliers data
psql -d coffee_store -f database/add_expenses_and_suppliers.sql

# Load additional sales data
psql -d coffee_store -f database/add_sales_data.sql
```

## Verify Setup

```bash
# Connect to the database
psql -d coffee_store

# List all tables
\dt

# Check seeded data
SELECT COUNT(*) FROM Category;
SELECT COUNT(*) FROM Product;
SELECT COUNT(*) FROM Sale;
```

## Sample Queries

Run the sample queries to see examples of:
- Top products by revenue
- Sales grouped by hour
- Profit calculations per product
- Expense summaries by category
- And more...

```bash
psql -d coffee_store -f database/sample_queries.sql
```

## Database Schema Overview

- **Category** - Product categories (Hot Drinks, Cold Drinks, etc.)
- **Product** - Products with cost and price information
- **Employee** - Staff members with roles and wages
- **Customer** - Customer information
- **Store** - Store locations
- **Supplier** - Supplier information
- **Sale** - Sales transactions
- **SaleItem** - Individual items in each sale
- **Expense** - Store expenses

