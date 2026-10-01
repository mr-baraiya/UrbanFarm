const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  completeTask,
  deleteTask,
} = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');
const { scheduleValidation } = require('../middleware/validationMiddleware');

router.route('/')
  .post(protect, scheduleValidation, createTask)
  .get(protect, getTasks);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.put('/:id/complete', protect, completeTask);

module.exports = router;