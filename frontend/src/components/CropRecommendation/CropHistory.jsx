import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  History, 
  Search, 
  Sprout, 
  Sun, 
  Calendar, 
  ArrowRight, 
  Bookmark, 
  BookmarkCheck, 
  Inbox, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './CropHistory.css';

const ITEMS_PER_PAGE = 5;

const CropHistory = ({ 
  history = [], 
  onItemClick, 
  selectedId, 
  onSave,
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange
}) => {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever filter, search term, or history length changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchTerm, history.length]);

  const filterOptions = [
    { value: 'all', label: t('crops.filterAll', 'All') },
    { value: 'saved', label: t('crops.filterSaved', 'Saved') },
  ];

  const getDateLocale = () => {
    if (i18n.language === 'gu') return 'gu-IN';
    if (i18n.language === 'hi') return 'hi-IN';
    return 'en-US';
  };

  const getLocalizedSoil = (soil) => {
    if (!soil) return t('crops.soilType', 'Soil');
    const s = soil.toLowerCase().replace(/\s+/g, '');
    if (s === 'loam') return t('crops.soilLoam', 'Loam');
    if (s === 'sandy') return t('crops.soilSandy', 'Sandy');
    if (s === 'clay') return t('crops.soilClay', 'Clay');
    if (s === 'silty') return t('crops.soilSilty', 'Silty');
    if (s === 'peaty') return t('crops.soilPeaty', 'Peaty');
    if (s === 'chalky') return t('crops.soilChalky', 'Chalky');
    if (s === 'sandyloam') return t('crops.soilSandyLoam', 'Sandy Loam');
    if (s === 'pottingmix') return t('crops.soilPottingMix', 'Potting Mix');
    return soil;
  };

  const getLocalizedSeason = (season) => {
    if (!season) return t('crops.season', 'Season');
    const s = season.toLowerCase();
    if (s === 'spring') return t('crops.seasonSpring', 'Spring');
    if (s === 'summer') return t('crops.seasonSummer', 'Summer');
    if (s === 'fall' || s === 'autumn') return t('crops.seasonFall', 'Fall');
    if (s === 'winter') return t('crops.seasonWinter', 'Winter');
    return season;
  };

  // Pagination calculations
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, history.length);
  const paginatedHistory = history.slice(startIndex, endIndex);

  // Generate clean sliding page window
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (safeCurrentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages];
  };

  return (
    <div className="crop-history">
      <div className="history-header">
        <div className="history-title-wrap">
          <History size={18} className="history-header-icon" />
          <h3>{t('crops.historyTitle', 'Recommendation History')}</h3>
        </div>
        <span className="history-count">
          {t('crops.sessionsCount', '{{count}} sessions', { count: history.length })}
        </span>
      </div>

      <div className="history-filters">
        <div className="search-bar">
          <Search size={15} className="search-icon" />
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
          <div className="no-history-icon-box">
            <Inbox size={28} className="no-history-icon" />
          </div>
          <p className="no-history-title">{t('crops.noHistory', 'No recommendation history yet.')}</p>
          <span className="no-history-sub">{t('crops.startPrompt', 'Get your first crop suggestions!')}</span>
        </div>
      ) : (
        <div className="history-list">
          {paginatedHistory.map((item) => {
            const isSelected = selectedId === item._id;
            const crops = item.recommendations || [];
            
            return (
              <div 
                key={item._id} 
                className={`history-card ${isSelected ? 'active' : ''} ${item.saved ? 'is-saved' : ''}`}
                onClick={() => onItemClick(item)}
              >
                <div className="history-card-header">
                  <div className="history-meta-tags">
                    <span className="history-soil-tag">
                      <Sprout size={12} className="meta-icon" />
                      {getLocalizedSoil(item.inputData?.soilType)}
                    </span>
                    <span className="history-season-tag">
                      <Sun size={12} className="meta-icon" />
                      {getLocalizedSeason(item.inputData?.season)}
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
                      title={item.saved ? t('crops.saved', 'Saved') : t('crops.save', 'Save')}
                    >
                      {item.saved ? (
                        <>
                          <BookmarkCheck size={13} className="save-icon" />
                          <span>{t('crops.saved', 'Saved')}</span>
                        </>
                      ) : (
                        <>
                          <Bookmark size={13} className="save-icon" />
                          <span>{t('crops.save', 'Save')}</span>
                        </>
                      )}
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
                    <Calendar size={12} className="date-icon" />
                    {new Date(item.createdAt).toLocaleDateString(getDateLocale(), {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="history-view-link">
                    <span>{t('crops.viewDetails', 'View Details')}</span>
                    <ArrowRight size={13} className="arrow-icon" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {history.length > ITEMS_PER_PAGE && (
        <div className="history-pagination">
          <span className="pagination-info">
            {startIndex + 1}–{endIndex} {t('common.of', 'of')} {history.length}
          </span>
          <div className="pagination-controls">
            <button 
              type="button"
              className="btn-page-nav" 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={safeCurrentPage === 1}
              title={t('common.previous', 'Previous')}
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {getVisiblePages().map((pageNum, idx) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>
              ) : (
                <button
                  key={pageNum}
                  type="button"
                  className={`btn-page-num ${safeCurrentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              )
            ))}

            <button 
              type="button"
              className="btn-page-nav" 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
              title={t('common.next', 'Next')}
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropHistory;