const express = require('express');
const router = express.Router();
const {
  addPlant,
  getPlants,
  getPlantById,  // ✅ Make sure this is imported
  updatePlant,
  deletePlant,
  addTimelineEntry,
} = require('../controllers/plantController');
const { protect } = require('../middleware/authMiddleware');
const { plantValidation } = require('../middleware/validationMiddleware');

router.route('/')
  .post(protect, plantValidation, addPlant)
  .get(protect, getPlants);

router.route('/:id')
  .get(protect, getPlantById)  // ✅ Make sure this route exists
  .put(protect, updatePlant)
  .delete(protect, deletePlant);

router.post('/:id/timeline', protect, addTimelineEntry);

module.exports = router;