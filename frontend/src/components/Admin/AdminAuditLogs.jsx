import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaSearch, FaFileCsv, FaClock } from 'react-icons/fa';
import './AdminAuditLogs.css';

const ACTION_LABELS = {
  create_user: { label: 'Created User', color: 'green' },
  update_user: { label: 'Updated User', color: 'blue' },
  update_user_role: { label: 'Changed Role', color: 'purple' },
  delete_user: { label: 'Deleted User', color: 'red' },
  delete_garden: { label: 'Deleted Garden', color: 'red' },
  delete_plant: { label: 'Deleted Plant', color: 'red' },
  delete_post: { label: 'Deleted Post', color: 'red' },
  moderate_post: { label: 'Moderated Post', color: 'orange' },
  export_users_csv: { label: 'Exported Users', color: 'teal' },
  export_gardens_csv: { label: 'Exported Gardens', color: 'teal' },
  export_plants_csv: { label: 'Exported Plants', color: 'teal' },
  export_posts_csv: { label: 'Exported Posts', color: 'teal' },
  export_logs_csv: { label: 'Exported Logs', color: 'teal' },
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logs');
      setLogs(res.data.logs || []);
    } catch (error) {
      console.error('Failed to fetch admin logs:', error);
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
    } catch (error) {
      alert('Failed to export CSV');
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesAction = filterAction === 'all' || log.action.includes(filterAction);
    const adminEmail = log.adminId?.email || 'System';
    const matchesSearch =
      search === '' ||
      adminEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.targetType.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const renderDetails = (details) => {
    if (!details || Object.keys(details).length === 0) {
      return <span className="text-muted">—</span>;
    }
    return (
      <div className="log-detail-pills">
        {Object.entries(details).map(([key, value]) => {
          const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
          const pillColor =
            key === 'newRole' || key === 'role' ? 'purple' :
            key === 'isActive' ? (value ? 'green' : 'red') :
            key === 'isApproved' ? (value ? 'green' : 'orange') :
            key === 'isFlagged' ? (value ? 'red' : 'green') :
            key === 'email' ? 'blue' : 'default';
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
    const d = new Date(dateStr);
    const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  return (
    <div className="audit-logs-container">
      <div className="admin-page-header">
        <div>
          <h2>System Audit Logs & Activity Trail</h2>
          <p>Complete security log of all administrative actions, role changes, and content moderations.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-outline" onClick={handleExportCSV}>
            <FaFileCsv /> Export Audit Logs CSV
          </button>
        </div>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search logs by admin email, action, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-filters">
          <div className="filter-group">
            <label>Action Category:</label>
            <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
              <option value="all">All Actions</option>
              <option value="user">User Actions</option>
              <option value="role">Role Updates</option>
              <option value="moderate">Post Moderation</option>
              <option value="export">CSV Exports</option>
              <option value="delete">Deletions</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-spinner">Loading audit logs...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Target</th>
                <th>Changes / Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">No logs recorded matching query.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actionMeta = ACTION_LABELS[log.action] || { label: log.action, color: 'default' };
                  const ts = formatTimestamp(log.createdAt);
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
                            {(log.adminId?.name || 'S').charAt(0).toUpperCase()}
                          </span>
                          <div className="log-admin-info">
                            <strong>{log.adminId?.name || 'System'}</strong>
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
                          <span className="log-target-badge">{log.targetType}</span>
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
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
