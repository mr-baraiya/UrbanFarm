import i18n from '../i18n';

const LOCALE_MAP = {
  en: 'en-US',
  gu: 'gu-IN',
  hi: 'hi-IN',
};

export const getLocaleTag = (lang = i18n.language) => {
  return LOCALE_MAP[lang] || 'en-US';
};

export const formatNumber = (num, lang = i18n.language, options = {}) => {
  if (num === null || num === undefined || isNaN(num)) return '';
  try {
    const locale = getLocaleTag(lang);
    return new Intl.NumberFormat(locale, options).format(num);
  } catch (err) {
    return String(num);
  }
};

export const formatDate = (dateValue, lang = i18n.language, options = {}) => {
  if (!dateValue) return '';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return String(dateValue);
    const locale = getLocaleTag(lang);
    const defaultOptions = { year: 'numeric', month: 'short', day: 'numeric', ...options };
    return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
  } catch (err) {
    return String(dateValue);
  }
};

export const getLocalizedValue = (obj, field, lang = i18n.language, defaultVal = '') => {
  if (!obj) return defaultVal;
  if (lang !== 'en' && obj[`${field}_${lang}`]) {
    return obj[`${field}_${lang}`];
  }
  return obj[field] || defaultVal;
};
