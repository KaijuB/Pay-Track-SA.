const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { generateLetter } = require('../controllers/lettersController');

const router = express.Router();

router.post('/generate_letter', requireAuth, generateLetter);

module.exports = router;
