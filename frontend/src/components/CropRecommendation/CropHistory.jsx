import React from 'react';
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
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'saved', label: '⭐ Saved' },
  ];

  return (
    <div className="crop-history">
      <div className="history-header">
        <h3>📋 Recommendation History</h3>
        <span className="history-count">{history.length} sessions</span>
      </div>

      <div className="history-filters">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by crop, soil, season..."
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
          <span className="no-history-icon">🌾</span>
          <p>No recommendations yet.</p>
          <p className="sub-text">Get your first crop suggestions!</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const isSelected = selectedId === item._id;
            const cropNames = item.recommendations?.map(r => r.cropName).slice(0, 3).join(', ');
            
            return (
              <div 
                key={item._id} 
                className={`history-item ${isSelected ? 'active' : ''} ${item.saved ? 'saved' : ''}`}
                onClick={() => onItemClick(item)}
              >
                <div className="history-header-row">
                  <span className="history-date">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <button 
                    className="save-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave(item._id);
                    }}
                    title="Save/Bookmark"
                  >
                    {item.saved ? '⭐' : '☆'}
                  </button>
                </div>
                
                <div className="history-crops">
                  {cropNames || 'No crops'}
                  {item.recommendations?.length > 3 && ` +${item.recommendations.length - 3} more`}
                </div>
                
                <div className="history-params">
                  <span className="param-chip">🌍 {item.inputData?.soilType || 'N/A'}</span>
                  <span className="param-chip">🌡️ {item.inputData?.temperature}°C</span>
                  <span className="param-chip">📅 {item.inputData?.season || 'N/A'}</span>
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