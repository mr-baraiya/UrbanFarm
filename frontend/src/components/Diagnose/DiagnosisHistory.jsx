import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiFileList3Line, 
  RiSearchLine, 
  RiCheckLine, 
  RiAlertLine,
  RiTimeLine,
  RiPlantLine
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './DiagnosisHistory.css';

const DiagnosisHistory = ({ 
  history, 
  onItemClick, 
  selectedId,
  filterStatus,
  onFilterChange,
  searchTerm,
  onSearchChange
}) => {
  const { t, i18n } = useTranslation();

  const getStatusBadge = (item) => {
    const isHealthy = item.isHealthy || item.diseaseName?.toLowerCase().includes('healthy');
    if (isHealthy) {
      return { label: t('diagnose.statusHealthy', 'Healthy'), color: '#2d6a4f', icon: <RiCheckLine /> };
    }
    if (item.isResolved) {
      return { label: t('diagnose.statusResolved', 'Resolved'), color: '#10b981', icon: <RiCheckLine /> };
    }
    if (item.confidence > 0.7) {
      return { label: t('diagnose.statusCritical', 'Critical'), color: '#ef4444', icon: <RiAlertLine /> };
    }
    if (item.confidence > 0.4) {
      return { label: t('diagnose.statusMonitoring', 'Monitoring'), color: '#f59e0b', icon: <RiAlertLine /> };
    }
    return { label: t('diagnose.statusLowRisk', 'Low Risk'), color: '#10b981', icon: <RiCheckLine /> };
  };

  const filterOptions = [
    { value: 'all', label: t('diagnose.filterAll', 'All') },
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
        <h3>
          <RiFileList3Line className="history-header-icon" /> {t('diagnose.historyTitle', 'Diagnosis History')}
        </h3>
        <span className="history-count">
          {t('diagnose.recordsCount', '{{count}} records', { count: history.length })}
        </span>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="search-bar">
          <span className="search-icon">
            <RiSearchLine />
          </span>
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
          <span className="no-history-icon">
            <RiFileList3Line />
          </span>
          <p>{t('diagnose.noDiagnoses', 'No diagnoses yet.')}</p>
          <p className="sub-text">{t('diagnose.startUpload', 'Upload a plant photo to get started!')}</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const status = getStatusBadge(item);
            const isSelected = selectedId === item._id;
            
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
                    <TbPlant2 className="thumbnail-placeholder" />
                  )}
                </div>
                
                <div className="history-content">
                  <div className="history-header-row">
                    <span className="history-disease">
                      {getLocalizedDynamicText(item.diseaseName, i18n.language)}
                    </span>
                    <span className="history-status" style={{ color: status.color, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {status.icon} {status.label}
                    </span>
                  </div>
                  
                  <div className="history-details">
                    {item.plantId?.name && (
                      <span className="history-plant" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <RiPlantLine /> {getLocalizedDynamicText(item.plantId.name, i18n.language)}
                      </span>
                    )}
                    <span className="history-confidence">
                      {t('diagnose.confidenceLabel', '{{percent}}% confidence', { percent: Math.round(item.confidence * 100) })}
                    </span>
                    <span className="history-date">
                      {new Date(item.createdAt).toLocaleDateString(getDateLocale())}
                    </span>
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