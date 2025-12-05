DROP TABLE IF EXISTS saleitem CASCADE;
DROP TABLE IF EXISTS sale CASCADE;
DROP TABLE IF EXISTS schedule CASCADE;
DROP TABLE IF EXISTS expense CASCADE;
DROP TABLE IF EXISTS supplierprice CASCADE;
DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS employee CASCADE;
DROP TABLE IF EXISTS customer CASCADE;
DROP TABLE IF EXISTS store CASCADE;
DROP TABLE IF EXISTS supplier CASCADE;

CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE product (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    size VARCHAR(20),
    cost NUMERIC(8,2),
    price NUMERIC(8,2),
    category_id INT REFERENCES category(category_id)
);

CREATE TABLE employee (
    emp_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50),
    wage NUMERIC(8,2)
);

CREATE TABLE customer (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(120)
);

CREATE TABLE store (
    store_id SERIAL PRIMARY KEY,
    location VARCHAR(120)
);

CREATE TABLE supplier (
    supplier_id SERIAL PRIMARY KEY,
    name VARCHAR(120),
    contact VARCHAR(120),
    ingredient_type VARCHAR(80)
);

CREATE TABLE supplierprice (
    supplier_price_id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES supplier(supplier_id),
    product_id INT REFERENCES product(product_id),
    price NUMERIC(10,2) NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE (supplier_id, product_id, effective_date)
);

CREATE TABLE sale (
    sale_id SERIAL PRIMARY KEY,
    sale_date TIMESTAMP NOT NULL DEFAULT NOW(),
    store_id INT REFERENCES store(store_id),
    emp_id INT REFERENCES employee(emp_id),
    customer_id INT REFERENCES customer(customer_id),
    payment_method VARCHAR(20)
);

CREATE TABLE saleitem (
    sale_item_id SERIAL PRIMARY KEY,
    sale_id INT REFERENCES sale(sale_id) ON DELETE CASCADE,
    product_id INT REFERENCES product(product_id),
    qty INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(8,2) NOT NULL
);

CREATE TABLE expense (
    expense_id SERIAL PRIMARY KEY,
    category VARCHAR(40) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_id INT,
    store_id INT REFERENCES store(store_id),
    note TEXT
);

CREATE TABLE schedule (
    schedule_id SERIAL PRIMARY KEY,
    store_id INT REFERENCES store(store_id),
    emp_id INT REFERENCES employee(emp_id),
    shift_date DATE NOT NULL,
    shift_hours NUMERIC(4,2) NOT NULL DEFAULT 8,
    role VARCHAR(50),
    UNIQUE (store_id, emp_id, shift_date)
);

CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_sale_store ON sale(store_id);
CREATE INDEX idx_sale_employee ON sale(emp_id);
CREATE INDEX idx_sale_date ON sale(sale_date);
CREATE INDEX idx_sale_item_sale ON saleitem(sale_id);
CREATE INDEX idx_sale_item_product ON saleitem(product_id);
CREATE INDEX idx_expense_date ON expense(date);
CREATE INDEX idx_expense_store ON expense(store_id);
CREATE INDEX idx_supplier_price ON supplierprice(product_id, supplier_id, effective_date);
CREATE INDEX idx_schedule_shift_date ON schedule(shift_date);
