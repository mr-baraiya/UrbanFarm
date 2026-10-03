import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaChartLine,
  FaUsers,
  FaSeedling,
  FaShieldAlt,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaLeaf,
  FaAddressBook,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import LanguageSelector from '../Common/LanguageSelector';
import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed, toggleSidebar }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: '/admin', label: t('navigation.dashboard'), icon: <FaChartLine />, end: true },
    { path: '/admin/users', label: t('navigation.userManagement'), icon: <FaUsers /> },
    { path: '/admin/gardens', label: t('navigation.gardensPlants'), icon: <FaSeedling /> },
    { path: '/admin/moderation', label: t('navigation.moderationHub'), icon: <FaShieldAlt /> },
    { path: '/admin/leads', label: t('navigation.guestLeads'), icon: <FaAddressBook /> },
    { path: '/admin/logs', label: t('navigation.auditTrail'), icon: <FaHistory /> },
    { path: '/admin/settings', label: t('navigation.systemSettings'), icon: <FaCog /> },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="admin-mobile-toggle"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Toggle Admin Menu"
      >
        {mobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Desktop Sidebar */}
      <aside className={`admin-sidebar desktop-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-brand">
            <div className="admin-brand-icon">
              <FaLeaf />
            </div>
            {!isCollapsed && <span className="admin-brand-text">UrbanFarm Admin</span>}
          </Link>
          <button
            className="admin-sidebar-toggle"
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? '➔' : '◀'}
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-label">
            {!isCollapsed && <span>{t('navigation.management')}</span>}
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {!isCollapsed && <LanguageSelector />}
          <button onClick={logout} className="admin-exit-btn" title={t('navigation.logout')}>
            <FaSignOutAlt />
            {!isCollapsed && <span>{t('navigation.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer via Portal */}
      {createPortal(
        <>
          {mobileOpen && (
            <div className="admin-mobile-backdrop" onClick={closeMobile} />
          )}
          <div className={`admin-mobile-drawer ${mobileOpen ? 'open' : ''}`}>
            <div className="admin-drawer-header">
              <Link to="/admin" className="admin-brand" onClick={closeMobile}>
                <div className="admin-brand-icon">
                  <FaLeaf />
                </div>
                <span className="admin-brand-text">UrbanFarm Admin</span>
              </Link>
              <button className="admin-drawer-close" onClick={closeMobile} aria-label="Close menu">
                <FaTimes />
              </button>
            </div>

            <nav className="admin-drawer-nav">
              <div className="admin-nav-section-label">
                <span>{t('navigation.management')}</span>
              </div>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `admin-nav-link ${isActive ? 'active' : ''}`
                  }
                  onClick={closeMobile}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="admin-drawer-footer">
              <LanguageSelector />
              <button
                onClick={() => {
                  logout();
                  closeMobile();
                }}
                className="admin-exit-btn"
              >
                <FaSignOutAlt />
                <span>{t('navigation.logout')}</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default AdminSidebar;

