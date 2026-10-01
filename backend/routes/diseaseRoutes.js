const express = require('express');
const router = express.Router();
const { diagnosePlant, getDiagnosisHistory, getDiagnosisById } = require('../controllers/diseaseController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/diagnose', protect, aiLimiter, uploadSingle, handleUploadError, diagnosePlant);
router.get('/history', protect, getDiagnosisHistory);
router.get('/:id', protect, getDiagnosisById);

module.exports = router;