import React from 'react';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-content-bar">
        <p>© {new Date().getFullYear()} {t('footer.tagline')}</p>
      </div>
    </footer>
  );
};

export default Footer;