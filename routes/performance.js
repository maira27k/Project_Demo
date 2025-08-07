const express = require('express');
const router = express.Router();
const { getPerformanceLogs } = require('../controllers/performanceController');

router.get('/', getPerformanceLogs);

module.exports = router;
