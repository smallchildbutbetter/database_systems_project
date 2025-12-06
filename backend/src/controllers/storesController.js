import pool from '../db/pool.js';

export const getStores = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT store_id, location FROM store ORDER BY store_id'
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

