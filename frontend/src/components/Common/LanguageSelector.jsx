import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const LANGUAGES = [
  { code: 'en', nativeName: 'English' },
  { code: 'gu', nativeName: 'ગુજરાતી' },
  { code: 'hi', nativeName: 'हिन्दी' },
];

const LanguageSelector = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const currentLangCode = i18n.language || localStorage.getItem('language') || 'en';

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    document.documentElement.lang = code;
  };

  return (
    <div className={`footer-language-selector ${className}`}>
      <div className="lang-options-inline">
        {LANGUAGES.map((lang, idx) => (
          <React.Fragment key={lang.code}>
            <button
              type="button"
              className={`inline-lang-btn ${lang.code === currentLangCode ? 'active' : ''}`}
              onClick={() => changeLanguage(lang.code)}
            >
              {lang.nativeName}
            </button>
            {idx < LANGUAGES.length - 1 && <span className="lang-divider">|</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
