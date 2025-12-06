import pool from '../db/pool.js';
import { employeeSchema } from '../utils/validation.js';

export const getEmployees = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        e.emp_id,
        e.name,
        e.role,
        e.wage,
        COALESCE(
          STRING_AGG(DISTINCT st.location, ', ' ORDER BY st.location),
          'No assigned location'
        ) AS store_locations
      FROM employee e
      LEFT JOIN schedule sch ON e.emp_id = sch.emp_id
      LEFT JOIN store st ON sch.store_id = st.store_id
      GROUP BY e.emp_id, e.name, e.role, e.wage
      ORDER BY e.name`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const validated = employeeSchema.parse(req.body);
    const { name, role, wage } = validated;
    const result = await pool.query(
      `INSERT INTO employee (name, role, wage)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, role || null, wage ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const empId = parseInt(req.params.id, 10);
    if (Number.isNaN(empId)) {
      return res.status(400).json({ error: 'Invalid employee id' });
    }

    const payload = employeeSchema.partial().parse(req.body);
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const result = await pool.query(
      `UPDATE employee
       SET name = COALESCE($1, name),
           role = COALESCE($2, role),
           wage = COALESCE($3, wage)
       WHERE emp_id = $4
       RETURNING *`,
      [payload.name ?? null, payload.role ?? null, payload.wage ?? null, empId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const empId = parseInt(req.params.id, 10);
    if (Number.isNaN(empId)) {
      return res.status(400).json({ error: 'Invalid employee id' });
    }

    await client.query('BEGIN');

    // Set employee to NULL in sales (preserve sales history)
    await client.query(
      'UPDATE sale SET emp_id = NULL WHERE emp_id = $1',
      [empId]
    );

    // Delete schedule entries
    await client.query(
      'DELETE FROM schedule WHERE emp_id = $1',
      [empId]
    );

    // Delete the employee
    const result = await client.query(
      'DELETE FROM employee WHERE emp_id = $1 RETURNING *',
      [empId]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Employee not found' });
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

