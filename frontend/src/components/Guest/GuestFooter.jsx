import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaLeaf,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaHeart,
} from 'react-icons/fa';
import './GuestFooter.css';

import LanguageSelector from '../Common/LanguageSelector';

const GuestFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="guest-footer">
      <div className="guest-footer-container">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <div className="brand-logo-icon">
              <FaLeaf />
            </div>
            <span className="brand-name">Urban<span className="brand-highlight">Farm</span></span>
          </div>
          <p className="footer-desc">
            {t('landing.heroSubtitle')}
          </p>
          <div className="footer-socials">
            <Link to="/" aria-label="GitHub"><FaGithub /></Link>
            <Link to="/" aria-label="Twitter"><FaTwitter /></Link>
            <Link to="/" aria-label="LinkedIn"><FaLinkedin /></Link>
            <Link to="/" aria-label="Instagram"><FaInstagram /></Link>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-col">
          <h4>{t('navigation.home')}</h4>
          <ul className="footer-links">
            <li><Link to="/">{t('navigation.home')}</Link></li>
            <li><Link to="/about">{t('navigation.about')}</Link></li>
            <li><Link to="/features">{t('navigation.features')}</Link></li>
            <li><Link to="/live-preview">{t('navigation.demo')}</Link></li>
            <li><Link to="/rewards">{t('navigation.rewards')}</Link></li>
            <li><Link to="/market-prices">{t('navigation.marketPrices')}</Link></li>
            <li><Link to="/faq">{t('navigation.faq')}</Link></li>
            <li><Link to="/contact">{t('navigation.contact')}</Link></li>
          </ul>
        </div>

        {/* Account & Platform Links Column */}
        <div className="footer-col">
          <h4>{t('navigation.openDashboard')}</h4>
          <ul className="footer-links">
            <li><Link to="/login">{t('navigation.signIn')}</Link></li>
            <li><Link to="/register">{t('navigation.register')}</Link></li>
            <li><Link to="/features">{t('landing.plantDiseaseTitle')}</Link></li>
            <li><Link to="/features">{t('landing.smartIrrigationTitle')}</Link></li>
            <li><Link to="/features">{t('landing.communityTitle')}</Link></li>
          </ul>
        </div>

        {/* Contact Info Column */}
        <div className="footer-col contact-col">
          <h4>{t('contact.title')}</h4>
          <ul className="footer-contact-list">
            <li>
              <FaEnvelope className="icon" />
              <span>{t('contact.emailVal')}</span>
            </li>
            <li>
              <FaPhone className="icon" />
              <span>{t('contact.phoneVal')}</span>
            </li>
            <li>
              <FaMapMarkerAlt className="icon" />
              <span>{t('contact.addressVal')}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="footer-copyright">
            © {new Date().getFullYear()} UrbanFarm. {t('footer.rightsReserved')} {t('footer.craftedPrefix')} <FaHeart style={{ color: '#e74c3c' }} /> {t('footer.craftedSuffix')}
          </p>
          <LanguageSelector className="footer-lang-selector" />
        </div>
      </div>
    </footer>
  );
};

export default GuestFooter;
