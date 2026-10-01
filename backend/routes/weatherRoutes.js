const express = require('express');
const router = express.Router();
const { getWeather, getForecast } = require('../controllers/weatherController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWeather);
router.get('/forecast', protect, getForecast);

module.exports = router;