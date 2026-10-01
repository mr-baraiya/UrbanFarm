const express = require('express');
const router = express.Router();
const { 
  getCropRecommendations, 
  getRecommendationHistory, 
  saveRecommendation 
} = require('../controllers/cropController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/recommend', protect, aiLimiter, getCropRecommendations);
router.get('/history', protect, getRecommendationHistory);
router.put('/save/:id', protect, saveRecommendation);

module.exports = router;