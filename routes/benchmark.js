const express = require('express');
const router = express.Router();
const { getBenchmark } = require('../controllers/benchmarkController');

router.get('/', getBenchmark);

module.exports = router;
