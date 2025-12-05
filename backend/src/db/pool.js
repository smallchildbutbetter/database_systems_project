import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const poolConfig = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
};

if (process.env.PGPASSWORD) {
  poolConfig.password = process.env.PGPASSWORD;
}

const pool = new Pool(poolConfig);

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database connected successfully');
  }
});

export default pool;
