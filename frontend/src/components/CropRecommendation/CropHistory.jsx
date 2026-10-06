import React from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './CropHistory.css';

const CropHistory = ({ 
  history, 
  onItemClick, 
  selectedId, 
  onSave,
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange
}) => {
  const { t, i18n } = useTranslation();

  const filterOptions = [
    { value: 'all', label: t('crops.filterAll', 'All') },
    { value: 'saved', label: t('crops.filterSaved', 'Saved') },
  ];

  const getDateLocale = () => {
    if (i18n.language === 'gu') return 'gu-IN';
    if (i18n.language === 'hi') return 'hi-IN';
    return 'en-US';
  };

  return (
    <div className="crop-history">
      <div className="history-header">
        <h3>{t('crops.historyTitle', 'Recommendation History')}</h3>
        <span className="history-count">
          {t('crops.sessionsCount', '{{count}} sessions', { count: history.length })}
        </span>
      </div>

      <div className="history-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder={t('crops.searchPlaceholder', 'Search by crop, soil, season...')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {filterOptions.map(option => (
            <button
              key={option.value}
              className={`filter-pill ${filterType === option.value ? 'active' : ''}`}
              onClick={() => onFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="no-history">
          <span className="no-history-tag">No Sessions</span>
          <p>{t('crops.noHistory', 'No recommendation history yet.')}</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const isSelected = selectedId === item._id;
            const crops = item.recommendations || [];
            
            return (
              <div 
                key={item._id} 
                className={`history-card ${isSelected ? 'active' : ''}`}
                onClick={() => onItemClick(item)}
              >
                <div className="history-card-header">
                  <div className="history-meta-tags">
                    <span className="history-soil-tag">
                      {item.inputData?.soilType || 'Soil'}
                    </span>
                    <span className="history-season-tag">
                      {item.inputData?.season || 'Season'}
                    </span>
                  </div>
                  {onSave && (
                    <button 
                      type="button" 
                      className={`history-save-btn ${item.saved ? 'saved' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSave(item._id);
                      }}
                      title={item.saved ? 'Saved' : 'Save'}
                    >
                      {item.saved ? '★ Saved' : '☆ Save'}
                    </button>
                  )}
                </div>

                <div className="history-crops-chips">
                  {crops.slice(0, 3).map((c, idx) => (
                    <span key={idx} className="crop-mini-chip">
                      {getLocalizedDynamicText(c.cropName, i18n.language)}
                    </span>
                  ))}
                  {crops.length > 3 && (
                    <span className="crop-more-chip">+{crops.length - 3}</span>
                  )}
                </div>

                <div className="history-footer-row">
                  <span className="history-date">
                    {new Date(item.createdAt).toLocaleDateString(getDateLocale())}
                  </span>
                  <span className="history-view-link">View Details →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CropHistory;