import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationGU from './locales/gu/translation.json';
import translationHI from './locales/hi/translation.json';

const SUPPORTED_LANGUAGES = ['en', 'gu', 'hi'];
const savedLang = localStorage.getItem('language');
const initialLang = SUPPORTED_LANGUAGES.includes(savedLang) ? savedLang : 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      gu: { translation: translationGU },
      hi: { translation: translationHI },
    },
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React escapes HTML by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },
  });

// Set HTML document language attribute initially
document.documentElement.lang = initialLang;

// Keep HTML lang attribute updated on language change
i18n.on('languageChanged', (lng) => {
  const valid = SUPPORTED_LANGUAGES.includes(lng) ? lng : 'en';
  document.documentElement.lang = valid;
  localStorage.setItem('language', valid);
});

export default i18n;
