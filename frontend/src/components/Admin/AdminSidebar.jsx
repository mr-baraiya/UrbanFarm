import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link } from 'react-router-dom';
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
import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed, toggleSidebar }) => {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <FaChartLine />, end: true },
    { path: '/admin/users', label: 'User Management', icon: <FaUsers /> },
    { path: '/admin/gardens', label: 'Gardens & Plants', icon: <FaSeedling /> },
    { path: '/admin/moderation', label: 'Moderation Hub', icon: <FaShieldAlt /> },
    { path: '/admin/leads', label: 'Guest Leads', icon: <FaAddressBook /> },
    { path: '/admin/logs', label: 'Audit Trail', icon: <FaHistory /> },
    { path: '/admin/settings', label: 'System Settings', icon: <FaCog /> },
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
            {!isCollapsed && <span>Management</span>}
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
          <button onClick={logout} className="admin-exit-btn" title="Logout">
            <FaSignOutAlt />
            {!isCollapsed && <span>Logout</span>}
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
                <span>Management</span>
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
              <button
                onClick={() => {
                  logout();
                  closeMobile();
                }}
                className="admin-exit-btn"
              >
                <FaSignOutAlt />
                <span>Logout</span>
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

