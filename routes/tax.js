const express = require('express');
const router = express.Router();
const { getTaxRecords, addTaxRecord } = require('../controllers/taxController');

router.get('/', getTaxRecords);
router.post('/add', addTaxRecord);

module.exports = router;
