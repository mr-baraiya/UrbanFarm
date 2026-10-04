/**
 * In-Memory Caching & Analytics Monitoring Service for Krishi AI
 * Tracks request metrics, latency, intent frequency, cache hits, and user feedback.
 */

const { v4: uuidv4 } = require('uuid');

// In-memory cache map: key -> { data, expiresAt }
const responseCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL
const MAX_CACHE_SIZE = 500;

// In-memory analytics metrics
const metrics = {
  totalQueries: 0,
  geminiSuccessCount: 0,
  cacheHitCount: 0,
  fallbackCount: 0,
  errorsCount: 0,
  intentCounts: {},
  languageCounts: { en: 0, gu: 0, hi: 0 },
  feedbackStats: { likes: 0, dislikes: 0, items: [] },
  recentQueries: [] // Last 50 queries for debugging & review
};

/**
 * Generate a normalized cache key from user message and language
 */
function getCacheKey(message, language, contextPlant = '') {
  const clean = (message || '')
    .toLowerCase()
    .replace(/[^\w\s\u0A80-\u0AFF\u0900-\u097F]/gi, '')
    .trim()
    .replace(/\s+/g, ' ');
  return `${language}:${clean}:${contextPlant || 'none'}`;
}

/**
 * Get response from cache if not expired
 */
function getCachedResponse(message, language, contextPlant = '') {
  const key = getCacheKey(message, language, contextPlant);
  const item = responseCache.get(key);

  if (!item) return null;

  if (Date.now() > item.expiresAt) {
    responseCache.delete(key);
    return null;
  }

  metrics.cacheHitCount++;
  return item.data;
}

/**
 * Store response in cache with TTL
 */
function setCachedResponse(message, language, contextPlant = '', data) {
  if (responseCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest item
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }

  const key = getCacheKey(message, language, contextPlant);
  responseCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS
  });
}

/**
 * Log query metrics safely (no sensitive data)
 */
function logQuery({ message, language, intent, source, latencyMs, error = null }) {
  const reqId = uuidv4().slice(0, 8);
  metrics.totalQueries++;

  if (source === 'gemini') metrics.geminiSuccessCount++;
  if (source === 'fallback') metrics.fallbackCount++;
  if (error) metrics.errorsCount++;

  // Update intent counts
  metrics.intentCounts[intent] = (metrics.intentCounts[intent] || 0) + 1;

  // Update language counts
  if (metrics.languageCounts[language] !== undefined) {
    metrics.languageCounts[language]++;
  }

  // Keep last 50 queries
  metrics.recentQueries.unshift({
    id: reqId,
    timestamp: new Date().toISOString(),
    language,
    intent,
    source,
    latencyMs,
    error: error ? error.message : null,
    snippet: (message || '').slice(0, 60)
  });

  if (metrics.recentQueries.length > 50) {
    metrics.recentQueries.pop();
  }

  console.log(`[KrishiAI][${reqId}] intent=${intent} lang=${language} src=${source} latency=${latencyMs}ms`);
  return reqId;
}

/**
 * Record user feedback (thumbs up / down)
 */
function recordFeedback({ messageId, rating, feedbackText = '', question = '', reply = '' }) {
  const isLike = rating === 'like' || rating === 'up';
  if (isLike) {
    metrics.feedbackStats.likes++;
  } else {
    metrics.feedbackStats.dislikes++;
  }

  const feedbackEntry = {
    id: uuidv4().slice(0, 8),
    messageId: messageId || 'anonymous',
    rating: isLike ? 'like' : 'dislike',
    feedbackText: String(feedbackText || '').slice(0, 300),
    questionSnippet: String(question || '').slice(0, 100),
    replySnippet: String(reply || '').slice(0, 100),
    timestamp: new Date().toISOString()
  };

  metrics.feedbackStats.items.unshift(feedbackEntry);
  if (metrics.feedbackStats.items.length > 100) {
    metrics.feedbackStats.items.pop();
  }

  return feedbackEntry;
}

/**
 * Get aggregated analytics
 */
function getAnalyticsSummary() {
  return {
    totalQueries: metrics.totalQueries,
    geminiSuccessCount: metrics.geminiSuccessCount,
    cacheHitCount: metrics.cacheHitCount,
    fallbackCount: metrics.fallbackCount,
    errorsCount: metrics.errorsCount,
    intentBreakdown: metrics.intentCounts,
    languageBreakdown: metrics.languageCounts,
    feedback: {
      likes: metrics.feedbackStats.likes,
      dislikes: metrics.feedbackStats.dislikes,
      totalFeedback: metrics.feedbackStats.likes + metrics.feedbackStats.dislikes,
      recentItems: metrics.feedbackStats.items.slice(0, 10)
    },
    recentQueries: metrics.recentQueries.slice(0, 10)
  };
}

module.exports = {
  getCachedResponse,
  setCachedResponse,
  logQuery,
  recordFeedback,
  getAnalyticsSummary
};
