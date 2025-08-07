const express = require('express');
const router = express.Router();
const { getTransactions, addTransaction } = require('../controllers/transactionsController');

router.get('/', getTransactions);
router.post('/add', addTransaction);

module.exports = router;
