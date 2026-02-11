const { pool } = require('./db');

async function insertPaymentRecord({ consumer_id, month, amount_due, amount_paid, date_paid, status }) {
  const q = `
    INSERT INTO payment_records (consumer_id, month, amount_due, amount_paid, date_paid, status)
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (consumer_id, month)
    DO UPDATE SET
      amount_due = EXCLUDED.amount_due,
      amount_paid = EXCLUDED.amount_paid,
      date_paid = EXCLUDED.date_paid,
      status = EXCLUDED.status
    RETURNING id, consumer_id, month, amount_due, amount_paid, date_paid, status
  `;
  const { rows } = await pool.query(q, [
    consumer_id,
    month,
    amount_due,
    amount_paid,
    date_paid,
    status,
  ]);
  return rows[0];
}

async function listPaymentsByOrg(organization_id) {
  const q = `
    SELECT p.*, c.full_name, c.id_number
    FROM payment_records p
    JOIN consumers c ON c.id = p.consumer_id
    WHERE c.organization_id = $1
    ORDER BY p.month DESC, c.full_name ASC
  `;
  const { rows } = await pool.query(q, [organization_id]);
  return rows;
}

async function listPaymentsByConsumer(consumer_id) {
  const { rows } = await pool.query(
    `SELECT * FROM payment_records WHERE consumer_id=$1 ORDER BY month ASC`,
    [consumer_id]
  );
  return rows;
}

module.exports = { insertPaymentRecord, listPaymentsByOrg, listPaymentsByConsumer };
