import React from 'react';
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
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed, toggleSidebar }) => {
  const { logout } = useAuth();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <FaChartLine />, end: true },
    { path: '/admin/users', label: 'User Management', icon: <FaUsers /> },
    { path: '/admin/gardens', label: 'Gardens & Plants', icon: <FaSeedling /> },
    { path: '/admin/moderation', label: 'Moderation Hub', icon: <FaShieldAlt /> },
    { path: '/admin/leads', label: 'Guest Leads', icon: <FaAddressBook /> },
    { path: '/admin/logs', label: 'Audit Trail', icon: <FaHistory /> },
    { path: '/admin/settings', label: 'System Settings', icon: <FaCog /> },
  ];

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
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
  );
};

export default AdminSidebar;
