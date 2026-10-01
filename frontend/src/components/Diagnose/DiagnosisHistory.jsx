import React from 'react';
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
  const getStatusBadge = (item) => {
    if (item.isResolved) {
      return { label: 'Resolved', color: '#a8d5ba', icon: '✅' };
    }
    if (item.confidence > 0.7) {
      return { label: 'Critical', color: '#e8b4b4', icon: '🔴' };
    }
    if (item.confidence > 0.4) {
      return { label: 'Monitoring', color: '#f0d5c0', icon: '🟡' };
    }
    return { label: 'Low Risk', color: '#a8d5ba', icon: '🟢' };
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'critical', label: '🔴 Critical' },
    { value: 'monitoring', label: '🟡 Monitoring' },
    { value: 'resolved', label: '✅ Resolved' },
  ];

  return (
    <div className="diagnosis-history">
      <div className="history-header">
        <h3>📋 Diagnosis History</h3>
        <span className="history-count">{history.length} diagnoses</span>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by disease or plant..."
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
          <span className="no-history-icon">📋</span>
          <p>No diagnoses yet.</p>
          <p className="sub-text">Upload a plant photo to get started!</p>
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
                    <span className="thumbnail-placeholder">🌿</span>
                  )}
                </div>
                
                <div className="history-content">
                  <div className="history-header-row">
                    <span className="history-disease">{item.diseaseName}</span>
                    <span className="history-status" style={{ color: status.color }}>
                      {status.icon} {status.label}
                    </span>
                  </div>
                  
                  <div className="history-details">
                    {item.plantId?.name && (
                      <span className="history-plant">🌱 {item.plantId.name}</span>
                    )}
                    <span className="history-confidence">
                      {Math.round(item.confidence * 100)}% confidence
                    </span>
                    <span className="history-date">
                      {new Date(item.createdAt).toLocaleDateString()}
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