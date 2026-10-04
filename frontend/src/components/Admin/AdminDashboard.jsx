import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

  const getRoleLabel = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return t('auth.admin', 'Admin');
    if (r === 'agronomist') return t('auth.agronomist', 'Agronomist');
    return t('auth.gardener', 'User');
  };

  const getCategoryLabel = (cat) => {
    if (!cat) return '';
    return t(`community.categories.${cat.toLowerCase()}`, cat);
  };

  if (loading || !stats) {
    return <div className="admin-loading-spinner">{t('admin.loadingDashboard', 'Loading admin dashboard...')}</div>;
  }

  const statCards = [
    {
      icon: <FaUsers />,
      label: t('admin.statCards.totalUsers', 'Total Users'),
      value: stats.totalUsers,
      sub: `${stats.activeUsers} ${t('admin.statCards.active', 'active')}`,
      color: '#6366f1',
    },
    {
      icon: <FaShieldAlt />,
      label: t('admin.statCards.admins', 'Admins'),
      value: stats.totalAdmins,
      sub: t('admin.statCards.platformAdmins', 'Platform admins'),
      color: '#8b5cf6',
    },
    {
      icon: <FaTree />,
      label: t('admin.statCards.totalGardens', 'Total Gardens'),
      value: stats.totalGardens,
      sub: t('admin.statCards.acrossUsers', 'Across all users'),
      color: '#10b981',
    },
    {
      icon: <FaSeedling />,
      label: t('admin.statCards.plantsGrowing', 'Plants Growing'),
      value: stats.totalPlants,
      sub: `${stats.plantHealth?.healthy || 0} ${t('admin.statCards.healthy', 'healthy')}`,
      color: '#14b8a6',
    },
    {
      icon: <FaComments />,
      label: t('admin.statCards.communityPosts', 'Community Posts'),
      value: stats.totalPosts,
      sub: t('admin.statCards.publishedPosts', 'Published posts'),
      color: '#3b82f6',
    },
    {
      icon: <FaFlag />,
      label: t('admin.statCards.flaggedPosts', 'Flagged Posts'),
      value: stats.flaggedPosts,
      sub: t('admin.statCards.needsReview', 'Needs review'),
      color: stats.flaggedPosts > 0 ? '#ef4444' : '#10b981',
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <h2>{t('admin.title', 'Admin Dashboard')}</h2>
          <p>
            {t('admin.welcomeOverview', {
              name: user?.name || t('admin.adminUser', 'Admin User'),
              defaultValue: 'Welcome back, {{name}}. Here is your platform overview.',
            })}
          </p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-outline" onClick={() => handleExportCSV('users')}>
            <FaFileCsv /> {t('admin.exportUsers', 'Export Users')}
          </button>
          <button className="admin-btn admin-btn-outline" onClick={() => handleExportCSV('plants')}>
            <FaFileCsv /> {t('admin.exportPlants', 'Export Plants')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {statCards.map((stat, idx) => (
          <div key={idx} className="admin-stat-card">
            <div className="stat-icon-box" style={{ color: stat.color }}>
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
          <h3><FaLeaf /> {t('admin.plantHealth.title', 'Plant Health Distribution')}</h3>
        </div>
        <div className="health-bar-container">
          <div className="health-bar">
            {stats.totalPlants > 0 ? (
              <>
                <div
                  className="health-segment healthy"
                  style={{ width: `${(stats.plantHealth.healthy / stats.totalPlants) * 100}%` }}
                  title={`${t('admin.plantHealth.healthy', 'Healthy')}: ${stats.plantHealth.healthy}`}
                />
                <div
                  className="health-segment warning"
                  style={{ width: `${(stats.plantHealth.warning / stats.totalPlants) * 100}%` }}
                  title={`${t('admin.plantHealth.warning', 'Warning')}: ${stats.plantHealth.warning}`}
                />
                <div
                  className="health-segment unhealthy"
                  style={{ width: `${(stats.plantHealth.unhealthy / stats.totalPlants) * 100}%` }}
                  title={`${t('admin.plantHealth.unhealthy', 'Unhealthy')}: ${stats.plantHealth.unhealthy}`}
                />
              </>
            ) : (
              <div className="health-segment empty" style={{ width: '100%' }} />
            )}
          </div>
          <div className="health-legend">
            <span className="legend-item">
              <FaCheckCircle style={{ color: '#10b981' }} /> {t('admin.plantHealth.healthy', 'Healthy')}: {stats.plantHealth?.healthy || 0}
            </span>
            <span className="legend-item">
              <FaExclamationTriangle style={{ color: '#f59e0b' }} /> {t('admin.plantHealth.warning', 'Warning')}: {stats.plantHealth?.warning || 0}
            </span>
            <span className="legend-item">
              <FaExclamationTriangle style={{ color: '#ef4444' }} /> {t('admin.plantHealth.unhealthy', 'Unhealthy')}: {stats.plantHealth?.unhealthy || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-recent-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h3><FaUsers /> {t('admin.recentUsers.title', 'Recent Users')}</h3>
            <button className="admin-btn-link" onClick={() => navigate('/admin/users')}>
              {t('admin.recentUsers.viewAll', t('common.viewAll', 'View All'))} <FaArrowRight />
            </button>
          </div>
          {recentUsers.length === 0 ? (
            <p className="admin-empty-msg">{t('admin.recentUsers.empty', 'No users registered yet.')}</p>
          ) : (
            <div className="recent-list">
              {recentUsers.map((u) => (
                <div key={u._id} className="recent-item">
                  <div className="recent-avatar">{u.name?.charAt(0).toUpperCase()}</div>
                  <div className="recent-info">
                    <strong>{u.name}</strong>
                    <small>{u.email}</small>
                  </div>
                  <span className={`role-badge ${u.role}`}>{getRoleLabel(u.role)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3><FaComments /> {t('admin.recentPosts.title', 'Recent Posts')}</h3>
            <button className="admin-btn-link" onClick={() => navigate('/admin/moderation')}>
              {t('admin.recentPosts.viewAll', t('common.viewAll', 'View All'))} <FaArrowRight />
            </button>
          </div>
          {recentPosts.length === 0 ? (
            <p className="admin-empty-msg">{t('admin.recentPosts.empty', 'No posts created yet.')}</p>
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
                    <small>
                      {t('admin.recentPosts.byAuthor', {
                        author: p.userId?.name || t('admin.anonymous', 'Anonymous'),
                        category: getCategoryLabel(p.category),
                        defaultValue: `by ${p.userId?.name || 'Anonymous'} · ${getCategoryLabel(p.category)}`,
                      })}
                    </small>
                  </div>
                  <span className={`category-badge ${p.category}`}>{getCategoryLabel(p.category)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3><FaChartLine /> {t('admin.quickActions.title', 'Quick Actions')}</h3>
        </div>
        <div className="quick-actions-grid">
          <button className="quick-action-card" onClick={() => navigate('/admin/users')}>
            <FaUserPlus />
            <span>{t('admin.quickActions.manageUsers', t('navigation.userManagement', 'Manage Users'))}</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/admin/gardens')}>
            <FaTree />
            <span>{t('admin.quickActions.gardensPlants', t('navigation.gardensPlants', 'Gardens & Plants'))}</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/admin/moderation')}>
            <FaShieldAlt />
            <span>{t('admin.quickActions.moderationHub', t('navigation.moderationHub', 'Moderation Hub'))}</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/admin/logs')}>
            <FaHistory />
            <span>{t('admin.quickActions.auditTrail', t('navigation.auditTrail', 'Audit Trail'))}</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/admin/settings')}>
            <FaFileCsv />
            <span>{t('admin.quickActions.settings', t('navigation.systemSettings', 'Export & Settings'))}</span>
          </button>
          <button className="quick-action-card exit" onClick={() => navigate('/app')}>
            <FaLeaf />
            <span>{t('admin.quickActions.switchFarmer', 'Switch to Farmer View')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;