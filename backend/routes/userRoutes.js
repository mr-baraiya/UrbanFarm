const express = require('express');
const router = express.Router();
const { updateProfile, getBadges } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.get('/badges', protect, getBadges);

module.exports = router;