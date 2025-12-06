import pool from '../db/pool.js';

export const getExpenses = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const result = await pool.query(
      `SELECT 
        e.expense_id,
        e.category,
        e.amount,
        e.date,
        e.note,
        st.location AS store_location,
        s.name AS supplier_name,
        s.contact AS supplier_contact
      FROM expense e
      LEFT JOIN store st ON e.store_id = st.store_id
      LEFT JOIN supplier s ON e.supplier_id = s.supplier_id
      ORDER BY e.date DESC, e.expense_id DESC
      LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

