import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Notification from '../Common/Notification';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Check if we're in admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // If admin route, render without sidebar
  if (isAdminRoute || user?.role === 'admin') {
    return (
      <div className="app-layout admin-layout">
        <Navbar />
        <div className="main-content admin-main-content">
          <div className="page-content admin-page-content">
            <Notification />
            {children}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Regular user layout with sidebar
  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">
        <Sidebar />
        <div className="page-content">
          <Notification />
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;