import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaLeaf, FaBars, FaTimes, FaUser, FaUserPlus, FaTachometerAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import LanguageSelector from '../Common/LanguageSelector';
import './GuestNavbar.css';

const GuestNavbar = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="guest-header">
      <div className="guest-navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="guest-brand" onClick={closeMenu}>
          <div className="brand-logo-icon">
            <FaLeaf />
          </div>
          <span className="brand-name">
            Urban<span className="brand-highlight">Farm</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="guest-nav-links-desktop">
          <NavLink to="/" end className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`}>
            {t('navigation.home')}
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`}>
            {t('navigation.about')}
          </NavLink>
          <NavLink to="/features" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`}>
            {t('navigation.features')}
          </NavLink>
          <NavLink to="/live-preview" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`}>
            {t('navigation.demo')}
          </NavLink>
          <NavLink to="/rewards" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`}>
            {t('navigation.rewards')}
          </NavLink>
          <NavLink to="/market-prices" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`}>
            {t('navigation.marketPrices')}
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`}>
            {t('navigation.contact')}
          </NavLink>
          <NavLink to="/faq" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`}>
            {t('navigation.faq')}
          </NavLink>
        </nav>

        {/* Right Desktop Actions */}
        <div className="guest-actions-desktop">
          {user ? (
            <button
              onClick={() => navigate(user.role === 'admin' ? '/admin' : '/app')}
              className="guest-btn guest-btn-primary"
            >
              <FaTachometerAlt /> {t('navigation.openDashboard')}
            </button>
          ) : (
            <div className="guest-auth-group">
              <Link to="/login" className="guest-btn guest-btn-outline">
                <FaUser /> {t('navigation.signIn')}
              </Link>
              <Link to="/register" className="guest-btn guest-btn-primary">
                <FaUserPlus /> {t('navigation.register')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="guest-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Drawer via Portal */}
      {createPortal(
        <>
          {mobileMenuOpen && (
            <div className="guest-mobile-backdrop" onClick={closeMenu} />
          )}

          <div className={`guest-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="guest-drawer-header">
              <Link to="/" className="guest-brand" onClick={closeMenu}>
                <div className="brand-logo-icon">
                  <FaLeaf />
                </div>
                <span className="brand-name">
                  Urban<span className="brand-highlight">Farm</span>
                </span>
              </Link>
              <button className="guest-drawer-close" onClick={closeMenu} aria-label="Close menu">
                <FaTimes />
              </button>
            </div>

            <div className="guest-drawer-links">
              <NavLink to="/" end className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                {t('navigation.home')}
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                {t('navigation.about')}
              </NavLink>
              <NavLink to="/features" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                {t('navigation.features')}
              </NavLink>
              <NavLink to="/live-preview" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                {t('navigation.demo')}
              </NavLink>
              <NavLink to="/rewards" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                {t('navigation.rewards')}
              </NavLink>
              <NavLink to="/market-prices" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                {t('navigation.marketPrices')}
              </NavLink>
              <NavLink to="/contact" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                {t('navigation.contact')}
              </NavLink>
              <NavLink to="/faq" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                {t('navigation.faq')}
              </NavLink>
            </div>

            <div className="guest-drawer-footer">
              <div className="mobile-lang-wrapper" style={{ marginBottom: "1rem" }}>
                <LanguageSelector />
              </div>
              {user ? (
                <Link to={user.role === 'admin' ? '/admin' : '/app'} className="guest-btn guest-btn-primary guest-btn-block" onClick={closeMenu}>
                  <FaTachometerAlt /> {t('navigation.dashboard')}
                </Link>
              ) : (
                <div className="mobile-auth-buttons">
                  <Link to="/login" className="guest-btn guest-btn-outline" onClick={closeMenu}>{t('navigation.signIn')}</Link>
                  <Link to="/register" className="guest-btn guest-btn-primary" onClick={closeMenu}>{t('navigation.register')}</Link>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
};

export default GuestNavbar;

