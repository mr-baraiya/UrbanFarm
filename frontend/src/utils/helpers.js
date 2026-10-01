/**
 * Format date to readable string
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format time
 */
export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Truncate text
 */
export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
};

/**
 * Get status color based on plant status
 */
export const getStatusColor = (status) => {
  const map = {
    seedling: '#b8a9c9',
    growing: '#a8d5ba',
    mature: '#f0d5c0',
    harvested: '#d4b8a0',
    dead: '#c9b0a0',
  };
  return map[status] || '#b8a9c9';
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority) => {
  const map = {
    low: '#a8d5ba',
    medium: '#f0d5c0',
    high: '#e8b4b4',
  };
  return map[priority] || '#b8a9c9';
};

/**
 * Get confidence emoji
 */
export const getConfidenceEmoji = (conf) => {
  if (conf >= 0.8) return '🟢';
  if (conf >= 0.5) return '🟡';
  return '🔴';
};

/**
 * ✅ Get health indicator emoji based on health status
 */
export const getHealthIndicator = (health) => {
  const map = {
    healthy: '🟢',
    warning: '🟡',
    unhealthy: '🔴',
  };
  return map[health] || '🟢';
};

/**
 * ✅ Get health status label and color
 */
export const getHealthStatus = (health) => {
  const map = {
    healthy: { label: 'Healthy', color: '#a8d5ba', icon: '🟢' },
    warning: { label: 'Needs Attention', color: '#f0d5c0', icon: '🟡' },
    unhealthy: { label: 'At Risk', color: '#e8b4b4', icon: '🔴' },
  };
  return map[health] || { label: 'Unknown', color: '#9a8a7a', icon: '⚪' };
};

/**
 * Generate a random string
 */
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Calculate days between two dates
 */
export const daysBetween = (date1, date2) => {
  const diff = new Date(date2) - new Date(date1);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Slugify a string
 */
export const slugify = (text) => {
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
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get growth stage label
 */
export const getGrowthStageLabel = (status) => {
  const map = {
    seedling: '🌱 Seedling',
    growing: '🌿 Growing',
    mature: '🌾 Mature',
    harvested: '🍅 Harvesting',
    dead: '💀 Ended',
  };
  return map[status] || '🌱 Growing';
};

/**
 * Get growth stage progress (percentage)
 */
export const getGrowthProgress = (status) => {
  const map = {
    seedling: 25,
    growing: 50,
    mature: 75,
    harvested: 90,
    dead: 100,
  };
  return map[status] || 0;
};

/**
 * Get plant type emoji
 */
export const getPlantTypeEmoji = (type) => {
  const map = {
    vegetable: '🥬',
    fruit: '🍎',
    herb: '🌿',
    flower: '🌸',
    tree: '🌳',
    succulent: '🌵',
  };
  return map[type] || '🌱';
};