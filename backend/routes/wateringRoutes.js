const express = require('express');
const router = express.Router();
const {
  generateWateringSchedule,
  getPlantWateringSchedule,
  getAllWateringSchedules,
  updateSchedule,
  getAiAdvice,
} = require('../controllers/wateringController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateWateringSchedule);
router.post('/ai-advice', getAiAdvice);
router.get('/all', protect, getAllWateringSchedules);
router.get('/plant/:plantId', protect, getPlantWateringSchedule);
router.put('/:scheduleId', protect, updateSchedule);

module.exports = router;