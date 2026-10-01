import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    diagnoses: 0,
    plants: 0,
    gardens: 0,
    pendingModeration: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Get users
      const userRes = await api.get('/admin/users');
      const users = userRes.data.users || [];
      
      // Get posts
      const postRes = await api.get('/community');
      const posts = postRes.data.posts || [];
      
      // Get flagged posts
      const flaggedRes = await api.get('/admin/flagged-posts');
      const flaggedPosts = flaggedRes.data.posts || [];
      
      // Get diagnoses (you might need to add this endpoint)
      // For now, we'll use mock data
      const diagnoses = [];
      
      // Get plants and gardens (you might need to add these endpoints)
      // For now, we'll use mock data
      const plants = [];
      const gardens = [];

      setStats({
        users: users.length,
        posts: posts.length,
        diagnoses: diagnoses.length || 0,
        plants: plants.length || 0,
        gardens: gardens.length || 0,
        pendingModeration: flaggedPosts.length || 0,
      });

      // Get recent users (last 5)
      setRecentUsers(users.slice(0, 5));
      
      // Get recent posts (last 5)
      setRecentPosts(posts.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      key: 'users', 
      icon: '👥', 
      label: 'Total Users', 
      value: stats.users,
      color: '#b8a9c9'
    },
    { 
      key: 'posts', 
      icon: '📝', 
      label: 'Community Posts', 
      value: stats.posts,
      color: '#a8d5ba'
    },
    { 
      key: 'diagnoses', 
      icon: '🔬', 
      label: 'Diagnoses Run', 
      value: stats.diagnoses,
      color: '#d6eaf8'
    },
    { 
      key: 'plants', 
      icon: '🌱', 
      label: 'Plants Growing', 
      value: stats.plants,
      color: '#f0d5c0'
    },
    { 
      key: 'gardens', 
      icon: '🌿', 
      label: 'Active Gardens', 
      value: stats.gardens,
      color: '#d4c5b2'
    },
    { 
      key: 'pendingModeration', 
      icon: '⚠️', 
      label: 'Pending Moderation', 
      value: stats.pendingModeration,
      color: '#e8b4b4'
    },
  ];

  if (loading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>🛡️ Admin Dashboard</h2>
        <span className="admin-welcome">Welcome back, {user?.name}!</span>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {statCards.map((stat) => (
          <div key={stat.key} className="admin-stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
            <div className="stat-content">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="admin-recent-grid">
        {/* Recent Users */}
        <div className="admin-recent-card">
          <h4>👥 Recent Users</h4>
          {recentUsers.length === 0 ? (
            <p className="no-data">No users registered yet</p>
          ) : (
            <ul className="recent-list">
              {recentUsers.map((u) => (
                <li key={u._id}>
                  <span className="user-name">{u.name}</span>
                  <span className="user-email">{u.email}</span>
                  <span className={`user-role ${u.role}`}>{u.role}</span>
                </li>
              ))}
            </ul>
          )}
          {recentUsers.length > 0 && (
            <button 
              className="view-all-btn"
              onClick={() => window.location.href = '/admin/users'}
            >
              View All Users →
            </button>
          )}
        </div>

        {/* Recent Posts */}
        <div className="admin-recent-card">
          <h4>📝 Recent Posts</h4>
          {recentPosts.length === 0 ? (
            <p className="no-data">No posts yet</p>
          ) : (
            <ul className="recent-list">
              {recentPosts.map((p) => (
                <li key={p._id}>
                  <span className="post-title">{p.title}</span>
                  <span className="post-author">by {p.userId?.name || 'Anonymous'}</span>
                  <span className={`post-category ${p.category}`}>{p.category}</span>
                </li>
              ))}
            </ul>
          )}
          {recentPosts.length > 0 && (
            <button 
              className="view-all-btn"
              onClick={() => window.location.href = '/admin/moderation'}
            >
              View All Posts →
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-quick-actions">
        <h4>⚡ Quick Actions</h4>
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => window.location.href = '/admin/users'}>
            👥 Manage Users
          </button>
          <button className="quick-action-btn" onClick={() => window.location.href = '/admin/moderation'}>
            📝 Moderate Posts
          </button>
          <button className="quick-action-btn" onClick={() => window.location.href = '/admin/logs'}>
            📋 View Logs
          </button>
          <button className="quick-action-btn" onClick={() => window.location.href = '/app'}>
            🌱 Go to App
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;