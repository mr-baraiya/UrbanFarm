import React from 'react';
import { 
  RiFileList3Line, 
  RiSearchLine, 
  RiCheckLine, 
  RiAlertLine,
  RiTimeLine,
  RiPlantLine
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
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
    const isHealthy = item.isHealthy || item.diseaseName?.toLowerCase().includes('healthy');
    if (isHealthy) {
      return { label: 'Healthy', color: '#2d6a4f', icon: <RiCheckLine /> };
    }
    if (item.isResolved) {
      return { label: 'Resolved', color: '#10b981', icon: <RiCheckLine /> };
    }
    if (item.confidence > 0.7) {
      return { label: 'Critical', color: '#ef4444', icon: <RiAlertLine /> };
    }
    if (item.confidence > 0.4) {
      return { label: 'Monitoring', color: '#f59e0b', icon: <RiAlertLine /> };
    }
    return { label: 'Low Risk', color: '#10b981', icon: <RiCheckLine /> };
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'healthy', label: 'Healthy' },
    { value: 'critical', label: 'Critical' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="diagnosis-history">
      <div className="history-header">
        <h3>
          <RiFileList3Line className="history-header-icon" /> Diagnosis History
        </h3>
        <span className="history-count">{history.length} records</span>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="search-bar">
          <span className="search-icon">
            <RiSearchLine />
          </span>
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
          <span className="no-history-icon">
            <RiFileList3Line />
          </span>
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
                    <TbPlant2 className="thumbnail-placeholder" />
                  )}
                </div>
                
                <div className="history-content">
                  <div className="history-header-row">
                    <span className="history-disease">{item.diseaseName}</span>
                    <span className="history-status" style={{ color: status.color, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {status.icon} {status.label}
                    </span>
                  </div>
                  
                  <div className="history-details">
                    {item.plantId?.name && (
                      <span className="history-plant" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <RiPlantLine /> {item.plantId.name}
                      </span>
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