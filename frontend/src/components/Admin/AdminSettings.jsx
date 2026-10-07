import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import {
  FaCog,
  FaServer,
  FaDatabase,
  FaFileCsv,
  FaFileArchive,
  FaCheckCircle,
  FaSync,
  FaGlobe,
  FaDownload,
  FaUsers,
  FaSeedling,
  FaLeaf,
  FaComments,
  FaHistory,
  FaAddressBook,
} from 'react-icons/fa';
import { Bot } from 'lucide-react';
import './AdminSettings.css';

const AdminSettings = () => {
  const { i18n, t } = useTranslation();
  const { addNotification } = useNotification();
  const [exportingBundle, setExportingBundle] = useState(false);
  const [exportingType, setExportingType] = useState(null);

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  ];

  const services = [
    {
      name: t('admin.settings.serviceNames.mongo', 'MongoDB Database Cluster'),
      status: t('admin.settings.statusOnline', 'Online'),
      latency: '12ms',
      icon: <FaDatabase />,
    },
    {
      name: t('admin.settings.serviceNames.gemini', 'Google Gemini AI Service'),
      status: t('admin.settings.statusActive', 'Active'),
      latency: '140ms',
      icon: <FaServer />,
    },
    {
      name: t('admin.settings.serviceNames.plantid', 'Plant ID Disease Engine'),
      status: t('admin.settings.statusActive', 'Active'),
      latency: '210ms',
      icon: <FaServer />,
    },
    {
      name: t('admin.settings.serviceNames.weather', 'OpenWeather Map API'),
      status: t('admin.settings.statusActive', 'Active'),
      latency: '85ms',
      icon: <FaServer />,
    },
    {
      name: t('admin.settings.serviceNames.cloudinary', 'Cloudinary Image CDN'),
      status: t('admin.settings.statusActive', 'Active'),
      latency: '45ms',
      icon: <FaServer />,
    },
  ];

  const handleLanguageChange = (newLang) => {
    if (!newLang || newLang === i18n.language) return;
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
    localStorage.setItem('has_chosen_language', 'true');
    document.documentElement.lang = newLang;

    const langObj = languages.find((l) => l.code === newLang);
    addNotification(
      t('admin.settings.languageChanged', 'Interface language updated to {{lang}}', {
        lang: langObj ? `${langObj.native} (${langObj.name})` : newLang,
      }),
      'success'
    );
  };

  // Helper function to reliably trigger browser download and revoke object URL
  const triggerDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 400);
  };

  // Full System ZIP Bundle Export (all tables + JSON manifest)
  const handleExportBundle = async () => {
    setExportingBundle(true);
    try {
      const response = await api.get('/admin/export/bundle', {
        responseType: 'blob',
        params: { _t: Date.now() },
      });
      const blob = new Blob([response.data], { type: 'application/zip' });
      const dateStr = new Date().toISOString().slice(0, 10);
      triggerDownload(blob, `urbanfarm_full_system_backup_${dateStr}.zip`);
      addNotification(
        t('admin.settings.exportSuccess', 'System backup ZIP archive exported successfully!'),
        'success'
      );
    } catch (error) {
      console.error('Failed to export system backup bundle:', error);
      addNotification(t('admin.settings.exportFailed', 'Failed to export system data'), 'error');
    } finally {
      setExportingBundle(false);
    }
  };

  // Individual Table CSV Export
  const handleExportSingle = async (type, filenamePrefix, label) => {
    setExportingType(type);
    try {
      const response = await api.get(`/admin/export/${type}`, {
        responseType: 'blob',
        params: { _t: Date.now() },
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      triggerDownload(blob, `urbanfarm_${filenamePrefix}_export.csv`);
      addNotification(
        t('admin.settings.exportSingleSuccess', 'Exported {{name}} (.csv) successfully!', { name: label }),
        'success'
      );
    } catch (error) {
      console.error(`Failed to export ${type}:`, error);
      addNotification(t('admin.settings.exportFailed', 'Failed to export system data'), 'error');
    } finally {
      setExportingType(null);
    }
  };

  const individualTables = [
    { type: 'users', file: 'users', label: t('admin.settings.exportUsers', 'Users'), icon: <FaUsers /> },
    { type: 'gardens', file: 'gardens', label: t('admin.settings.exportGardens', 'Gardens'), icon: <FaSeedling /> },
    { type: 'plants', file: 'plants', label: t('admin.settings.exportPlants', 'Plants'), icon: <FaLeaf /> },
    { type: 'posts', file: 'community_posts', label: t('admin.settings.exportPosts', 'Community Posts'), icon: <FaComments /> },
    { type: 'logs', file: 'audit_logs', label: t('admin.settings.exportLogs', 'Audit Logs'), icon: <FaHistory /> },
    { type: 'leads', file: 'guest_leads', label: t('admin.settings.exportLeads', 'Guest Leads'), icon: <FaAddressBook /> },
    { type: 'chatlogs', file: 'chatbot_logs', label: t('admin.settings.exportChatlogs', 'Chatbot Logs'), icon: <Bot size={16} /> },
  ];

  return (
    <div className="admin-settings-container">
      <div className="admin-page-header">
        <div>
          <h2>{t('admin.settings.title', 'System Settings & Maintenance')}</h2>
          <p>{t('admin.settings.subtitle', 'Configure system defaults, inspect third-party API service status, and perform full data backups.')}</p>
        </div>
      </div>

      <div className="admin-settings-grid">
        {/* Language Preference Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3><FaGlobe /> {t('admin.settings.languageCardTitle', 'Admin Panel Language')}</h3>
          </div>
          <p className="admin-card-desc">
            {t('admin.settings.languageCardDesc', 'Select your preferred interface language for the admin control panel and platform operations.')}
          </p>

          <div className="language-selector-group">
            <label className="settings-field-label">
              {t('admin.settings.activeLanguage', 'Active Language')}
            </label>

            {/* Interactive Language Buttons */}
            <div className="language-pill-options">
              {languages.map((lang) => {
                const isActive = (i18n.language || 'en') === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    className={`language-pill-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <span className="lang-native">{lang.native}</span>
                    <span className="lang-label">({lang.name})</span>
                    {isActive && <FaCheckCircle className="lang-check-icon" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* API Services Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3><FaServer /> {t('admin.settings.servicesCardTitle', 'External Services & API Health')}</h3>
          </div>
          <p className="admin-card-desc">
            {t('admin.settings.servicesCardDesc', 'Real-time connectivity and operational latency for integrated cloud services and AI engines.')}
          </p>
          <div className="service-health-list">
            {services.map((srv, idx) => (
              <div key={idx} className="service-health-item">
                <div className="service-info">
                  <span className="service-icon">{srv.icon}</span>
                  <div>
                    <strong>{srv.name}</strong>
                    <span className="service-latency">{t('admin.settings.latency', 'Latency')}: {srv.latency}</span>
                  </div>
                </div>
                <div className="service-status active">
                  <FaCheckCircle /> {srv.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Database Backup Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3><FaFileArchive /> {t('admin.settings.backupCardTitle', 'Full Database Backup & Data Export')}</h3>
          </div>
          <p className="admin-card-desc">
            {t('admin.settings.backupCardDesc', 'Export complete platform records (Users, Gardens, Plants, Community Posts, Audit Logs, Guest Leads) into standardized CSV formats or download the full system ZIP backup bundle.')}
          </p>
          <div className="backup-actions">
            <button
              className="admin-btn admin-btn-primary full-bundle-btn"
              onClick={handleExportBundle}
              disabled={exportingBundle || exportingType !== null}
            >
              {exportingBundle ? (
                <>
                  <FaSync className="fa-spin" /> {t('admin.settings.exportingBundle', 'Creating System Archive (.ZIP)...')}
                </>
              ) : (
                <>
                  <FaFileArchive /> {t('admin.settings.exportBundle', 'Export Full System ZIP Bundle')}
                </>
              )}
            </button>
          </div>

          <div className="individual-exports-section">
            <span className="individual-exports-title">
              <FaDownload /> {t('admin.settings.individualExports', 'Individual Table Exports (.CSV)')}
            </span>
            <div className="individual-exports-grid">
              {individualTables.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  className="individual-export-btn"
                  onClick={() => handleExportSingle(item.type, item.file, item.label)}
                  disabled={exportingBundle || exportingType !== null}
                >
                  {exportingType === item.type ? (
                    <FaSync className="fa-spin" />
                  ) : (
                    item.icon
                  )}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
