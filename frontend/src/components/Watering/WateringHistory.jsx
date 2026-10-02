import React from 'react';
import { 
  RiFileList3Line, 
  RiCheckLine, 
  RiCloseLine, 
  RiSkipForwardLine, 
  RiDropLine, 
  RiAlertLine,
  RiSunCloudyLine,
  RiTimeLine
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import './WateringHistory.css';

const WateringHistory = ({ 
  history, 
  onItemClick, 
  selectedId, 
  filterStatus, 
  onFilterChange,
  getPlantName 
}) => {
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed', icon: <RiCheckLine /> },
    { value: 'missed', label: 'Missed', icon: <RiCloseLine /> },
    { value: 'skipped', label: 'Skipped', icon: <RiSkipForwardLine /> },
  ];

  // Calculate stats
  const totalEvents = history.reduce((acc, h) => acc + (h.schedule?.length || 0), 0);
  const completedEvents = history.reduce((acc, h) => acc + (h.schedule?.filter(e => e.completed)?.length || 0), 0);
  const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

  return (
    <div className="watering-history">
      <div className="history-header">
        <h3>
          <RiFileList3Line className="history-header-icon" /> Watering History
        </h3>
        <span className="history-count">{history.length} sessions</span>
      </div>

      {/* Stats Summary */}
      <div className="history-stats">
        <div className="stat-item">
          <span className="stat-value">{completionRate}%</span>
          <span className="stat-label">Completion Rate</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{totalEvents}</span>
          <span className="stat-label">Total Events</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{completedEvents}</span>
          <span className="stat-label">Completed</span>
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
          <p>No watering schedules yet.</p>
          <p className="sub-text">Generate a schedule for your plants!</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const isSelected = selectedId === item._id;
            const events = item.schedule || [];
            const completed = events.filter(e => e.completed).length;
            const missed = events.filter(e => {
              const eventDate = new Date(e.date);
              return eventDate < new Date() && !e.completed;
            }).length;
            const skipped = events.filter(e => e.skipped).length;
            
            let statusIcon = <RiCheckLine style={{ color: '#10b981' }} />;
            let statusLabel = 'Completed';
            if (missed > 0) {
              statusIcon = <RiAlertLine style={{ color: '#ef4444' }} />;
              statusLabel = 'Missed';
            } else if (skipped > 0) {
              statusIcon = <RiSkipForwardLine style={{ color: '#64748b' }} />;
              statusLabel = 'Skipped';
            } else if (completed === events.length && events.length > 0) {
              statusIcon = <RiCheckLine style={{ color: '#10b981' }} />;
              statusLabel = 'All Done';
            } else if (completed > 0) {
              statusIcon = <RiTimeLine style={{ color: '#f59e0b' }} />;
              statusLabel = 'In Progress';
            }

            return (
              <div 
                key={item._id} 
                className={`history-item ${isSelected ? 'active' : ''}`}
                onClick={() => onItemClick(item)}
              >
                <div className="history-header-row">
                  <span className="history-plant-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <TbPlant2 /> {getPlantName(item.plantId)}
                  </span>
                  <span className="history-date">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="history-details">
                  <span className={`history-status ${statusLabel.toLowerCase().replace(' ', '')}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {statusIcon} {statusLabel}
                  </span>
                  <span className="history-events">
                    {completed}/{events.length} events
                  </span>
                  {item.weatherAdjusted && (
                    <span className="history-weather" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <RiSunCloudyLine /> Weather adjusted
                    </span>
                  )}
                  {item.skipReason && (
                    <span className="history-skip">{item.skipReason}</span>
                  )}
                </div>

                {/* Progress bar */}
                {events.length > 0 && (
                  <div className="history-progress">
                    <div 
                      className="history-progress-fill" 
                      style={{ 
                        width: `${(completed / events.length) * 100}%`,
                        background: missed > 0 ? '#e8b4b4' : completed === events.length ? '#a8d5ba' : '#f0d5c0'
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WateringHistory;