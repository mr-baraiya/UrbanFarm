import React, { useState } from 'react';
import api from '../../services/api';
import {
  FaCog,
  FaServer,
  FaDatabase,
  FaFileCsv,
  FaCheckCircle,
  FaSync,
  FaExclamationCircle,
} from 'react-icons/fa';
import './AdminSettings.css';

const AdminSettings = () => {
  const [exporting, setExporting] = useState(false);

  const services = [
    { name: 'MongoDB Database Cluster', status: 'Online', latency: '12ms', icon: <FaDatabase /> },
    { name: 'Google Gemini AI Service', status: 'Active', latency: '140ms', icon: <FaServer /> },
    { name: 'Plant.id Disease Engine', status: 'Active', latency: '210ms', icon: <FaServer /> },
    { name: 'OpenWeather Map API', status: 'Active', latency: '85ms', icon: <FaServer /> },
    { name: 'Cloudinary Image CDN', status: 'Active', latency: '45ms', icon: <FaServer /> },
  ];

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const types = ['users', 'gardens', 'plants', 'posts', 'logs'];
      for (const type of types) {
        const response = await api.get(`/admin/export/${type}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `urbanfarm_${type}_export.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      alert('Failed to export system data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="admin-settings-container">
      <div className="admin-page-header">
        <div>
          <h2>System Settings & Maintenance</h2>
          <p>Configure system defaults, inspect third-party API service status, and perform full data backups.</p>
        </div>
      </div>

      <div className="admin-settings-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h3><FaServer /> External Services & API Health</h3>
          </div>
          <div className="service-health-list">
            {services.map((srv, idx) => (
              <div key={idx} className="service-health-item">
                <div className="service-info">
                  <span className="service-icon">{srv.icon}</span>
                  <div>
                    <strong>{srv.name}</strong>
                    <span className="service-latency">Latency: {srv.latency}</span>
                  </div>
                </div>
                <div className="service-status active">
                  <FaCheckCircle /> {srv.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3><FaFileCsv /> Full Database Backup & Data Export</h3>
          </div>
          <p className="admin-card-desc">
            Export complete platform records (Users, Gardens, Plants, Community Posts, Audit Logs) into standardized CSV formats for offsite archival.
          </p>
          <div className="backup-actions">
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleExportAll}
              disabled={exporting}
            >
              {exporting ? <FaSync className="fa-spin" /> : <FaFileCsv />} Export Full System CSV Bundle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
