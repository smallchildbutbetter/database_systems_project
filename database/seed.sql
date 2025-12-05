INSERT INTO category (name) VALUES
    ('Hot Drinks'),
    ('Cold Drinks'),
    ('Pastries'),
    ('Snacks');

INSERT INTO product (name, size, cost, price, category_id) VALUES
    ('Espresso', 'Single', 0.50, 2.50, 1),
    ('Latte', 'Medium', 1.20, 4.50, 1),
    ('Cappuccino', 'Large', 1.30, 5.00, 1),
    ('Iced Coffee', 'Large', 1.00, 3.75, 2),
    ('Frappuccino', 'Large', 1.50, 5.50, 2),
    ('Croissant', NULL, 0.80, 2.50, 3),
    ('Muffin', NULL, 0.90, 3.00, 3),
    ('Bagel', NULL, 0.60, 2.00, 3);

INSERT INTO employee (name, role, wage) VALUES
    ('Alice Johnson', 'Barista', 18.50),
    ('Bob Smith', 'Manager', 25.00),
    ('Carol White', 'Barista', 17.00);

INSERT INTO store (location) VALUES
    ('Downtown Main St'),
    ('Airport Terminal'),
    ('University Campus');

INSERT INTO customer (name, email) VALUES
    ('David Brown', 'david.brown@email.com'),
    ('Emma Davis', 'emma.davis@email.com'),
    ('Frank Miller', 'frank.miller@email.com');

INSERT INTO supplier (name, contact, ingredient_type) VALUES
    ('Coffee Beans Co', 'contact@coffeebeans.com', 'Coffee Beans'),
    ('Dairy Fresh', 'orders@dairyfresh.com', 'Milk & Cream'),
    ('Sweet Treats Bakery', 'info@sweettreats.com', 'Pastries');

INSERT INTO supplierprice (supplier_id, product_id, price, effective_date) VALUES
    (1, 1, 0.48, '2024-01-10'),
    (1, 2, 1.10, '2024-01-10'),
    (1, 3, 1.15, '2024-01-10'),
    (1, 4, 0.95, '2024-01-10'),
    (1, 5, 1.40, '2024-01-10'),
    (3, 6, 0.78, '2024-01-10'),
    (3, 7, 0.88, '2024-01-10'),
    (3, 8, 0.58, '2024-01-10'),
    (2, 2, 1.25, '2024-01-10'),
    (2, 3, 1.28, '2024-01-10'),
    (2, 5, 1.55, '2024-01-10');

INSERT INTO sale (sale_date, store_id, emp_id, customer_id, payment_method) VALUES
    ('2024-01-15 08:30:00', 1, 1, 1, 'Credit Card'),
    ('2024-01-15 09:15:00', 1, 1, 2, 'Cash'),
    ('2024-01-15 10:00:00', 1, 2, 1, 'Credit Card'),
    ('2024-01-15 11:30:00', 1, 3, NULL, 'Cash'),
    ('2024-01-15 14:00:00', 1, 1, 3, 'Credit Card');

INSERT INTO saleitem (sale_id, product_id, qty, unit_price) VALUES
    (1, 2, 1, 4.50),
    (1, 6, 1, 2.50),
    (2, 3, 1, 5.00),
    (2, 7, 2, 3.00),
    (3, 1, 2, 2.50),
    (3, 4, 1, 3.75),
    (4, 5, 1, 5.50),
    (4, 8, 1, 2.00),
    (5, 2, 2, 4.50),
    (5, 6, 1, 2.50);

INSERT INTO expense (category, amount, date, supplier_id, store_id, note) VALUES
    ('Inventory', 500.00, '2024-01-10', 1, 1, 'Coffee beans order'),
    ('Utilities', 150.00, '2024-01-12', NULL, 1, 'Electricity bill'),
    ('Inventory', 200.00, '2024-01-13', 2, 1, 'Milk and cream supply'),
    ('Equipment', 300.00, '2024-01-14', NULL, 1, 'New grinder maintenance'),
    ('Inventory', 180.00, '2024-01-15', 3, 1, 'Pastry delivery');

INSERT INTO schedule (store_id, emp_id, shift_date, shift_hours, role) VALUES
    (1, 1, '2024-01-15', 8, 'Barista'),
    (1, 2, '2024-01-15', 6, 'Manager'),
    (1, 3, '2024-01-15', 8, 'Barista'),
    (1, 1, '2024-01-16', 8, 'Barista'),
    (1, 2, '2024-01-16', 6, 'Manager'),
    (1, 3, '2024-01-16', 8, 'Barista');
