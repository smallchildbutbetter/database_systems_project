import pool from '../db/pool.js';

const hoursForRole = (role) => {
  if (!role) return 8;
  if (role.toLowerCase().includes('manager')) return 6;
  return 8;
};

export const generateSchedule = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 7, 30);
    const startDate = req.query.start_date
      ? new Date(req.query.start_date)
      : new Date();

    const [storesResult, employeesResult] = await Promise.all([
      client.query('SELECT store_id, location FROM store ORDER BY store_id'),
      client.query('SELECT emp_id, name, role FROM employee ORDER BY emp_id'),
    ]);

    const stores = storesResult.rows;
    const employees = employeesResult.rows;

    if (stores.length === 0 || employees.length === 0) {
      return res.status(400).json({ error: 'Need at least one store and employee to generate schedule' });
    }

    let cursor = 0;
    const created = [];

    await client.query('BEGIN');

    for (let day = 0; day < days; day += 1) {
      const shiftDate = new Date(startDate);
      shiftDate.setDate(startDate.getDate() + day);

      for (const store of stores) {
        const employee = employees[cursor % employees.length];
        cursor += 1;

        const shiftHours = hoursForRole(employee.role);
        const result = await client.query(
          `INSERT INTO schedule (store_id, emp_id, shift_date, shift_hours, role)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (store_id, emp_id, shift_date) DO NOTHING
           RETURNING *`,
          [store.store_id, employee.emp_id, shiftDate, shiftHours, employee.role || null]
        );

        if (result.rows[0]) {
          created.push(result.rows[0]);
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ created_count: created.length, created });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const getSchedule = async (req, res, next) => {
  try {
    const storeId = req.query.store_id ? parseInt(req.query.store_id, 10) : null;
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    const clauses = [];
    const values = [];

    if (storeId) {
      clauses.push(`s.store_id = $${values.length + 1}`);
      values.push(storeId);
    }
    if (from) {
      clauses.push(`s.shift_date >= $${values.length + 1}`);
      values.push(from);
    }
    if (to) {
      clauses.push(`s.shift_date <= $${values.length + 1}`);
      values.push(to);
    }

    const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT 
        s.schedule_id,
        s.store_id,
        st.location AS store_location,
        s.emp_id,
        e.name AS employee_name,
        s.shift_date,
        s.shift_hours,
        COALESCE(s.role, e.role) AS role
       FROM schedule s
       LEFT JOIN store st ON s.store_id = st.store_id
       LEFT JOIN employee e ON s.emp_id = e.emp_id
       ${whereClause}
       ORDER BY s.shift_date, s.store_id, s.emp_id`,
      values
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

