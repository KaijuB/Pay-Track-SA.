const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { uploadCsv } = require('../controllers/csvController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload_csv', requireAuth, upload.single('file'), uploadCsv);

module.exports = router;
