import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import {
  FaUsers,
  FaSearch,
  FaFileCsv,
  FaTrash,
  FaEdit,
  FaUserPlus,
  FaFilter,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaCheck,
} from 'react-icons/fa';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { addNotification } = useNotification();

  // Create User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    gardeningLevel: 'beginner',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery || search) params.append('search', searchQuery || search);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (levelFilter !== 'all') params.append('level', levelFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      addNotification('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      addNotification('User created successfully!', 'success');
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'user', gardeningLevel: 'beginner' });
      loadUsers();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Failed to create user', 'error');
    }
  };

  const handleUpdateUser = async (userId, updateData) => {
    try {
      await api.put(`/admin/users/${userId}`, updateData);
      addNotification('User updated successfully!', 'success');
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      addNotification('Failed to update user', 'error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      addNotification('Role updated successfully!', 'success');
      loadUsers();
    } catch (error) {
      addNotification('Failed to update role', 'error');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !currentStatus });
      addNotification(`User ${!currentStatus ? 'activated' : 'suspended'} successfully`, 'success');
      loadUsers();
    } catch (error) {
      addNotification('Failed to update user status', 'error');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      addNotification('User deleted successfully', 'success');
      loadUsers();
    } catch (error) {
      addNotification('Failed to delete user', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/export/users', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'urbanfarm_users_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      addNotification('Users CSV exported successfully!', 'success');
    } catch (error) {
      addNotification('Failed to export CSV', 'error');
    }
  };

  return (
    <div className="user-mgmt-container">
      <div className="admin-page-header">
        <div>
          <h2>User Management Console</h2>
          <p>Create, search, filter, edit roles, suspend accounts, and export user records.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => setShowCreateModal(true)}>
            <FaUserPlus /> Create User
          </button>
          <button className="admin-btn admin-btn-outline" onClick={handleExportCSV}>
            <FaFileCsv /> Export CSV
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="admin-btn admin-btn-sm">Search</button>
        </form>
        <div className="admin-filters">
          <div className="filter-group">
            <FaFilter />
            <label>Role:</label>
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); }}>
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Level:</label>
            <select value={levelFilter} onChange={(e) => { setLevelFilter(e.target.value); }}>
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button className="admin-btn admin-btn-sm" onClick={loadUsers}>Apply</button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="admin-loading-spinner">Loading users...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Level</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">No users found matching criteria.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className={!u.isActive ? 'row-suspended' : ''}>
                    <td>
                      <div className="user-cell">
                        <span className="user-avatar-sm">{u.name?.charAt(0).toUpperCase()}</span>
                        <strong>{u.name}</strong>
                      </div>
                    </td>
                    <td><small>{u.email}</small></td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className={`role-select-inline ${u.role}`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`level-badge ${u.gardeningLevel}`}>
                        {u.gardeningLevel || 'beginner'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`status-toggle ${u.isActive ? 'active' : 'suspended'}`}
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                        title={u.isActive ? 'Click to suspend' : 'Click to activate'}
                      >
                        {u.isActive ? <><FaToggleOn /> Active</> : <><FaToggleOff /> Suspended</>}
                      </button>
                    </td>
                    <td><small>{new Date(u.createdAt).toLocaleDateString()}</small></td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="admin-action-icon delete"
                          title="Delete User"
                          onClick={() => handleDelete(u._id, u.name)}
                          disabled={u.role === 'admin' && users.filter((us) => us.role === 'admin').length === 1}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaUserPlus /> Create New User</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="admin-modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Gardening Level</label>
                  <select
                    value={newUser.gardeningLevel}
                    onChange={(e) => setNewUser({ ...newUser, gardeningLevel: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <FaCheck /> Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;