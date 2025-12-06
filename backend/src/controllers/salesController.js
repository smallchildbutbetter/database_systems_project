import pool from '../db/pool.js';
import { saleSchema } from '../utils/validation.js';

const mapProductsById = (rows) =>
  rows.reduce((acc, row) => {
    acc[row.product_id] = row.price;
    return acc;
  }, {});

export const getSales = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await pool.query(
      `SELECT 
        s.sale_id,
        s.sale_date,
        st.location AS store_location,
        e.name AS employee_name,
        c.name AS customer_name,
        s.payment_method,
        (SELECT SUM(qty * unit_price) FROM saleitem WHERE sale_id = s.sale_id) AS total,
        (SELECT COUNT(*) FROM saleitem WHERE sale_id = s.sale_id) AS item_count
      FROM sale s
      LEFT JOIN store st ON s.store_id = st.store_id
      LEFT JOIN employee e ON s.emp_id = e.emp_id
      LEFT JOIN customer c ON s.customer_id = c.customer_id
      ORDER BY s.sale_date DESC
      LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const createSale = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const validated = saleSchema.parse(req.body);
    const {
      sale_date,
      store_id,
      emp_id,
      customer_id,
      payment_method,
      items,
    } = validated;

    const productIds = [...new Set(items.map((i) => i.product_id))];
    const productPricesResult = await client.query(
      'SELECT product_id, price FROM product WHERE product_id = ANY($1)',
      [productIds]
    );
    const productPriceMap = mapProductsById(productPricesResult.rows);

    await client.query('BEGIN');
    
    // Parse sale_date if it's a string
    let parsedSaleDate = null;
    if (sale_date) {
      parsedSaleDate = sale_date instanceof Date ? sale_date : new Date(sale_date);
      if (isNaN(parsedSaleDate.getTime())) {
        throw new Error('Invalid sale date format');
      }
    }
    
    const saleResult = await client.query(
      `INSERT INTO sale (sale_date, store_id, emp_id, customer_id, payment_method)
       VALUES (COALESCE($1, NOW()), $2, $3, $4, $5)
       RETURNING sale_id`,
      [parsedSaleDate, store_id, emp_id || null, customer_id || null, payment_method || null]
    );

    const saleId = saleResult.rows[0].sale_id;

    for (const item of items) {
      const resolvedPrice =
        item.unit_price ??
        productPriceMap[item.product_id] ??
        null;
      if (resolvedPrice === null) {
        throw new Error(`Missing price for product ${item.product_id}`);
      }

      await client.query(
        `INSERT INTO saleitem (sale_id, product_id, qty, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [saleId, item.product_id, item.qty, resolvedPrice]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ sale_id: saleId });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const updateSale = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const saleId = parseInt(req.params.id, 10);
    if (Number.isNaN(saleId)) {
      return res.status(400).json({ error: 'Invalid sale id' });
    }

    const validated = saleSchema.partial().parse(req.body);
    if (Object.keys(validated).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await client.query('BEGIN');

    const existingSale = await client.query(
      'SELECT * FROM sale WHERE sale_id = $1',
      [saleId]
    );
    if (existingSale.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Sale not found' });
    }

    const payloadFields = [];
    const payloadValues = [];
    let idx = 1;

    if (validated.sale_date !== undefined) {
      payloadFields.push(`sale_date = $${idx++}`);
      payloadValues.push(new Date(validated.sale_date));
    }
    if (validated.store_id !== undefined) {
      payloadFields.push(`store_id = $${idx++}`);
      payloadValues.push(validated.store_id);
    }
    if (validated.emp_id !== undefined) {
      payloadFields.push(`emp_id = $${idx++}`);
      payloadValues.push(validated.emp_id);
    }
    if (validated.customer_id !== undefined) {
      payloadFields.push(`customer_id = $${idx++}`);
      payloadValues.push(validated.customer_id);
    }
    if (validated.payment_method !== undefined) {
      payloadFields.push(`payment_method = $${idx++}`);
      payloadValues.push(validated.payment_method);
    }

    if (payloadFields.length > 0) {
      payloadValues.push(saleId);
      await client.query(
        `UPDATE sale SET ${payloadFields.join(', ')} WHERE sale_id = $${payloadValues.length}`,
        payloadValues
      );
    }

    if (validated.items) {
      const productIds = [...new Set(validated.items.map((i) => i.product_id))];
      const productPricesResult = await client.query(
        'SELECT product_id, price FROM product WHERE product_id = ANY($1)',
        [productIds]
      );
      const productPriceMap = mapProductsById(productPricesResult.rows);

      await client.query('DELETE FROM saleitem WHERE sale_id = $1', [saleId]);

      for (const item of validated.items) {
        const resolvedPrice =
          item.unit_price ??
          productPriceMap[item.product_id] ??
          null;
        if (resolvedPrice === null) {
          throw new Error(`Missing price for product ${item.product_id}`);
        }

        await client.query(
          `INSERT INTO saleitem (sale_id, product_id, qty, unit_price)
           VALUES ($1, $2, $3, $4)`,
          [saleId, item.product_id, item.qty, resolvedPrice]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, sale_id: saleId });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const deleteSale = async (req, res, next) => {
  try {
    const saleId = parseInt(req.params.id, 10);
    if (Number.isNaN(saleId)) {
      return res.status(400).json({ error: 'Invalid sale id' });
    }

    const result = await pool.query(
      'DELETE FROM sale WHERE sale_id = $1 RETURNING sale_id',
      [saleId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const revenueCostProfit = await pool.query(
      `SELECT
        SUM(CASE WHEN s.sale_date >= NOW() - INTERVAL '7 days' THEN si.qty * si.unit_price END) AS revenue_7d,
        SUM(CASE WHEN s.sale_date >= NOW() - INTERVAL '7 days' THEN si.qty * COALESCE(p.cost, 0) END) AS cost_7d,
        SUM(CASE WHEN s.sale_date >= NOW() - INTERVAL '30 days' THEN si.qty * si.unit_price END) AS revenue_30d,
        SUM(CASE WHEN s.sale_date >= NOW() - INTERVAL '30 days' THEN si.qty * COALESCE(p.cost, 0) END) AS cost_30d
       FROM sale s
       JOIN saleitem si ON s.sale_id = si.sale_id
       JOIN product p ON si.product_id = p.product_id`
    );

    const topProfitable = await pool.query(
      `SELECT 
        p.name,
        SUM(si.qty * (si.unit_price - COALESCE(p.cost, 0))) AS profit,
        SUM(si.qty * si.unit_price) AS revenue,
        SUM(si.qty * COALESCE(p.cost, 0)) AS cost
       FROM product p
       JOIN saleitem si ON p.product_id = si.product_id
       JOIN sale s ON si.sale_id = s.sale_id
       WHERE s.sale_date >= NOW() - INTERVAL '7 days'
       GROUP BY p.product_id, p.name
       ORDER BY profit DESC
       LIMIT 5`
    );

    const bottomProfitable = await pool.query(
      `SELECT 
        p.name,
        SUM(si.qty * (si.unit_price - COALESCE(p.cost, 0))) AS profit,
        SUM(si.qty * si.unit_price) AS revenue,
        SUM(si.qty * COALESCE(p.cost, 0)) AS cost
       FROM product p
       JOIN saleitem si ON p.product_id = si.product_id
       JOIN sale s ON si.sale_id = s.sale_id
       WHERE s.sale_date >= NOW() - INTERVAL '7 days'
       GROUP BY p.product_id, p.name
       ORDER BY profit ASC
       LIMIT 5`
    );

    const drinksPerHour = await pool.query(
      `SELECT 
        EXTRACT(HOUR FROM sale_date) AS hour,
        COUNT(*) AS count
       FROM sale
       WHERE sale_date >= NOW() - INTERVAL '7 days'
       GROUP BY EXTRACT(HOUR FROM sale_date)
       ORDER BY hour`
    );

    const revCost = revenueCostProfit.rows[0];
    const revenue7d = parseFloat(revCost.revenue_7d) || 0;
    const cost7d = parseFloat(revCost.cost_7d) || 0;
    const revenue30d = parseFloat(revCost.revenue_30d) || 0;
    const cost30d = parseFloat(revCost.cost_30d) || 0;

    res.json({
      revenue_7d: revenue7d,
      expenses_7d: cost7d,
      profit_7d: revenue7d - cost7d,
      revenue_30d: revenue30d,
      expenses_30d: cost30d,
      profit_30d: revenue30d - cost30d,
      top_products: topProfitable.rows.map((row) => ({
        name: row.name,
        revenue: parseFloat(row.revenue) || 0,
        cost: parseFloat(row.cost) || 0,
        profit: parseFloat(row.profit) || 0,
      })),
      bottom_products: bottomProfitable.rows.map((row) => ({
        name: row.name,
        revenue: parseFloat(row.revenue) || 0,
        cost: parseFloat(row.cost) || 0,
        profit: parseFloat(row.profit) || 0,
      })),
      drinks_per_hour: drinksPerHour.rows.map((row) => ({
        hour: parseInt(row.hour, 10),
        count: parseInt(row.count, 10),
      })),
    });
  } catch (error) {
    next(error);
  }
};
