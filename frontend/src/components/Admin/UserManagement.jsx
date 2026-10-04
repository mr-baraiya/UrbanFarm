import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import ConfirmModal from '../Common/ConfirmModal';
import { validateUserForm, validateRegisterForm } from '../../utils/validators';
import AdminPagination from './AdminPagination';
import {
  FaUsers,
  FaSearch,
  FaFileCsv,
  FaTrash,
  FaEdit,
  FaEye,
  FaUserPlus,
  FaFilter,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaCheck,
  FaUserTag,
  FaEnvelope,
  FaCalendarAlt,
  FaIdBadge,
} from 'react-icons/fa';
import './UserManagement.css';

const UserManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const { addNotification } = useNotification();

  // Create User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    role: 'user',
    gardeningLevel: 'beginner',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter, levelFilter]);

  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedUsers = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return users.slice(startIdx, startIdx + pageSize);
  }, [users, currentPage, pageSize]);

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
      addNotification(t('admin.users.loadFailed', 'Failed to load users'), 'error');
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
    const { isValid, firstError } = validateRegisterForm(newUser);
    if (!isValid) {
      addNotification(firstError, 'error');
      return;
    }
    try {
      await api.post('/admin/users', newUser);
      addNotification(t('admin.users.createSuccess', 'User created successfully!'), 'success');
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', city: '', role: 'user', gardeningLevel: 'beginner' });
      loadUsers();
    } catch (error) {
      addNotification(error.response?.data?.message || t('admin.users.createFailed', 'Failed to create user'), 'error');
    }
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    const { isValid, firstError } = validateUserForm(editingUser);
    if (!isValid) {
      addNotification(firstError, 'error');
      return;
    }
    try {
      await api.put(`/admin/users/${editingUser._id}`, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        isActive: editingUser.isActive,
        gardeningLevel: editingUser.gardeningLevel,
      });
      addNotification(t('admin.users.updateSuccess', 'User details updated successfully!'), 'success');
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      addNotification(error.response?.data?.message || t('admin.users.updateFailed', 'Failed to update user'), 'error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      addNotification(t('admin.users.roleUpdateSuccess', 'Role updated successfully!'), 'success');
      loadUsers();
    } catch (error) {
      addNotification(t('admin.users.roleUpdateFailed', 'Failed to update role'), 'error');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !currentStatus });
      addNotification(
        t('admin.users.statusUpdateSuccess', {
          status: !currentStatus ? t('common.active', 'activated') : t('admin.suspended', 'suspended'),
          defaultValue: `User ${!currentStatus ? 'activated' : 'suspended'} successfully`,
        }),
        'success'
      );
      loadUsers();
    } catch (error) {
      addNotification(t('admin.users.statusUpdateFailed', 'Failed to update user status'), 'error');
    }
  };

  // Confirm modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const promptDeleteUser = (userId, userName) => {
    setConfirmConfig({
      isOpen: true,
      title: t('admin.users.deleteTitle', 'Delete User Account'),
      message: t('admin.users.deleteMsg', {
        name: userName,
        defaultValue: `Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`,
      }),
      onConfirm: async () => {
        try {
          await api.delete(`/admin/users/${userId}`);
          addNotification(t('admin.users.deleteSuccess', 'User deleted successfully'), 'success');
          loadUsers();
        } catch (error) {
          addNotification(t('admin.users.deleteFailed', 'Failed to delete user'), 'error');
        }
      },
    });
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
      addNotification(t('admin.users.exportSuccess', 'Users CSV exported successfully!'), 'success');
    } catch (error) {
      addNotification(t('admin.users.exportFailed', 'Failed to export CSV'), 'error');
    }
  };

  return (
    <div className="user-mgmt-container">
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
      <div className="admin-page-header">
        <div>
          <h2>{t('navigation.userManagement', 'User Management Console')}</h2>
          <p>{t('admin.userManagementSubtitle', 'Create, search, filter, view, edit roles, suspend accounts, and export user records.')}</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => setShowCreateModal(true)}>
            <FaUserPlus /> {t('admin.createUser', 'Create User')}
          </button>
          <button className="admin-btn admin-btn-outline" onClick={handleExportCSV}>
            <FaFileCsv /> {t('admin.exportCSV', 'Export CSV')}
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('admin.searchUsersPlaceholder', 'Search by name, email, or username...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="admin-btn admin-btn-sm">{t('common.search', 'Search')}</button>
        </form>
        <div className="admin-filters">
          <div className="filter-group">
            <FaFilter />
            <label>{t('common.role', 'Role')}:</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">{t('common.all', 'All')} {t('common.role', 'Roles')}</option>
              <option value="user">{t('auth.gardener', 'User')}</option>
              <option value="admin">{t('auth.admin', 'Admin')}</option>
            </select>
          </div>
          <div className="filter-group">
            <label>{t('common.status', 'Status')}:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">{t('common.all', 'All')} {t('common.status', 'Status')}</option>
              <option value="active">{t('common.active', 'Active')}</option>
              <option value="suspended">{t('admin.suspended', 'Suspended')}</option>
            </select>
          </div>
          <div className="filter-group">
            <label>{t('profile.gardenerLevel', 'Level')}:</label>
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
              <option value="all">{t('common.all', 'All')} {t('profile.gardenerLevel', 'Levels')}</option>
              <option value="beginner">{t('profile.levels.beginner', 'Beginner')}</option>
              <option value="intermediate">{t('profile.levels.intermediate', 'Intermediate')}</option>
              <option value="advanced">{t('profile.levels.advanced', 'Advanced')}</option>
            </select>
          </div>
          <button className="admin-btn admin-btn-sm" onClick={loadUsers}>{t('common.filter', 'Apply')}</button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="admin-loading-spinner">{t('admin.loadingUsers', 'Loading users...')}</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>{t('common.name', 'User')}</th>
                <th>{t('auth.email', 'Email')}</th>
                <th>{t('common.role', 'Role')}</th>
                <th>{t('profile.gardenerLevel', 'Level')}</th>
                <th>{t('common.status', 'Status')}</th>
                <th>{t('common.date', 'Joined')}</th>
                <th>{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">{t('admin.noUsersFound', 'No users found matching criteria.')}</td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
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
                        <option value="user">{t('auth.gardener', 'User')}</option>
                        <option value="admin">{t('auth.admin', 'Admin')}</option>
                      </select>
                    </td>
                    <td>
                      <span className={`level-badge ${u.gardeningLevel}`}>
                        {t(`profile.levels.${u.gardeningLevel || 'beginner'}`, u.gardeningLevel || 'beginner')}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`status-toggle ${u.isActive ? 'active' : 'suspended'}`}
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                        title={u.isActive ? t('admin.users.clickSuspend', 'Click to suspend') : t('admin.users.clickActivate', 'Click to activate')}
                      >
                        {u.isActive ? <><FaToggleOn /> {t('common.active', 'Active')}</> : <><FaToggleOff /> {t('admin.suspended', 'Suspended')}</>}
                      </button>
                    </td>
                    <td><small>{new Date(u.createdAt).toLocaleDateString()}</small></td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="admin-action-icon approve"
                          title={t('admin.users.viewDetails', 'View User Details')}
                          onClick={() => setViewingUser(u)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="admin-action-icon edit"
                          title={t('admin.users.editDetails', 'Edit User Details')}
                          onClick={() => setEditingUser({ ...u })}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="admin-action-icon delete"
                          title={t('admin.users.deleteUser', 'Delete User')}
                          onClick={() => promptDeleteUser(u._id, u.name)}
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

          <AdminPagination
            currentPage={currentPage}
            totalItems={users.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* View User Details Modal */}
      {viewingUser && (
        <div className="admin-modal-overlay" onClick={() => setViewingUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaEye /> {t('admin.users.profileDetails', 'User Profile Details')}</h3>
              <button className="modal-close" onClick={() => setViewingUser(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="admin-modal-form">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  {viewingUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>{viewingUser.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{viewingUser.email}</span>
                </div>
              </div>

              <div className="admin-modal-details-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                padding: '1rem',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('admin.users.userId', 'USER ID')}</label>
                  <code style={{ fontSize: '0.8rem' }}>{viewingUser._id}</code>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('common.role', 'ROLE')}</label>
                  <span className={`role-select-inline ${viewingUser.role}`} style={{ padding: '0.2rem 0.6rem' }}>
                    {viewingUser.role === 'admin' ? t('auth.admin', 'Admin').toUpperCase() : t('auth.gardener', 'User').toUpperCase()}
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('admin.users.accountStatus', 'ACCOUNT STATUS')}</label>
                  <span style={{ fontWeight: '600', color: viewingUser.isActive ? '#27ae60' : '#e74c3c' }}>
                    {viewingUser.isActive ? t('common.active', 'Active') : t('admin.suspended', 'Suspended')}
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('profile.gardenerLevel', 'GARDENING LEVEL')}</label>
                  <span className={`level-badge ${viewingUser.gardeningLevel}`}>
                    {t(`profile.levels.${viewingUser.gardeningLevel || 'beginner'}`, viewingUser.gardeningLevel || 'beginner')}
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('admin.users.joinedDate', 'JOINED DATE')}</label>
                  <span style={{ fontSize: '0.85rem' }}>{new Date(viewingUser.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('admin.users.lastUpdated', 'LAST UPDATED')}</label>
                  <span style={{ fontSize: '0.85rem' }}>{new Date(viewingUser.updatedAt || viewingUser.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="admin-modal-footer" style={{ marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => {
                    setEditingUser({ ...viewingUser });
                    setViewingUser(null);
                  }}
                >
                  <FaEdit /> {t('profile.editProfile', 'Edit Profile')}
                </button>
                <button type="button" className="admin-btn admin-btn-primary" onClick={() => setViewingUser(null)}>
                  {t('common.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="admin-modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaEdit /> {t('admin.users.editDetails', 'Edit User Details')}</h3>
              <button className="modal-close" onClick={() => setEditingUser(null)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSaveEditUser} className="admin-modal-form" noValidate>
              <div className="form-group">
                <label>{t('auth.fullName', 'Full Name')}</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t('auth.email', 'Email Address')}</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('auth.role', 'System Role')}</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  >
                    <option value="user">{t('auth.gardener', 'User')}</option>
                    <option value="admin">{t('auth.admin', 'Admin')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('profile.gardenerLevel', 'Gardening Level')}</label>
                  <select
                    value={editingUser.gardeningLevel || 'beginner'}
                    onChange={(e) => setEditingUser({ ...editingUser, gardeningLevel: e.target.value })}
                  >
                    <option value="beginner">{t('profile.levels.beginner', 'Beginner')}</option>
                    <option value="intermediate">{t('profile.levels.intermediate', 'Intermediate')}</option>
                    <option value="advanced">{t('profile.levels.advanced', 'Advanced')}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{t('admin.users.accountStatus', 'Account Status')}</label>
                <select
                  value={editingUser.isActive ? 'active' : 'suspended'}
                  onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.value === 'active' })}
                >
                  <option value="active">{t('admin.users.activeCanLogin', 'Active (Can log in)')}</option>
                  <option value="suspended">{t('admin.users.suspendedBlocked', 'Suspended (Blocked from system)')}</option>
                </select>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setEditingUser(null)}>
                  {t('common.cancel', 'Cancel')}
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <FaCheck /> {t('common.save', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaUserPlus /> {t('admin.createUser', 'Create New User')}</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="admin-modal-form" noValidate>
              <div className="form-group">
                <label>{t('auth.fullName', 'Full Name')}</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder={t('auth.namePlaceholder', 'Enter full name')}
                />
              </div>
              <div className="form-group">
                <label>{t('auth.email', 'Email')}</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder={t('auth.emailPlaceholder', 'Enter email address')}
                />
              </div>
              <div className="form-group">
                <label>{t('auth.password', 'Password')}</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder={t('admin.users.min6chars', 'Minimum 6 characters')}
                />
              </div>
              <div className="form-group">
                <label>{t('auth.city', 'City')} *</label>
                <input
                  type="text"
                  value={newUser.city}
                  onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                  placeholder={t('auth.cityPlaceholder', 'Enter city (e.g. Mumbai)')}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('common.role', 'Role')}</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="user">{t('auth.gardener', 'User')}</option>
                    <option value="admin">{t('auth.admin', 'Admin')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('profile.gardenerLevel', 'Gardening Level')}</label>
                  <select
                    value={newUser.gardeningLevel}
                    onChange={(e) => setNewUser({ ...newUser, gardeningLevel: e.target.value })}
                  >
                    <option value="beginner">{t('profile.levels.beginner', 'Beginner')}</option>
                    <option value="intermediate">{t('profile.levels.intermediate', 'Intermediate')}</option>
                    <option value="advanced">{t('profile.levels.advanced', 'Advanced')}</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowCreateModal(false)}>
                  {t('common.cancel', 'Cancel')}
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <FaCheck /> {t('admin.createUser', 'Create User')}
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