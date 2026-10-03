import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
  FaCog,
  FaServer,
  FaDatabase,
  FaFileCsv,
  FaCheckCircle,
  FaSync,
  FaGlobe,
} from 'react-icons/fa';
import './AdminSettings.css';

const AdminSettings = () => {
  const { i18n, t } = useTranslation();
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
        {/* Language Preference Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3><FaGlobe /> Admin Panel Language / ભાષા સેટિંગ</h3>
          </div>
          <p className="admin-card-desc">
            Select your preferred interface language for the admin control panel and platform operations.
          </p>
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Active Language</label>
            <select
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: 'inherit',
                fontSize: '0.95rem'
              }}
              value={i18n.language || 'en'}
              onChange={(e) => {
                const newLang = e.target.value;
                i18n.changeLanguage(newLang);
                localStorage.setItem('language', newLang);
                localStorage.setItem('has_chosen_language', 'true');
                document.documentElement.lang = newLang;
              }}
            >
              <option value="en" style={{ background: '#1a2f23', color: '#fff' }}>English (Default)</option>
              <option value="gu" style={{ background: '#1a2f23', color: '#fff' }}>ગુજરાતી (Gujarati)</option>
              <option value="hi" style={{ background: '#1a2f23', color: '#fff' }}>हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>

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
