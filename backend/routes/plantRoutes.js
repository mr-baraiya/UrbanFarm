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
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { plantValidation } = require('../middleware/validationMiddleware');

router.route('/')
  .post(protect, plantValidation, addPlant)
  .get(protect, getPlants);

router.route('/:id')
  .get(optionalProtect, getPlantById)
  .put(protect, updatePlant)
  .delete(protect, deletePlant);

router.post('/:id/timeline', protect, addTimelineEntry);

module.exports = router;