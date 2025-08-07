const express = require('express');
const router = express.Router();
const { getPortfolioItems, addItem, removeItem } = require('../controllers/portfolioController');

router.get('/', getPortfolioItems);
router.post('/add', addItem);
router.delete('/remove/:id', removeItem);

module.exports = router;
