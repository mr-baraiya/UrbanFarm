import React from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './DiagnosisHistory.css';

const DiagnosisHistory = ({ 
  history, 
  onItemClick, 
  selectedId,
  filterStatus,
  onFilterChange,
  searchTerm,
  onSearchChange,
  onAddToSchedule
}) => {
  const { t, i18n } = useTranslation();

  const getStatusBadge = (item) => {
    const isHealthy = item.isHealthy || item.diseaseName?.toLowerCase().includes('healthy');
    if (isHealthy) {
      return { label: t('diagnose.statusHealthy', 'Healthy'), color: '#2d6a4f', isHealthy: true };
    }
    if (item.isResolved) {
      return { label: t('diagnose.statusResolved', 'Resolved'), color: '#10b981', isResolved: true };
    }
    return { 
      label: t('diagnose.needsAttention', 'Needs Attention'), 
      color: item.confidence > 0.7 ? '#c94a4a' : '#c9924a', 
      needsAttention: true 
    };
  };

  const filterOptions = [
    { value: 'all', label: t('diagnose.filterAll', 'All') },
    { value: 'needs_attention', label: t('diagnose.needsAttention', 'Needs Attention') },
    { value: 'healthy', label: t('diagnose.filterHealthy', 'Healthy') },
    { value: 'critical', label: t('diagnose.filterCritical', 'Critical') },
    { value: 'monitoring', label: t('diagnose.filterMonitoring', 'Monitoring') },
    { value: 'resolved', label: t('diagnose.filterResolved', 'Resolved') },
  ];

  const getDateLocale = () => {
    if (i18n.language === 'gu') return 'gu-IN';
    if (i18n.language === 'hi') return 'hi-IN';
    return 'en-US';
  };

  return (
    <div className="diagnosis-history">
      <div className="history-header">
        <h3>{t('diagnose.historyTitle', 'Diagnosis History')}</h3>
        <span className="history-count">
          {t('diagnose.recordsCount', '{{count}} records', { count: history.length })}
        </span>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder={t('diagnose.searchPlaceholder', 'Search by disease or plant...')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {filterOptions.map(option => (
            <button
              key={option.value}
              className={`filter-pill ${filterStatus === option.value ? 'active' : ''}`}
              onClick={() => onFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="no-history">
          <span className="no-history-badge">No Records</span>
          <p>{t('diagnose.noDiagnoses', 'No diagnoses yet.')}</p>
          <p className="sub-text">{t('diagnose.startUpload', 'Upload a plant photo to get started!')}</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const status = getStatusBadge(item);
            const isSelected = selectedId === item._id;
            const publicUrl = `/d/${item.shareId || item._id}`;
            
            return (
              <div 
                key={item._id} 
                className={`history-item ${isSelected ? 'active' : ''}`}
                onClick={() => onItemClick(item)}
              >
                <div className="history-thumbnail">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="Diagnosis" />
                  ) : (
                    <div className="thumbnail-fallback">Specimen</div>
                  )}
                </div>
                
                <div className="history-content">
                  <div className="history-header-row">
                    <span className="history-disease">
                      {getLocalizedDynamicText(item.diseaseName, i18n.language)}
                    </span>
                    <span className="history-status-tag" style={{ color: status.color, borderColor: status.color }}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="history-details">
                    {item.plantId?.name && (
                      <span className="history-plant">
                        {getLocalizedDynamicText(item.plantId.name, i18n.language)}
                      </span>
                    )}
                    <span className="history-confidence">
                      {t('diagnose.confidenceLabel', '{{percent}}% confidence', { percent: Math.round(item.confidence * 100) })}
                    </span>
                    <span className="history-date">
                      {new Date(item.createdAt).toLocaleDateString(getDateLocale())}
                    </span>
                  </div>

                  <div className="history-quick-actions" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="history-qa-link"
                      title={t('diagnose.viewPublicReport', 'View Public Report')}
                    >
                      {t('diagnose.viewReportOnline', 'Public Page')}
                    </a>
                    {item.treatment && onAddToSchedule && (
                      <button
                        type="button"
                        className="history-qa-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToSchedule(item);
                        }}
                        title={t('diagnose.quickActionSchedule', 'Quick Schedule Treatment')}
                      >
                        {t('diagnose.addToSchedule', 'Schedule')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DiagnosisHistory;