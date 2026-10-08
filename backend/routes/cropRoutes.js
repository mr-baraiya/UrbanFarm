const express = require('express');
const router = express.Router();
const { 
  getCropRecommendations, 
  getRecommendationHistory, 
  saveRecommendation,
  deleteRecommendation
} = require('../controllers/cropController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/recommend', protect, aiLimiter, getCropRecommendations);
router.get('/history', protect, getRecommendationHistory);
router.put('/save/:id', protect, saveRecommendation);
router.delete('/history/:id', protect, deleteRecommendation);
router.delete('/:id', protect, deleteRecommendation);

module.exports = router;