import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiFileList3Line, 
  RiCheckLine, 
  RiCloseLine, 
  RiSkipForwardLine, 
  RiDropLine, 
  RiAlertLine,
  RiSunCloudyLine,
  RiTimeLine,
  RiLoader4Line
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './WateringHistory.css';

const WateringHistory = ({ 
  history,
  allHistory = [],
  onItemClick, 
  selectedId, 
  filterStatus, 
  onFilterChange,
  getPlantName,
  loading 
}) => {
  const { t, i18n } = useTranslation();

  const filterOptions = [
    { value: 'all', label: t('watering.filterAll', 'All') },
    { value: 'pending', label: t('watering.filterPending', 'Pending'), icon: <RiTimeLine /> },
    { value: 'completed', label: t('watering.filterCompleted', 'Completed'), icon: <RiCheckLine /> },
    { value: 'missed', label: t('watering.filterMissed', 'Missed'), icon: <RiCloseLine /> },
    { value: 'skipped', label: t('watering.filterSkipped', 'Skipped'), icon: <RiSkipForwardLine /> },
  ];

  if (loading) {
    return (
      <div className="watering-history loading-state-card">
        <div className="history-header">
          <h3>
            <RiFileList3Line className="history-header-icon" /> {t('watering.historyTitle', 'Watering History')}
          </h3>
        </div>
        <div className="history-loading-spinner-area">
          <RiLoader4Line className="spin history-spin-icon" />
          <span className="history-loading-msg">{t('watering.loadingSessions', 'Loading watering sessions...')}</span>
        </div>
        <div className="history-skeleton-list">
          <div className="history-skeleton-card shimmer"></div>
          <div className="history-skeleton-card shimmer"></div>
          <div className="history-skeleton-card shimmer"></div>
        </div>
      </div>
    );
  }

  // Calculate top KPI summary stats using full history (allHistory) so completion rate never fluctuates when filtering
  const statsSource = (allHistory && allHistory.length > 0) ? allHistory : history;
  const activeSchedules = statsSource.filter(h => h.isActive !== false);
  const targetSchedules = activeSchedules.length > 0 ? activeSchedules : statsSource;

  const totalEvents = targetSchedules.reduce((acc, h) => acc + (h.schedule?.length || 0), 0);
  const completedEvents = targetSchedules.reduce((acc, h) => acc + (h.schedule?.filter(e => e.completed)?.length || 0), 0);
  const skippedEvents = targetSchedules.reduce((acc, h) => acc + (h.schedule?.filter(e => e.skipped)?.length || 0), 0);
  const handledEvents = completedEvents + skippedEvents;
  const completionRate = totalEvents > 0 ? Math.round((handledEvents / totalEvents) * 100) : 0;

  return (
    <div className="watering-history">
      <div className="history-header">
        <h3>
          <RiFileList3Line className="history-header-icon" /> {t('watering.historyTitle', 'Watering History')}
        </h3>
        <span className="history-count">{t('watering.sessionsCount', { count: history.length, defaultValue: `${history.length} sessions` })}</span>
      </div>

      {/* Stats Summary */}
      <div className="history-stats">
        <div className="stat-item">
          <span className="stat-value">{completionRate}%</span>
          <span className="stat-label">{t('watering.completionRateUpper', 'COMPLETION RATE')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{totalEvents}</span>
          <span className="stat-label">{t('watering.totalEventsUpper', 'TOTAL EVENTS')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{handledEvents}</span>
          <span className="stat-label">{t('watering.handledUpper', 'HANDLED')}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="filter-pills">
          {filterOptions.map(option => (
            <button
              key={option.value}
              className={`filter-pill ${filterStatus === option.value ? 'active' : ''}`}
              onClick={() => onFilterChange(option.value)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="no-history">
          <span className="no-history-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <RiDropLine style={{ color: '#0ea5e9' }} />
          </span>
          <p>{t('watering.noHistoryTitle', 'No watering schedules yet.')}</p>
          <p className="sub-text">{t('watering.noHistorySubtitle', 'Generate a schedule for your plants!')}</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const isSelected = selectedId === item._id;
            const events = item.schedule || [];
            const handledCount = events.filter(e => e.completed || e.skipped).length;
            const completed = events.filter(e => e.completed && !e.skipped).length;
            const skipped = events.filter(e => e.skipped && !e.completed).length;
            const missed = events.filter(e => {
              const eventDate = new Date(e.date);
              return eventDate < new Date() && !e.completed && !e.skipped;
            }).length;
            
            let statusIcon = <RiTimeLine style={{ color: '#0ea5e9' }} />;
            let statusClass = 'pending';
            let statusText = t('watering.statusPending', 'Pending');

            if ((completed === events.length || handledCount === events.length) && events.length > 0) {
              statusIcon = <RiCheckLine style={{ color: '#10b981' }} />;
              statusClass = 'completed';
              statusText = t('watering.statusCompleted', 'Completed');
            } else if (handledCount > 0) {
              statusIcon = <RiTimeLine style={{ color: '#f59e0b' }} />;
              statusClass = 'inprogress';
              statusText = t('watering.statusInProgress', 'In Progress');
            } else if (skipped > 0 && missed === 0) {
              statusIcon = <RiSkipForwardLine style={{ color: '#64748b' }} />;
              statusClass = 'skipped';
              statusText = t('watering.statusSkipped', 'Skipped');
            } else if (missed > 0) {
              statusIcon = <RiAlertLine style={{ color: '#ef4444' }} />;
              statusClass = 'missed';
              statusText = t('watering.statusMissed', 'Missed');
            }

            // Determine display date: prefer latest completedAt timestamp or updatedAt date
            const completedWithTimestamp = events.filter(e => (e.completed || e.skipped) && e.completedAt);
            let displayDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString(i18n.language) : '';
            if (completedWithTimestamp.length > 0) {
              const latestTime = completedWithTimestamp.reduce((max, e) => {
                const t = new Date(e.completedAt).getTime();
                return t > max ? t : max;
              }, 0);
              if (latestTime > 0) {
                displayDate = new Date(latestTime).toLocaleDateString(i18n.language);
              }
            } else if (item.updatedAt) {
              displayDate = new Date(item.updatedAt).toLocaleDateString(i18n.language);
            }

            const rawPlantName = getPlantName(item.plantId);
            const localizedPlantName = getLocalizedDynamicText(rawPlantName, i18n.language);

            return (
              <div 
                key={item._id} 
                className={`history-item ${isSelected ? 'active' : ''}`}
                onClick={() => onItemClick(item)}
              >
                <div className="history-header-row">
                  <span className="history-plant-name">
                    <TbPlant2 className="plant-icon" /> {localizedPlantName}
                  </span>
                  <span className="history-date">
                    {displayDate}
                  </span>
                </div>
                
                <div className="history-details">
                  <span className={`history-status-badge ${statusClass}`}>
                    {statusIcon} {statusText}
                  </span>
                  <span className="history-adj-badge">
                    {t('watering.eventsCount', { handled: handledCount, total: events.length, defaultValue: `${handledCount}/${events.length} events` })}
                  </span>
                  {item.weatherAdjusted && (
                    <span className="history-adj-badge">
                      <RiSunCloudyLine /> {t('watering.weatherAdjustedTag', 'Weather adjusted')}
                    </span>
                  )}
                  {item.skipReason && (
                    <span className="history-adj-badge">{getLocalizedDynamicText(item.skipReason, i18n.language)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WateringHistory;