/**
 * Format date to readable string
 */
export const formatDate = (dateStr, lang = null) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const currentLang = (lang || localStorage.getItem('language') || 'en').split('-')[0];
  const localeMap = {
    gu: 'gu-IN',
    hi: 'hi-IN',
    en: 'en-US'
  };
  const locale = localeMap[currentLang] || 'en-US';
  try {
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
};

/**
 * Format time
 */
export const formatTime = (dateStr, lang = null) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const currentLang = (lang || localStorage.getItem('language') || 'en').split('-')[0];
  const localeMap = {
    gu: 'gu-IN',
    hi: 'hi-IN',
    en: 'en-US'
  };
  const locale = localeMap[currentLang] || 'en-US';
  try {
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
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
    seedling: '#52b788',
    growing: '#2d6a4f',
    mature: '#d97706',
    harvested: '#ea580c',
    dead: '#6b7280',
  };
  return map[status] || '#52b788';
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority) => {
  const map = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
  };
  return map[priority] || '#6b7280';
};

/**
 * Get confidence level label
 */
export const getConfidenceEmoji = (conf) => {
  if (conf >= 0.8) return 'High';
  if (conf >= 0.5) return 'Moderate';
  return 'Low';
};

/**
 * Get health indicator class
 */
export const getHealthIndicator = (health) => {
  const map = {
    healthy: 'healthy',
    warning: 'warning',
    unhealthy: 'unhealthy',
  };
  return map[health] || 'healthy';
};

/**
 * Get health status label and color
 */
export const getHealthStatus = (health) => {
  const map = {
    healthy: { label: 'Healthy', color: '#10b981' },
    warning: { label: 'Needs Attention', color: '#f59e0b' },
    unhealthy: { label: 'At Risk', color: '#ef4444' },
  };
  return map[health] || { label: 'Unknown', color: '#6b7280' };
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
 * Get growth stage clean label
 */
export const getGrowthStageLabel = (status) => {
  const map = {
    seedling: 'Seedling',
    growing: 'Growing',
    mature: 'Mature',
    harvested: 'Harvesting',
    dead: 'Ended',
  };
  return map[status] || 'Growing';
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
 * Get plant type label
 */
export const getPlantTypeEmoji = (type) => {
  const map = {
    vegetable: 'Vegetable',
    fruit: 'Fruit',
    herb: 'Herb',
    flower: 'Flower',
    tree: 'Tree',
    succulent: 'Succulent',
  };
  return map[type] || 'Plant';
};

/**
 * Get realistic plant photography image or fallback
 */
export const getPlantImage = (plant) => {
  if (plant?.imageUrl && typeof plant.imageUrl === 'string' && plant.imageUrl.trim().length > 0) {
    return plant.imageUrl;
  }
  if (plant?.image && typeof plant.image === 'string' && plant.image.trim().length > 0) {
    return plant.image;
  }
  if (plant?.photo && typeof plant.photo === 'string' && plant.photo.trim().length > 0) {
    return plant.photo;
  }
  
  const name = (plant?.name || '').toLowerCase();
  const variety = (plant?.variety || '').toLowerCase();
  const search = `${name} ${variety}`;

  if (search.includes('pepper') || search.includes('capsicum') || search.includes('chilli') || search.includes('chili') || search.includes('મરચા') || search.includes('मिर्च')) {
    return 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80';
  }
  if (search.includes('mint') || search.includes('spearmint') || search.includes('pudina') || search.includes('ફુદીનો') || search.includes('पुदीना')) {
    return 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=600&auto=format&fit=crop&q=80';
  }
  if (search.includes('tomato') || search.includes('ટામેટા') || search.includes('ટમેટા') || search.includes('टमाटर') || search.includes('roma') || search.includes('cherry')) {
    return '/demo/priya_tomato_plant.jpg';
  }
  if (search.includes('basil') || search.includes('tulsi')) {
    return 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop&q=80';
  }
  if (search.includes('lettuce') || search.includes('salad') || search.includes('greens')) {
    return 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&auto=format&fit=crop&q=80';
  }
  if (search.includes('spinach') || search.includes('palak')) {
    return 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80';
  }
  if (search.includes('strawberr') || search.includes('berry')) {
    return 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80';
  }
  if (search.includes('rosemary')) {
    return 'https://images.unsplash.com/photo-1515586000433-a5bc720b3622?w=600&auto=format&fit=crop&q=80';
  }
  if (search.includes('cucumber')) {
    return 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=80';
  }
  if (search.includes('coriander') || search.includes('cilantro') || search.includes('parsley')) {
    return 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=600&auto=format&fit=crop&q=80';
  }

  return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80';
};