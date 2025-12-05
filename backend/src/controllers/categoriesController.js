import pool from '../db/pool.js';

export const getCategories = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM category ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

