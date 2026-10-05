const express = require('express');
const router = express.Router();
const { getMarketPrices } = require('../controllers/marketController');

// Public route to fetch AGMARKNET market prices
router.get('/prices', getMarketPrices);
router.get('/', getMarketPrices);

module.exports = router;
