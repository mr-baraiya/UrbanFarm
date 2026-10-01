/**
 * Generate a random string (for tokens, etc.)
 */
exports.generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format date to YYYY-MM-DD
 */
exports.formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Calculate days between two dates
 */
exports.daysBetween = (date1, date2) => {
  const diff = new Date(date2) - new Date(date1);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Slugify a string
 */
exports.slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
};

/**
 * Check if object is empty
 */
exports.isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};