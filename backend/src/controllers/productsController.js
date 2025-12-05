import pool from '../db/pool.js';
import { productSchema } from '../utils/validation.js';

export const getProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const result = await pool.query(
      `SELECT 
        p.product_id,
        p.name,
        p.size,
        p.cost,
        p.price,
        c.name AS category_name
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
      ORDER BY p.product_id
      LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const validated = productSchema.parse(req.body);
    const { name, size, cost, price, category_id } = validated;

    const result = await pool.query(
      `INSERT INTO product (name, size, cost, price, category_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, size || null, cost || null, price || null, category_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const productId = parseInt(req.params.id, 10);
    if (Number.isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    // Check if product exists
    const productCheck = await client.query(
      'SELECT product_id FROM product WHERE product_id = $1',
      [productId]
    );

    if (productCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await client.query('BEGIN');

    // Delete related records first (in order of dependencies)
    // Delete supplier prices for this product
    await client.query(
      'DELETE FROM supplierprice WHERE product_id = $1',
      [productId]
    );

    // Note: saleitem references product but has ON DELETE CASCADE in schema
    // So saleitems will be automatically deleted when we delete the product
    // But we can't delete products that have been sold (saleitem references them)
    // Check if product has been used in any sales
    const saleCheck = await client.query(
      'SELECT COUNT(*) as count FROM saleitem WHERE product_id = $1',
      [productId]
    );

    if (parseInt(saleCheck.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Cannot delete product', 
        message: 'Product has been used in sales and cannot be deleted' 
      });
    }

    // Now delete the product
    const result = await client.query(
      'DELETE FROM product WHERE product_id = $1 RETURNING product_id',
      [productId]
    );

    await client.query('COMMIT');
    res.json({ success: true, product_id: result.rows[0].product_id });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

