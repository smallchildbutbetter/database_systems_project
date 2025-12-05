DO $$
DECLARE
    sale_rec RECORD;
    sale_id_var INT;
    product_ids INT[] := ARRAY[1,2,3,4,5,6,7,8];
    product_prices NUMERIC[] := ARRAY[2.50, 4.50, 5.00, 3.75, 5.50, 2.50, 3.00, 2.00];
    days_ago INT;
    hours_offset NUMERIC;
    sale_date_var TIMESTAMP;
    store_ids INT[] := ARRAY[1,2,3];
    emp_ids INT[] := ARRAY[1,2,3];
    customer_ids INT[] := ARRAY[1,2,3];
    payment_methods TEXT[] := ARRAY['Credit Card', 'Cash'];
    num_items INT;
    item_product_id INT;
    item_qty INT;
    item_price NUMERIC;
    i INT;
BEGIN
    FOR i IN 1..50 LOOP
        days_ago := (i % 14) + 1;
        hours_offset := (RANDOM() * 12) + 7;
        sale_date_var := NOW() - (days_ago || ' days')::INTERVAL + (hours_offset || ' hours')::INTERVAL;
        
        INSERT INTO sale (sale_date, store_id, emp_id, customer_id, payment_method)
        VALUES (
            sale_date_var,
            store_ids[1 + (i % 3)],
            emp_ids[1 + (i % 3)],
            CASE WHEN RANDOM() < 0.3 THEN NULL ELSE customer_ids[1 + (i % 3)] END,
            payment_methods[1 + (i % 2)]
        )
        RETURNING sale_id INTO sale_id_var;
        
        num_items := 1 + (RANDOM() * 3)::INT;
        
        FOR j IN 1..num_items LOOP
            item_product_id := product_ids[1 + (RANDOM() * 7)::INT];
            item_qty := 1 + (RANDOM() * 2)::INT;
            item_price := product_prices[item_product_id];
            
            INSERT INTO saleitem (sale_id, product_id, qty, unit_price)
            VALUES (sale_id_var, item_product_id, item_qty, item_price);
        END LOOP;
    END LOOP;
END $$;
