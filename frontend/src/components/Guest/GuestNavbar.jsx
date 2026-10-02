import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaLeaf, FaBars, FaTimes, FaUser, FaUserPlus, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import './GuestNavbar.css';

const GuestNavbar = () => {
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
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`}>
            About
          </NavLink>
          <NavLink to="/features" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`}>
            Features
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`}>
            Contact
          </NavLink>
          <NavLink to="/faq" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`}>
            FAQ
          </NavLink>
        </nav>

        {/* Right Desktop Actions */}
        <div className="guest-actions-desktop">
          {user ? (
            <button
              onClick={() => navigate(user.role === 'admin' ? '/admin' : '/app')}
              className="guest-btn guest-btn-primary"
            >
              <FaTachometerAlt /> Open Dashboard
            </button>
          ) : (
            <div className="guest-auth-group">
              <Link to="/login" className="guest-btn guest-btn-outline">
                <FaUser /> Sign In
              </Link>
              <Link to="/register" className="guest-btn guest-btn-primary">
                <FaUserPlus /> Register
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
                Home
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                About
              </NavLink>
              <NavLink to="/features" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                Features
              </NavLink>
              <NavLink to="/contact" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                Contact
              </NavLink>
              <NavLink to="/faq" className={({ isActive }) => `guest-nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                FAQ
              </NavLink>
            </div>

            <div className="guest-drawer-footer">
              {user ? (
                <Link to={user.role === 'admin' ? '/admin' : '/app'} className="guest-btn guest-btn-primary guest-btn-block" onClick={closeMenu}>
                  <FaTachometerAlt /> Dashboard
                </Link>
              ) : (
                <div className="mobile-auth-buttons">
                  <Link to="/login" className="guest-btn guest-btn-outline" onClick={closeMenu}>Sign In</Link>
                  <Link to="/register" className="guest-btn guest-btn-primary" onClick={closeMenu}>Register</Link>
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

