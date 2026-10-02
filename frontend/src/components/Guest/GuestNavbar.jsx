import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaLeaf, FaSun, FaMoon, FaBars, FaTimes, FaUser, FaUserPlus, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import './GuestNavbar.css';

const GuestNavbar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
          <span className="brand-name">Urban<span className="brand-highlight">Farm</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className={`guest-nav-links ${mobileMenuOpen ? 'open' : ''}`}>
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

          {/* Mobile Auth Controls */}
          <div className="guest-mobile-controls">
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : '/app'} className="guest-btn guest-btn-primary" onClick={closeMenu}>
                <FaTachometerAlt /> Dashboard
              </Link>
            ) : (
              <div className="mobile-auth-buttons">
                <Link to="/login" className="guest-btn guest-btn-outline" onClick={closeMenu}>Sign In</Link>
                <Link to="/register" className="guest-btn guest-btn-primary" onClick={closeMenu}>Register</Link>
              </div>
            )}
          </div>
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
        <button className="guest-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Navigation Menu">
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </header>
  );
};

export default GuestNavbar;
