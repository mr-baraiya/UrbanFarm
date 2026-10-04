const chatbotService = require('../services/chatbotService');
const { recordFeedback: saveFeedback, getAnalyticsSummary } = require('../services/chatbotCacheService');
const ChatLog = require('../models/ChatLog');

// @desc    Send a message to Krishi AI Chatbot Assistant
// @route   POST /api/chat/message
// @access  Public / Optional Auth
exports.sendMessage = async (req, res, next) => {
  try {
    const { message, language, history } = req.body;

    // Input Validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message text is required and must be a string',
      });
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    if (trimmed.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long. Please limit your question to 1000 characters.',
      });
    }

    // Sanitize and validate language
    const langRaw = String(language || 'en').toLowerCase().trim().slice(0, 2);
    const lang = ['gu', 'hi'].includes(langRaw) ? langRaw : 'en';

    // Sanitize history
    const sanitizedHistory = Array.isArray(history)
      ? history.slice(-15).map((item) => ({
          sender: item.sender === 'user' ? 'user' : 'bot',
          text: String(item.text || item.content || '').slice(0, 1000),
        }))
      : [];

    const userContext = {
      role: req.user?.role || 'guest',
      name: req.user?.name || null,
    };

    const startTime = Date.now();
    const result = await chatbotService.generateChatbotResponse(
      trimmed,
      lang,
      sanitizedHistory,
      userContext
    );
    const latencyMs = Date.now() - startTime;

    // Persist conversation log to DB (non-blocking — fire & forget)
    ChatLog.create({
      userId: req.user?._id || null,
      language: lang,
      userMessage: trimmed,
      botReply: result.text,
      intent: result.intent || 'general',
      source: result.source || 'gemini',
      confidence: result.confidence || null,
      latencyMs,
      followUpSuggestions: result.followUpSuggestions || [],
      ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      userAgent: req.headers['user-agent'] ? req.headers['user-agent'].slice(0, 200) : null,
    }).catch((err) => {
      console.warn('[ChatLog] DB save failed (non-critical):', err.message);
    });

    res.status(200).json({
      success: true,
      reply: result.text,
      intent: result.intent,
      confidence: result.confidence,
      entities: result.entities || {},
      quickActions: result.quickActions || [],
      followUpSuggestions: result.followUpSuggestions || [],
      safetyNotice: result.safetyNotice || null,
      source: result.source || 'gemini',
      language: lang,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Record user feedback (thumbs up / thumbs down) for AI responses
// @route   POST /api/chat/feedback
// @access  Public
exports.recordFeedback = async (req, res, next) => {
  try {
    const { messageId, rating, feedbackText, question, reply } = req.body;

    if (!rating || !['like', 'dislike', 'up', 'down'].includes(String(rating).toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Valid rating (like or dislike) is required',
      });
    }

    const feedbackEntry = saveFeedback({
      messageId: String(messageId || 'unknown'),
      rating: String(rating).toLowerCase(),
      feedbackText: feedbackText ? String(feedbackText).slice(0, 300) : '',
      question: question ? String(question).slice(0, 200) : '',
      reply: reply ? String(reply).slice(0, 200) : '',
    });

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback! It helps improve Krishi AI.',
      data: feedbackEntry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated chatbot analytics & performance stats
// @route   GET /api/chat/analytics
// @access  Public
exports.getAnalytics = async (req, res, next) => {
  try {
    const summary = getAnalyticsSummary();
    res.status(200).json({
      success: true,
      analytics: summary,
    });
  } catch (error) {
    next(error);
  }
};
