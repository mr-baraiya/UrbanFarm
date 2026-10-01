import React from 'react';
import { Link } from 'react-router-dom';
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

const GuestFooter = () => {
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
            Empowering city dwellers to transform rooftops, balconies, and backyard plots into high-yield, AI-assisted organic micro-farms.
          </p>
          <div className="footer-socials">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-col">
          <h4>Quick Navigation</h4>
          <ul className="footer-links">
            <li><Link to="/">Home Overview</Link></li>
            <li><Link to="/about">About Project</Link></li>
            <li><Link to="/features">Platform Features</Link></li>
            <li><Link to="/faq">Frequently Asked Questions</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
          </ul>
        </div>

        {/* Account & Platform Links Column */}
        <div className="footer-col">
          <h4>Platform Access</h4>
          <ul className="footer-links">
            <li><Link to="/login">Sign In to Dashboard</Link></li>
            <li><Link to="/register">Create New Account</Link></li>
            <li><Link to="/features#disease-diagnosis">AI Disease Diagnostic</Link></li>
            <li><Link to="/features#smart-irrigation">Smart Weather Irrigation</Link></li>
            <li><Link to="/features#community">Community Knowledge</Link></li>
          </ul>
        </div>

        {/* Contact Info Column */}
        <div className="footer-col contact-col">
          <h4>Contact Us</h4>
          <ul className="footer-contact-list">
            <li>
              <FaEnvelope className="icon" />
              <span>support@urbanfarm.io</span>
            </li>
            <li>
              <FaPhone className="icon" />
              <span>+1 (800) 555-FARM (3276)</span>
            </li>
            <li>
              <FaMapMarkerAlt className="icon" />
              <span>100 AgriTech Plaza, Suite 400, Green City</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© {new Date().getFullYear()} UrbanFarm Inc. All rights reserved. Crafted with <FaHeart style={{ color: '#e74c3c' }} /> for urban growers.</p>
          <div className="footer-legal-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GuestFooter;
