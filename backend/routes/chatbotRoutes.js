const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { sendMessage, recordFeedback, getAnalytics } = require('../controllers/chatbotController');
const { optionalProtect } = require('../middleware/authMiddleware');

// Rate limiting: 60 requests per 15 minutes per IP
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests to Krishi AI. Please wait a few moments before asking another question.',
  },
});

// Feedback rate limit: 40 per 15 mins
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/chat/message (Rate limited, public / optional authenticated)
router.post('/message', chatLimiter, optionalProtect, sendMessage);

// POST /api/chat/feedback (Rate limited feedback collection)
router.post('/feedback', feedbackLimiter, recordFeedback);

// GET /api/chat/analytics (Aggregated stats & metrics)
router.get('/analytics', getAnalytics);

module.exports = router;
