import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import AdminPagination from './AdminPagination';
import {
  FaSearch,
  FaFileCsv,
  FaClock,
} from 'react-icons/fa';
import './AdminAuditLogs.css';

const ACTION_COLORS = {
  create_user: 'green',
  update_user: 'blue',
  update_user_role: 'purple',
  delete_user: 'red',
  delete_garden: 'red',
  delete_plant: 'red',
  delete_post: 'red',
  moderate_post: 'orange',
  export_users_csv: 'teal',
  export_gardens_csv: 'teal',
  export_plants_csv: 'teal',
  export_posts_csv: 'teal',
  export_logs_csv: 'teal',
  update_contact_lead: 'blue',
  delete_contact_lead: 'red',
  create_contact_lead: 'green',
};

const AdminAuditLogs = () => {
  const { t, i18n } = useTranslation();
  const { addNotification } = useNotification();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [search, setSearch] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    fetchLogs();
  }, []);

  // Reset to first page when filtering or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterAction]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/logs?_t=${Date.now()}`);
      setLogs(res.data.logs || []);
    } catch (error) {
      console.error('Failed to fetch admin logs:', error);
      addNotification(t('admin.audit.fetchFailed', 'Failed to load audit logs'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/export/logs', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'urbanfarm_audit_logs.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      addNotification(t('admin.audit.exportSuccess', 'Audit logs CSV exported successfully!'), 'success');
    } catch (error) {
      addNotification(t('admin.audit.exportFailed', 'Failed to export audit logs CSV'), 'error');
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction = filterAction === 'all' || (log.action && log.action.includes(filterAction));
      const adminEmail = log.adminId?.email || 'System';
      const adminName = log.adminId?.name || '';
      const matchesSearch =
        search === '' ||
        adminEmail.toLowerCase().includes(search.toLowerCase()) ||
        adminName.toLowerCase().includes(search.toLowerCase()) ||
        (log.action && log.action.toLowerCase().includes(search.toLowerCase())) ||
        (log.targetType && log.targetType.toLowerCase().includes(search.toLowerCase()));
      return matchesAction && matchesSearch;
    });
  }, [logs, filterAction, search]);

  // Pagination Calculations
  const totalLogs = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalLogs / pageSize));

  // Auto-adjust currentPage if filtered results shrink
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedLogs = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIdx, startIdx + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const startIndex = totalLogs === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalLogs);

  const getActionMeta = (action) => {
    const color = ACTION_COLORS[action] || 'default';
    const fallback = action
      ? action.replace(/_/g, ' ').replace(/^./, (s) => s.toUpperCase())
      : '';
    const label = t(`admin.audit.actions.${action}`, fallback);
    return { label, color };
  };

  const getTargetLabel = (targetType) => {
    if (!targetType) return '';
    const fallback = targetType.replace(/_/g, ' ').replace(/^./, (s) => s.toUpperCase());
    return t(`admin.audit.targets.${targetType}`, fallback);
  };

  const renderDetails = (details) => {
    if (!details || Object.keys(details).length === 0) {
      return <span className="text-muted">—</span>;
    }
    return (
      <div className="log-detail-pills">
        {Object.entries(details).map(([key, value]) => {
          const displayValue =
            typeof value === 'boolean'
              ? value
                ? t('common.yes', 'Yes')
                : t('common.no', 'No')
              : String(value);
          const pillColor =
            key === 'newRole' || key === 'role'
              ? 'purple'
              : key === 'isActive'
              ? value
                ? 'green'
                : 'red'
              : key === 'isApproved'
              ? value
                ? 'green'
                : 'orange'
              : key === 'isFlagged'
              ? value
                ? 'red'
                : 'green'
              : key === 'email'
              ? 'blue'
              : 'default';
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
          return (
            <span key={key} className={`detail-pill pill-${pillColor}`}>
              <span className="detail-key">{label}:</span>
              <span className="detail-value">{displayValue}</span>
            </span>
          );
        })}
      </div>
    );
  };

  const truncateId = (id) => {
    if (!id) return '—';
    const str = String(id);
    return str.length > 10 ? `${str.slice(0, 6)}…${str.slice(-4)}` : str;
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return { date: '—', time: '—' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: dateStr, time: '' };
    const locale = i18n.language === 'gu' ? 'gu-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
    const date = d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  return (
    <div className="audit-logs-container">
      <div className="admin-page-header">
        <div>
          <h2>{t('admin.audit.title', 'System Audit Logs & Activity Trail')}</h2>
          <p>{t('admin.audit.subtitle', 'Complete security log of all administrative actions, role changes, and content moderations.')}</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-outline" onClick={handleExportCSV}>
            <FaFileCsv /> {t('admin.audit.exportCsv', 'Export Audit Logs CSV')}
          </button>
        </div>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('admin.audit.searchPlaceholder', 'Search logs by admin email, action, or target...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-filters">
          <div className="filter-group">
            <label>{t('admin.audit.actionCategory', 'Action Category:')}</label>
            <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
              <option value="all">{t('admin.audit.categories.all', 'All Actions')}</option>
              <option value="user">{t('admin.audit.categories.user', 'User Actions')}</option>
              <option value="role">{t('admin.audit.categories.role', 'Role Updates')}</option>
              <option value="moderate">{t('admin.audit.categories.moderate', 'Post Moderation')}</option>
              <option value="export">{t('admin.audit.categories.export', 'CSV Exports')}</option>
              <option value="delete">{t('admin.audit.categories.delete', 'Deletions')}</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-spinner">{t('admin.audit.loading', 'Loading audit logs...')}</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>{t('admin.audit.thTimestamp', 'Timestamp')}</th>
                <th>{t('admin.audit.thAdmin', 'Admin')}</th>
                <th>{t('admin.audit.thAction', 'Action')}</th>
                <th>{t('admin.audit.thTarget', 'Target')}</th>
                <th>{t('admin.audit.thDetails', 'Changes / Details')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">{t('admin.audit.noLogs', 'No logs recorded matching query.')}</td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const actionMeta = getActionMeta(log.action);
                  const ts = formatTimestamp(log.createdAt);
                  const adminName = log.adminId?.name || t('admin.audit.system', 'System');
                  const avatarInitial = (adminName || 'S').charAt(0).toUpperCase();

                  return (
                    <tr key={log._id}>
                      <td>
                        <div className="log-timestamp">
                          <FaClock className="log-ts-icon" />
                          <div className="log-ts-text">
                            <span className="log-date">{ts.date}</span>
                            <span className="log-time">{ts.time}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="log-admin-cell">
                          <span className="log-admin-avatar">
                            {avatarInitial}
                          </span>
                          <div className="log-admin-info">
                            <strong>{adminName}</strong>
                            <small>{log.adminId?.email || ''}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`log-action-chip chip-${actionMeta.color}`}>
                          {actionMeta.label}
                        </span>
                      </td>
                      <td>
                        <div className="log-target-cell">
                          <span className="log-target-badge">{getTargetLabel(log.targetType)}</span>
                          {log.targetId && (
                            <small className="log-target-id" title={log.targetId}>
                              {truncateId(log.targetId)}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>{renderDetails(log.details)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <AdminPagination
            currentPage={currentPage}
            totalItems={totalLogs}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
