import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaLeaf, FaGlobe, FaInfoCircle } from 'react-icons/fa';
import './FirstVisitLanguageModal.css';

const LANGUAGES = [
  { code: 'en', nativeName: 'English', subtitle: 'Continue in English' },
  { code: 'gu', nativeName: 'ગુજરાતી', subtitle: 'ગુજરાતીમાં આગળ વધો' },
  { code: 'hi', nativeName: 'हिन्दी', subtitle: 'हिन्दी में जारी रखें' },
];

const FirstVisitLanguageModal = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasChosen = localStorage.getItem('has_chosen_language');
    if (!hasChosen) {
      setIsOpen(true);
    }
  }, []);

  const handleSelectLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    localStorage.setItem('has_chosen_language', 'true');
    document.documentElement.lang = code;
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="lang-modal-overlay">
      <div className="lang-modal-card">
        <div className="lang-modal-header">
          <div className="lang-modal-icon">
            <FaLeaf />
          </div>
          <h2>Welcome to UrbanFarm</h2>
          <p className="lang-modal-subtitle">
            Select your preferred language / ભાષા પસંદ કરો / भाषा चुनें
          </p>
        </div>

        <div className="lang-modal-options">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className="lang-modal-option-btn"
              onClick={() => handleSelectLanguage(lang.code)}
            >
              <div className="lang-option-info">
                <span className="lang-native">{lang.nativeName}</span>
                <span className="lang-sub">{lang.subtitle}</span>
              </div>
              <FaGlobe className="lang-option-arrow" />
            </button>
          ))}
        </div>

        <div className="lang-modal-footer-note">
          <div className="lang-note-header">
            <FaInfoCircle className="lang-note-icon" />
            <span>Note / નોંધ / नोट</span>
          </div>
          <div className="lang-note-messages">
            <p className="lang-note-text">
              <span className="lang-note-bullet">•</span> You can change the language anytime at the very bottom of the website.
            </p>
            <p className="lang-note-text">
              <span className="lang-note-bullet">•</span> તમે કોઈપણ સમયે વેબસાઇટની સૌથી નીચેથી (છેલ્લેથી) ભાષા બદલી શકો છો.
            </p>
            <p className="lang-note-text">
              <span className="lang-note-bullet">•</span> आप किसी भी समय वेबसाइट के सबसे नीचे जाकर भाषा बदल सकते हैं।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstVisitLanguageModal;
