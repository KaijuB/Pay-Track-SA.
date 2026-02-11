const { pool } = require('./db');

async function createOrganization({ name, type, email, password_hash }) {
  const q = `
    INSERT INTO organizations (name, type, email, password_hash)
    VALUES ($1,$2,$3,$4)
    RETURNING id, name, type, email, created_at
  `;
  const { rows } = await pool.query(q, [name, type, email.toLowerCase(), password_hash]);
  return rows[0];
}

async function getOrganizationByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, name, type, email, password_hash, created_at FROM organizations WHERE email = $1`,
    [email.toLowerCase()]
  );
  return rows[0] || null;
}

module.exports = { createOrganization, getOrganizationByEmail };
