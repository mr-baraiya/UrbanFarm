import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaHistory, FaSearch, FaFileCsv, FaShieldAlt } from 'react-icons/fa';
import './AdminAuditLogs.css';

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
      const response = await api.get('/admin/export/logs', {
        responseType: 'blob',
      });
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
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="user">User Actions (create/update/delete)</option>
              <option value="role">Role Updates</option>
              <option value="moderate">Post Moderation</option>
              <option value="export">CSV Exports</option>
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
                <th>Admin / User</th>
                <th>Action</th>
                <th>Target Type</th>
                <th>Target ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No logs recorded matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <small>{new Date(log.createdAt).toLocaleString()}</small>
                    </td>
                    <td>
                      <strong>{log.adminId?.name || 'System Admin'}</strong>
                      <br />
                      <small className="text-muted">{log.adminId?.email || 'N/A'}</small>
                    </td>
                    <td>
                      <span className="log-action-tag">{log.action}</span>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{log.targetType}</span>
                    </td>
                    <td>
                      <small>{log.targetId || 'N/A'}</small>
                    </td>
                    <td>
                      <pre className="log-details-json">
                        {JSON.stringify(log.details || {}, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
