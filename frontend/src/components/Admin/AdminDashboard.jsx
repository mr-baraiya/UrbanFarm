import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
  FaUsers,
  FaSeedling,
  FaTree,
  FaComments,
  FaFlag,
  FaShieldAlt,
  FaHistory,
  FaChartLine,
  FaFileCsv,
  FaUserPlus,
  FaLeaf,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowRight,
} from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, postsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/posts'),
      ]);

      setStats(statsRes.data.stats);
      setRecentUsers((usersRes.data.users || []).slice(0, 5));
      setRecentPosts((postsRes.data.posts || []).slice(0, 5));
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async (type) => {
    try {
      const response = await api.get(`/admin/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `urbanfarm_${type}_export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('CSV export failed:', error);
    }
  };

  if (loading || !stats) {
    return <div className="admin-loading-spinner">Loading admin dashboard...</div>;
  }

  const statCards = [
    {
      icon: <FaUsers />,
      label: 'Total Users',
      value: stats.totalUsers,
      sub: `${stats.activeUsers} active`,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.12)',
    },
    {
      icon: <FaShieldAlt />,
      label: 'Admins',
      value: stats.totalAdmins,
      sub: 'Platform admins',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.12)',
    },
    {
      icon: <FaTree />,
      label: 'Total Gardens',
      value: stats.totalGardens,
      sub: 'Across all users',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
    },
    {
      icon: <FaSeedling />,
      label: 'Plants Growing',
      value: stats.totalPlants,
      sub: `${stats.plantHealth?.healthy || 0} healthy`,
      color: '#14b8a6',
      bg: 'rgba(20, 184, 166, 0.12)',
    },
    {
      icon: <FaComments />,
      label: 'Community Posts',
      value: stats.totalPosts,
      sub: 'Published posts',
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.12)',
    },
    {
      icon: <FaFlag />,
      label: 'Flagged Posts',
      value: stats.flaggedPosts,
      sub: 'Needs review',
      color: stats.flaggedPosts > 0 ? '#ef4444' : '#10b981',
      bg: stats.flaggedPosts > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>
            Welcome back, <strong>{user?.name}</strong>. Here is your platform overview.
          </p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-outline" onClick={() => handleExportCSV('users')}>
            <FaFileCsv /> Export Users
          </button>
          <button className="admin-btn admin-btn-outline" onClick={() => handleExportCSV('plants')}>
            <FaFileCsv /> Export Plants
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {statCards.map((stat, idx) => (
          <div key={idx} className="admin-stat-card">
            <div className="stat-icon-box" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
              <span className="stat-sub">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Plant Health Distribution */}
      <div className="admin-card plant-health-card">
        <div className="admin-card-header">
          <h3><FaLeaf /> Plant Health Distribution</h3>
        </div>
        <div className="health-bar-container">
          <div className="health-bar">
            {stats.totalPlants > 0 ? (
              <>
                <div
                  className="health-segment healthy"
                  style={{ width: `${(stats.plantHealth.healthy / stats.totalPlants) * 100}%` }}
                  title={`Healthy: ${stats.plantHealth.healthy}`}
                />
                <div
                  className="health-segment warning"
                  style={{ width: `${(stats.plantHealth.warning / stats.totalPlants) * 100}%` }}
                  title={`Warning: ${stats.plantHealth.warning}`}
                />
                <div
                  className="health-segment unhealthy"
                  style={{ width: `${(stats.plantHealth.unhealthy / stats.totalPlants) * 100}%` }}
                  title={`Unhealthy: ${stats.plantHealth.unhealthy}`}
                />
              </>
            ) : (
              <div className="health-segment empty" style={{ width: '100%' }} />
            )}
          </div>
          <div className="health-legend">
            <span className="legend-item">
              <FaCheckCircle style={{ color: '#10b981' }} /> Healthy: {stats.plantHealth?.healthy || 0}
            </span>
            <span className="legend-item">
              <FaExclamationTriangle style={{ color: '#f59e0b' }} /> Warning: {stats.plantHealth?.warning || 0}
            </span>
            <span className="legend-item">
              <FaExclamationTriangle style={{ color: '#ef4444' }} /> Unhealthy: {stats.plantHealth?.unhealthy || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-recent-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h3><FaUsers /> Recent Users</h3>
            <button className="admin-btn-link" onClick={() => navigate('/admin/users')}>
              View All <FaArrowRight />
            </button>
          </div>
          {recentUsers.length === 0 ? (
            <p className="admin-empty-msg">No users registered yet.</p>
          ) : (
            <div className="recent-list">
              {recentUsers.map((u) => (
                <div key={u._id} className="recent-item">
                  <div className="recent-avatar">{u.name?.charAt(0).toUpperCase()}</div>
                  <div className="recent-info">
                    <strong>{u.name}</strong>
                    <small>{u.email}</small>
                  </div>
                  <span className={`role-badge ${u.role}`}>{u.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3><FaComments /> Recent Posts</h3>
            <button className="admin-btn-link" onClick={() => navigate('/admin/moderation')}>
              View All <FaArrowRight />
            </button>
          </div>
          {recentPosts.length === 0 ? (
            <p className="admin-empty-msg">No posts created yet.</p>
          ) : (
            <div className="recent-list">
              {recentPosts.map((p) => (
                <div key={p._id} className="recent-item">
                  <div className="recent-post-indicator">
                    {p.isFlagged ? (
                      <FaFlag style={{ color: '#ef4444' }} />
                    ) : p.isApproved ? (
                      <FaCheckCircle style={{ color: '#10b981' }} />
                    ) : (
                      <FaHistory style={{ color: '#f59e0b' }} />
                    )}
                  </div>
                  <div className="recent-info">
                    <strong>{p.title}</strong>
                    <small>by {p.userId?.name || 'Anonymous'} · {p.category}</small>
                  </div>
                  <span className={`category-badge ${p.category}`}>{p.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3><FaChartLine /> Quick Actions</h3>
        </div>
        <div className="quick-actions-grid">
          <button className="quick-action-card" onClick={() => navigate('/admin/users')}>
            <FaUserPlus />
            <span>Manage Users</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/admin/gardens')}>
            <FaTree />
            <span>Gardens & Plants</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/admin/moderation')}>
            <FaShieldAlt />
            <span>Moderation Hub</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/admin/logs')}>
            <FaHistory />
            <span>Audit Trail</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/admin/settings')}>
            <FaFileCsv />
            <span>Export & Settings</span>
          </button>
          <button className="quick-action-card exit" onClick={() => navigate('/app')}>
            <FaLeaf />
            <span>Switch to Farmer View</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;