import React, { useState } from 'react';
import { getStatusColor, getHealthIndicator, getHealthStatus, getGrowthStageLabel, getGrowthProgress } from '../../utils/helpers';
import './PlantCard.css';

const PlantCard = ({ 
  plant, 
  selectMode, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  onQuickWater,
  onQuickDiagnose 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const health = getHealthStatus(plant.health);
  const growthProgress = getGrowthProgress(plant.status);
  const growthLabel = getGrowthStageLabel(plant.status);
  const statusColor = getStatusColor(plant.status);

  // Calculate days since planting
  const getDaysSincePlanting = () => {
    if (!plant.plantingDate) return null;
    const days = Math.floor((Date.now() - new Date(plant.plantingDate)) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysOld = getDaysSincePlanting();

  return (
    <div className={`plant-card ${isSelected ? 'selected' : ''}`}>
      {/* Selection checkbox */}
      {selectMode && (
        <div className="plant-select">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(plant._id)}
          />
        </div>
      )}

      {/* Menu */}
      <div className="plant-menu">
        <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
          ⋮
        </button>
        {showMenu && (
          <div className="menu-dropdown">
            <button onClick={() => { onEdit(); setShowMenu(false); }}>
              ✏️ Edit
            </button>
            <button onClick={() => { onDelete(); setShowMenu(false); }} className="danger">
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* Image */}
      <div className="plant-image" style={{ background: statusColor + '44' }}>
        {plant.imageUrl ? (
          <img 
            src={plant.imageUrl} 
            alt={plant.name}
            onLoad={() => setImageLoaded(true)}
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />
        ) : null}
        {(!plant.imageUrl || !imageLoaded) && (
          <span className="plant-emoji-large">🌱</span>
        )}
      </div>

      {/* Name & Details */}
      <div className="plant-info">
        <h4 className="plant-name">{plant.name}</h4>
        {plant.variety && (
          <span className="plant-variety">{plant.variety}</span>
        )}
        {plant.scientificName && (
          <span className="plant-scientific">{plant.scientificName}</span>
        )}
      </div>

      {/* Health & Status */}
      <div className="plant-badges">
        <span className="health-badge" style={{ color: health.color }}>
          {health.icon} {health.label}
        </span>
        <span className="status-badge" style={{ background: statusColor + '33', color: statusColor }}>
          {growthLabel}
        </span>
        {daysOld !== null && (
          <span className="age-badge">📅 {daysOld} days</span>
        )}
      </div>

      {/* Growth Progress */}
      <div className="growth-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${growthProgress}%`,
              background: `linear-gradient(90deg, ${statusColor}88, ${statusColor})`
            }}
          />
        </div>
        <span className="progress-label">{growthProgress}% complete</span>
      </div>

      {/* Garden & Water info */}
      <div className="plant-meta">
        {plant.gardenId?.name && (
          <span className="plant-garden">📍 {plant.gardenId.name}</span>
        )}
        <span className="plant-water">💧 every {plant.waterFrequency || 3} days</span>
        {plant.sunlight && (
          <span className="plant-sunlight">
            {plant.sunlight === 'full' ? '☀️' : plant.sunlight === 'partial' ? '⛅' : '🌥️'}
          </span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="plant-actions">
        <button className="action-btn view" onClick={onViewDetails} title="View Details">
          👁️
        </button>
        <button className="action-btn water" onClick={onQuickWater} title="Quick Water">
          💧
        </button>
        <button className="action-btn diagnose" onClick={onQuickDiagnose} title="Quick Diagnose">
          🔬
        </button>
      </div>
    </div>
  );
};

export default PlantCard;