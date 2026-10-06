const express = require('express');
const router = express.Router();
const {
  addPlant,
  getPlants,
  getPlantById,
  updatePlant,
  waterPlant,
  deletePlant,
  addTimelineEntry,
} = require('../controllers/plantController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { plantValidation } = require('../middleware/validationMiddleware');

router.route('/')
  .post(protect, plantValidation, addPlant)
  .get(protect, getPlants);

router.post('/:id/water', protect, waterPlant);

router.route('/:id')
  .get(optionalProtect, getPlantById)
  .put(protect, updatePlant)
  .delete(protect, deletePlant);

router.post('/:id/timeline', protect, addTimelineEntry);

module.exports = router;