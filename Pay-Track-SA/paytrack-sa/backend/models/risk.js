const { pool } = require('./db');

async function upsertRiskScore({ consumer_id, month, score, notes }) {
  const q = `
    INSERT INTO risk_score_history (consumer_id, month, score, notes)
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (consumer_id, month)
    DO UPDATE SET score = EXCLUDED.score, notes = EXCLUDED.notes
    RETURNING id, consumer_id, month, score, notes
  `;
  const { rows } = await pool.query(q, [consumer_id, month, score, notes]);
  return rows[0];
}

async function listRiskHistoryByOrg(organization_id) {
  const q = `
    SELECT r.*, c.full_name, c.id_number
    FROM risk_score_history r
    JOIN consumers c ON c.id = r.consumer_id
    WHERE c.organization_id = $1
    ORDER BY r.month ASC
  `;
  const { rows } = await pool.query(q, [organization_id]);
  return rows;
}

async function listRiskHistoryByConsumer(consumer_id) {
  const { rows } = await pool.query(
    `SELECT * FROM risk_score_history WHERE consumer_id=$1 ORDER BY month ASC`,
    [consumer_id]
  );
  return rows;
}

module.exports = { upsertRiskScore, listRiskHistoryByOrg, listRiskHistoryByConsumer };
