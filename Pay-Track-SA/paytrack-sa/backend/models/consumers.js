const { pool } = require('./db');

async function upsertConsumer({ organization_id, full_name, id_number, contact_email, contact_phone, consent_flag }) {
  const q = `
    INSERT INTO consumers (organization_id, full_name, id_number, contact_email, contact_phone, consent_flag)
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (organization_id, id_number)
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      contact_email = COALESCE(EXCLUDED.contact_email, consumers.contact_email),
      contact_phone = COALESCE(EXCLUDED.contact_phone, consumers.contact_phone),
      consent_flag = consumers.consent_flag OR EXCLUDED.consent_flag
    RETURNING id, organization_id, full_name, id_number, contact_email, contact_phone, consent_flag, created_at
  `;
  const { rows } = await pool.query(q, [
    organization_id,
    full_name,
    id_number,
    contact_email || null,
    contact_phone || null,
    !!consent_flag,
  ]);
  return rows[0];
}

async function listConsumersWithLatestScore(organization_id) {
  const q = `
    SELECT c.*, r.score AS latest_score, r.month AS score_month, r.notes AS score_notes
    FROM consumers c
    LEFT JOIN LATERAL (
      SELECT score, month, notes
      FROM risk_score_history r
      WHERE r.consumer_id = c.id
      ORDER BY r.month DESC
      LIMIT 1
    ) r ON true
    WHERE c.organization_id = $1
    ORDER BY c.full_name ASC
  `;
  const { rows } = await pool.query(q, [organization_id]);
  return rows;
}

module.exports = { upsertConsumer, listConsumersWithLatestScore };

async function getConsumerById(consumer_id, organization_id) {
  const { rows } = await pool.query(
    `SELECT * FROM consumers WHERE id=$1 AND organization_id=$2`,
    [consumer_id, organization_id]
  );
  return rows[0] || null;
}

module.exports.getConsumerById = getConsumerById;
