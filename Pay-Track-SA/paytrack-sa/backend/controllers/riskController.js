const { z } = require('zod');
const { listPaymentsByConsumer } = require('../models/payments');
const { upsertRiskScore, listRiskHistoryByConsumer } = require('../models/risk');

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function statusDelta(status) {
  if (status === 'Paid') return 15;
  if (status === 'Late') return -20;
  if (status === 'Missed') return -60;
  return 0;
}

async function recomputeRiskHistory(consumer_id) {
  const payments = await listPaymentsByConsumer(consumer_id);
  let score = 500; // neutral baseline

  for (const p of payments) {
    score += 2; // +2 per month active
    score += statusDelta(p.status);
    score = clamp(score, 0, 1000);

    const notes = `Rules: +2 active month, ${p.status}=${statusDelta(p.status)}`;
    await upsertRiskScore({ consumer_id, month: p.month, score, notes });
  }

  return await listRiskHistoryByConsumer(consumer_id);
}

const RiskSchema = z.object({ consumer_id: z.number().int().positive() });

async function riskScore(req, res, next) {
  try {
    const { consumer_id } = RiskSchema.parse(req.query);
    const history = await recomputeRiskHistory(consumer_id);
    const latest = history[history.length - 1] || null;
    return res.json({ consumer_id, latest, history });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.flatten() });
    return next(err);
  }
}

module.exports = { recomputeRiskHistory, riskScore };
