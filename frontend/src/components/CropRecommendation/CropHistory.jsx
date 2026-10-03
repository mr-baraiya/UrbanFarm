import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiFileList3Line, 
  RiSearchLine, 
  RiStarFill, 
  RiStarLine, 
  RiSeedlingLine,
  RiTempColdLine,
  RiCalendarEventLine
} from 'react-icons/ri';
import { TbLayersIntersect } from 'react-icons/tb';
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
        <h3>
          <RiFileList3Line className="history-header-icon" /> {t('crops.historyTitle', 'Recommendation History')}
        </h3>
        <span className="history-count">
          {t('crops.sessionsCount', '{{count}} sessions', { count: history.length })}
        </span>
      </div>

      <div className="history-filters">
        <div className="search-bar">
          <span className="search-icon">
            <RiSearchLine />
          </span>
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
              {option.value === 'saved' && <RiStarFill style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="no-history">
          <span className="no-history-icon">
            <RiSeedlingLine />
          </span>
          <p>{t('crops.noHistory', 'No recommendations yet.')}</p>
          <p className="sub-text">{t('crops.startPrompt', 'Get your first crop suggestions!')}</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const isSelected = selectedId === item._id;
            const cropNames = item.recommendations
              ?.map(r => getLocalizedDynamicText(r.cropName, i18n.language))
              .slice(0, 3)
              .join(', ');
            
            return (
              <div 
                key={item._id} 
                className={`history-item ${isSelected ? 'active' : ''} ${item.saved ? 'saved' : ''}`}
                onClick={() => onItemClick(item)}
              >
                <div className="history-header-row">
                  <span className="history-date">
                    {new Date(item.createdAt).toLocaleDateString(getDateLocale())}
                  </span>
                  <button 
                    className="save-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave(item._id);
                    }}
                    title={t('crops.saveBookmark', 'Save/Bookmark')}
                  >
                    {item.saved ? <RiStarFill style={{ color: '#f59e0b' }} /> : <RiStarLine />}
                  </button>
                </div>
                
                <div className="history-crops">
                  {cropNames || t('crops.noCrops', 'No crops')}
                  {item.recommendations?.length > 3 && (
                    ` ${t('crops.plusMore', '+{{count}} more', { count: item.recommendations.length - 3 })}`
                  )}
                </div>
                
                <div className="history-params">
                  <span className="param-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <TbLayersIntersect /> {getLocalizedDynamicText(item.inputData?.soilType, i18n.language) || 'N/A'}
                  </span>
                  <span className="param-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <RiTempColdLine /> {item.inputData?.temperature}°C
                  </span>
                  <span className="param-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <RiCalendarEventLine /> {getLocalizedDynamicText(item.inputData?.season, i18n.language) || 'N/A'}
                  </span>
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