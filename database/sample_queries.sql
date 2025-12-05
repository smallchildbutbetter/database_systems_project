WITH sales AS (
    SELECT s.sale_id, s.sale_date, si.qty, si.unit_price, si.product_id
    FROM sale s
    JOIN saleitem si ON s.sale_id = si.sale_id
)
SELECT
    SUM(CASE WHEN sale_date >= NOW() - INTERVAL '7 days' THEN qty * unit_price END) AS revenue_7d,
    SUM(CASE WHEN sale_date >= NOW() - INTERVAL '7 days' THEN qty * COALESCE(p.cost,0) END) AS cost_7d,
    SUM(CASE WHEN sale_date >= NOW() - INTERVAL '7 days' THEN qty * (unit_price - COALESCE(p.cost,0)) END) AS profit_7d,
    SUM(CASE WHEN sale_date >= NOW() - INTERVAL '30 days' THEN qty * unit_price END) AS revenue_30d,
    SUM(CASE WHEN sale_date >= NOW() - INTERVAL '30 days' THEN qty * COALESCE(p.cost,0) END) AS cost_30d,
    SUM(CASE WHEN sale_date >= NOW() - INTERVAL '30 days' THEN qty * (unit_price - COALESCE(p.cost,0)) END) AS profit_30d
FROM sales
JOIN product p ON sales.product_id = p.product_id;

SELECT
    p.name,
    p.size,
    SUM(si.qty) AS qty_sold,
    SUM(si.qty * si.unit_price) AS revenue,
    SUM(si.qty * COALESCE(p.cost,0)) AS cost,
    SUM(si.qty * (si.unit_price - COALESCE(p.cost,0))) AS profit,
    CASE WHEN SUM(si.qty * si.unit_price) = 0 THEN 0
         ELSE ROUND(SUM(si.qty * (si.unit_price - COALESCE(p.cost,0))) / SUM(si.qty * si.unit_price) * 100, 2)
    END AS margin_pct
FROM sale s
JOIN saleitem si ON s.sale_id = si.sale_id
JOIN product p ON si.product_id = p.product_id
WHERE s.sale_date >= NOW() - INTERVAL '7 days'
GROUP BY p.product_id, p.name, p.size
ORDER BY profit DESC;

SELECT
    p.product_id,
    p.name,
    MIN(sp.price) AS best_price,
    MAX(sp.price) AS worst_price,
    ARRAY_AGG(DISTINCT sp.supplier_id) FILTER (WHERE sp.price = MIN(sp.price)) AS best_suppliers,
    ARRAY_AGG(DISTINCT sp.supplier_id) FILTER (WHERE sp.price = MAX(sp.price)) AS worst_suppliers
FROM product p
JOIN supplierprice sp ON sp.product_id = p.product_id
GROUP BY p.product_id, p.name
ORDER BY p.product_id;

SELECT
    p.name,
    sp.supplier_id,
    sp.price,
    sp.effective_date
FROM supplierprice sp
JOIN product p ON sp.product_id = p.product_id
WHERE p.product_id = 2
ORDER BY sp.effective_date DESC;

SELECT
    EXTRACT(HOUR FROM sale_date) AS hour,
    COUNT(*) AS sale_count,
    SUM((SELECT SUM(qty * unit_price) FROM saleitem WHERE sale_id = s.sale_id)) AS total_revenue
FROM sale s
GROUP BY EXTRACT(HOUR FROM sale_date)
ORDER BY hour;

SELECT
    DATE(sale_date) AS sale_day,
    COUNT(DISTINCT s.sale_id) AS sale_count,
    SUM(si.qty * si.unit_price) AS daily_revenue
FROM sale s
JOIN saleitem si ON s.sale_id = si.sale_id
GROUP BY DATE(sale_date)
ORDER BY sale_day DESC;

SELECT store_id, emp_id, shift_date, shift_hours, role
FROM schedule
WHERE store_id = 1
ORDER BY shift_date, emp_id;
