const express = require('express');
const router = express.Router();
const {
  createGarden,
  getGardens,
  getGardenById,
  updateGarden,
  deleteGarden,
} = require('../controllers/gardenController');
const { protect } = require('../middleware/authMiddleware');
const { gardenValidation } = require('../middleware/validationMiddleware');

router.route('/')
  .post(protect, gardenValidation, createGarden)
  .get(protect, getGardens);

router.route('/:id')
  .get(protect, getGardenById)
  .put(protect, updateGarden)
  .delete(protect, deleteGarden);

module.exports = router;