const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { riskScore } = require('../controllers/riskController');

const router = express.Router();

router.get('/risk_score', requireAuth, riskScore);

module.exports = router;
