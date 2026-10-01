import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Urban Farming Assistant — Grow your city garden</p>
    </footer>
  );
};

export default Footer;