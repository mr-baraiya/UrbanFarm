import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import AdminPagination from './AdminPagination';
import {
  FaSearch,
  FaFileCsv,
  FaClock,
  FaFilter,
  FaChevronDown,
} from 'react-icons/fa';
import './AdminAuditLogs.css';

const ACTION_LABELS = {
  create_user: { label: 'Created User', color: 'green' },
  update_user: { label: 'Updated User', color: 'blue' },
  update_user_role: { label: 'Changed Role', color: 'purple' },
  delete_user: { label: 'Deleted User', color: 'red' },
  create_garden: { label: 'Created Garden', color: 'green' },
  update_garden: { label: 'Updated Garden', color: 'blue' },
  delete_garden: { label: 'Deleted Garden', color: 'red' },
  create_plant: { label: 'Added Plant', color: 'green' },
  update_plant: { label: 'Updated Plant', color: 'blue' },
  delete_plant: { label: 'Deleted Plant', color: 'red' },
  create_post: { label: 'Published Post', color: 'green' },
  moderate_post: { label: 'Moderated Post', color: 'orange' },
  delete_post: { label: 'Deleted Post', color: 'red' },
  create_contact_lead: { label: 'New Guest Lead', color: 'green' },
  update_contact_lead: { label: 'Updated Inquiry', color: 'blue' },
  delete_contact_lead: { label: 'Deleted Inquiry', color: 'red' },
  export_users_csv: { label: 'Exported Users CSV', color: 'teal' },
  export_gardens_csv: { label: 'Exported Gardens CSV', color: 'teal' },
  export_plants_csv: { label: 'Exported Plants CSV', color: 'teal' },
  export_posts_csv: { label: 'Exported Posts CSV', color: 'teal' },
  export_logs_csv: { label: 'Exported Logs CSV', color: 'teal' },
};

const TARGET_MAP = {
  contact_lead: 'Guest Inquiry',
  lead: 'Guest Inquiry',
  user: 'User Account',
  post: 'Community Post',
  garden: 'Garden Space',
  plant: 'Plant Record',
  system: 'System Service',
  diagnosis: 'AI Diagnosis',
};

const ActionCategoryDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { value: 'all', label: 'All Actions' },
    { value: 'user', label: 'User Actions' },
    { value: 'role', label: 'Role Updates' },
    { value: 'contact', label: 'Guest Lead Inquiries' },
    { value: 'garden', label: 'Garden Operations' },
    { value: 'plant', label: 'Plant Inventory' },
    { value: 'post', label: 'Community Moderation' },
    { value: 'export', label: 'CSV Data Exports' },
    { value: 'delete', label: 'System Deletions' },
  ];

  const currentLabel = options.find((o) => o.value === value)?.label || 'All Actions';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="custom-admin-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="custom-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{currentLabel}</span>
        <FaChevronDown style={{ fontSize: '0.65rem', marginLeft: '0.4rem', opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div className="custom-dropdown-menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`custom-dropdown-item ${value === opt.value ? 'active' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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
      const matchesSearch =
        search === '' ||
        (log.adminId?.email && log.adminId.email.toLowerCase().includes(search.toLowerCase())) ||
        (log.adminId?.name && log.adminId.name.toLowerCase().includes(search.toLowerCase())) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.targetType.toLowerCase().includes(search.toLowerCase()) ||
        (log.targetId && String(log.targetId).toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterAction === 'all') return true;
      if (filterAction === 'user') return log.action.includes('user') && !log.action.includes('role');
      if (filterAction === 'role') return log.action.includes('role');
      if (filterAction === 'contact') return log.action.includes('contact_lead');
      if (filterAction === 'garden') return log.action.includes('garden');
      if (filterAction === 'plant') return log.action.includes('plant');
      if (filterAction === 'post') return log.action.includes('post');
      if (filterAction === 'export') return log.action.includes('export');
      if (filterAction === 'delete') return log.action.includes('delete');

      return true;
    });
  }, [logs, search, filterAction]);

  const totalLogs = filteredLogs.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  const getActionMeta = (action) => {
    if (ACTION_LABELS[action]) return ACTION_LABELS[action];
    const formatted = action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    return { label: formatted, color: 'default' };
  };

  const renderDetails = (details) => {
    if (!details || Object.keys(details).length === 0) {
      return <span className="text-muted">—</span>;
    }
    return (
      <div className="log-detail-pills">
        {Object.entries(details).map(([key, value]) => {
          let displayValue;
          if (typeof value === 'boolean') {
            displayValue = value ? t('common.yes', 'Yes') : t('common.no', 'No');
          } else if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              displayValue = value.join(', ');
            } else {
              displayValue = Object.entries(value)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');
            }
          } else {
            displayValue = String(value);
          }

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
            autoComplete="off"
          />
        </div>
        <div className="admin-filters">
          <div className="filter-group">
            <FaFilter />
            <label>{t('admin.audit.actionCategory', 'Category:')}</label>
            <ActionCategoryDropdown value={filterAction} onChange={(val) => setFilterAction(val)} />
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
                  const targetLabel = TARGET_MAP[log.targetType] || log.targetType;
                  const ts = formatTimestamp(log.createdAt);
                  const adminName = log.adminId?.name || t('admin.audit.system', 'System');
                  const avatarInitial = (adminName || 'S').charAt(0).toUpperCase();

                  return (
                    <tr key={log._id}>
                      <td data-label={t('admin.audit.thTimestamp', 'Timestamp')}>
                        <div className="td-cell-content">
                          <div className="log-timestamp">
                            <FaClock className="log-ts-icon" />
                            <div className="log-ts-text">
                              <span className="log-date">{ts.date}</span>
                              <span className="log-time">{ts.time}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td data-label={t('admin.audit.thAdmin', 'Admin')}>
                        <div className="td-cell-content">
                          <div className="log-admin-cell">
                            <span className="log-admin-avatar">
                              {avatarInitial}
                            </span>
                            <div className="log-admin-info">
                              <strong>{adminName}</strong>
                              <small>{log.adminId?.email || ''}</small>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td data-label={t('admin.audit.thAction', 'Action')}>
                        <div className="td-cell-content">
                          <span className={`log-action-chip chip-${actionMeta.color}`}>
                            {actionMeta.label}
                          </span>
                        </div>
                      </td>
                      <td data-label={t('admin.audit.thTarget', 'Target')}>
                        <div className="td-cell-content">
                          <div className="log-target-cell">
                            <span className="log-target-badge">{targetLabel}</span>
                            {log.targetId && (
                              <small className="log-target-id" title={log.targetId}>
                                {truncateId(log.targetId)}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td data-label={t('admin.audit.thDetails', 'Changes / Details')}>
                        <div className="td-cell-content">
                          {renderDetails(log.details)}
                        </div>
                      </td>
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
