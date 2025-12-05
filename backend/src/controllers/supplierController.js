import pool from '../db/pool.js';

export const getSupplierPriceComparison = async (req, res, next) => {
  try {
    const result = await pool.query(
      `WITH price_stats AS (
        SELECT
          p.product_id,
          p.name AS product_name,
          MIN(sp.price) AS best_price,
          MAX(sp.price) AS worst_price
        FROM product p
        JOIN supplierprice sp ON sp.product_id = p.product_id
        GROUP BY p.product_id, p.name
      ),
      best_suppliers_data AS (
        SELECT
          ps.product_id,
          JSON_AGG(DISTINCT jsonb_build_object('supplier_id', s.supplier_id, 'name', s.name, 'price', sp.price)) AS suppliers
        FROM price_stats ps
        JOIN supplierprice sp ON sp.product_id = ps.product_id AND sp.price = ps.best_price
        JOIN supplier s ON s.supplier_id = sp.supplier_id
        GROUP BY ps.product_id
      ),
      worst_suppliers_data AS (
        SELECT
          ps.product_id,
          JSON_AGG(DISTINCT jsonb_build_object('supplier_id', s.supplier_id, 'name', s.name, 'price', sp.price)) AS suppliers
        FROM price_stats ps
        JOIN supplierprice sp ON sp.product_id = ps.product_id AND sp.price = ps.worst_price
        JOIN supplier s ON s.supplier_id = sp.supplier_id
        GROUP BY ps.product_id
      )
      SELECT
        ps.product_id,
        ps.product_name,
        ps.best_price,
        ps.worst_price,
        COALESCE(bs.suppliers, '[]'::json) AS best_suppliers,
        COALESCE(ws.suppliers, '[]'::json) AS worst_suppliers
      FROM price_stats ps
      LEFT JOIN best_suppliers_data bs ON ps.product_id = bs.product_id
      LEFT JOIN worst_suppliers_data ws ON ps.product_id = ws.product_id
      ORDER BY ps.product_id`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getSupplierPriceHistory = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    if (Number.isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const result = await pool.query(
      `SELECT
        sp.supplier_id,
        s.name AS supplier_name,
        sp.price,
        sp.effective_date
      FROM supplierprice sp
      JOIN supplier s ON s.supplier_id = sp.supplier_id
      WHERE sp.product_id = $1
      ORDER BY sp.effective_date DESC`,
      [productId]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

