const { listPaymentsByOrg } = require('../models/payments');
const { listRiskHistoryByOrg } = require('../models/risk');
const { listConsumersWithLatestScore } = require('../models/consumers');

async function dashboard(req, res, next) {
  try {
    const orgId = req.user.orgId;

    const [consumers, payments, riskHistory] = await Promise.all([
      listConsumersWithLatestScore(orgId),
      listPaymentsByOrg(orgId),
      listRiskHistoryByOrg(orgId)
    ]);

    return res.json({ consumers, payments, riskHistory });
  } catch (err) {
    return next(err);
  }
}

module.exports = { dashboard };
