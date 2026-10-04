const mongoose = require('mongoose');

const ChatLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for guest/unauthenticated users
    },
    sessionId: {
      type: String,
      default: null, // optional: front-end session id
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'gu'],
      default: 'en',
    },
    userMessage: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    botReply: {
      type: String,
      required: true,
    },
    intent: {
      type: String,
      default: 'general',
    },
    source: {
      type: String,
      enum: ['gemini', 'fallback', 'cache', 'knowledge_base'],
      default: 'gemini',
    },
    confidence: {
      type: Number,
      default: null,
    },
    latencyMs: {
      type: Number,
      default: null,
    },
    followUpSuggestions: [String],
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick admin queries
ChatLogSchema.index({ createdAt: -1 });
ChatLogSchema.index({ userId: 1 });
ChatLogSchema.index({ language: 1 });
ChatLogSchema.index({ intent: 1 });

module.exports = mongoose.model('ChatLog', ChatLogSchema);
