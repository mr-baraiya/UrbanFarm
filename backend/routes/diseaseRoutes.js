const express = require('express');
const router = express.Router();
const { 
  diagnosePlant, 
  getDiagnosisHistory, 
  getDiagnosisById,
  getPublicDiagnosis,
  getGeminiTipsForDiagnosis,
  translateDiagnosis,
  toggleShareStatus,
  deleteDiagnosis
} = require('../controllers/diseaseController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

// Public route for shared report (strictly no auth needed, no user details)
router.get('/public/:shareId', getPublicDiagnosis);

// Diagnosis actions (allows authenticated users as well as guest / mobile app requests)
router.post('/diagnose', optionalProtect, aiLimiter, uploadSingle, handleUploadError, diagnosePlant);
router.post('/analyze', optionalProtect, aiLimiter, uploadSingle, handleUploadError, diagnosePlant);
router.get('/history', protect, getDiagnosisHistory);
router.post('/:id/tips', protect, aiLimiter, getGeminiTipsForDiagnosis);
router.post('/:id/translate', optionalProtect, aiLimiter, translateDiagnosis);
router.put('/:id/share', protect, toggleShareStatus);
router.delete('/:id', protect, deleteDiagnosis);
router.get('/:id', optionalProtect, getDiagnosisById);

module.exports = router;