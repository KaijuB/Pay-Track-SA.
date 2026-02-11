const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

(async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Missing DATABASE_URL');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    const sql = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Migration complete');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
