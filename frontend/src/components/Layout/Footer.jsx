import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../Common/LanguageSelector';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-content-bar">
        <p className="footer-copyright">© {new Date().getFullYear()} {t('footer.tagline')}</p>
        <LanguageSelector className="footer-lang-selector" />
      </div>
    </footer>
  );
};

export default Footer;