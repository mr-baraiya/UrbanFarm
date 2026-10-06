const express = require('express');
const router = express.Router();
const { updateProfile, getBadges, checkBadges, testBadgeEmail, updateBadgeSettings } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.get('/badges', protect, getBadges);
router.put('/badge-settings', protect, updateBadgeSettings);
router.post('/check-badges', protect, checkBadges);
router.post('/test-badge-email', protect, testBadgeEmail);

module.exports = router;