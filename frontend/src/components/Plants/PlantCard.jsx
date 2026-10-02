import React, { useState } from 'react';
import { 
  RiEyeLine, 
  RiDropLine, 
  RiMicroscopeLine, 
  RiShoppingBasketLine, 
  RiQrCodeLine, 
  RiEditLine, 
  RiDeleteBinLine, 
  RiMapPin2Line, 
  RiCalendarEventLine, 
  RiSunLine, 
  RiSunCloudyLine,
  RiMoreFill
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { getStatusColor, getHealthStatus, getGrowthStageLabel, getGrowthProgress, getPlantImage } from '../../utils/helpers';
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
  onQuickDiagnose,
  onShowQR,
  onLogHarvest,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imgError, setImgError] = useState(false);

  const health = getHealthStatus(plant.health);
  const growthProgress = getGrowthProgress(plant.status);
  const growthLabel = getGrowthStageLabel(plant.status);
  const statusColor = getStatusColor(plant.status);
  const plantImgUrl = getPlantImage(plant);

  // Calculate days since planting
  const getDaysSincePlanting = () => {
    if (!plant.plantingDate) return null;
    const days = Math.floor((Date.now() - new Date(plant.plantingDate)) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysOld = getDaysSincePlanting();

  return (
    <div className={`plant-card ${isSelected ? 'selected' : ''}`}>
      {/* Image container with menu & select overlays */}
      <div className="plant-image-container">
        {selectMode && (
          <div className="plant-select">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(plant._id)}
            />
          </div>
        )}

        <div className="plant-menu">
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)} aria-label="Menu">
            <RiMoreFill />
          </button>
          {showMenu && (
            <div className="menu-dropdown">
              {onLogHarvest && (
                <button onClick={() => { onLogHarvest(plant); setShowMenu(false); }}>
                  <RiShoppingBasketLine /> Log Harvest
                </button>
              )}
              {onShowQR && (
                <button onClick={() => { onShowQR(plant); setShowMenu(false); }}>
                  <RiQrCodeLine /> QR Code
                </button>
              )}
              <button onClick={() => { onEdit(); setShowMenu(false); }}>
                <RiEditLine /> Edit
              </button>
              <button onClick={() => { onDelete(); setShowMenu(false); }} className="danger">
                <RiDeleteBinLine /> Delete
              </button>
            </div>
          )}
        </div>

        <div className="plant-image" style={{ background: statusColor + '22' }}>
          {!imgError && plantImgUrl ? (
            <img 
              src={plantImgUrl} 
              alt={plant.name}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <TbPlant2 className="plant-svg-placeholder" />
          )}
        </div>
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
          <span className={`health-dot ${plant.health || 'healthy'}`} /> {health.label}
        </span>
        <span className="status-badge" style={{ background: statusColor + '22', color: statusColor }}>
          {growthLabel}
        </span>
        {daysOld !== null && (
          <span className="age-badge">
            <RiCalendarEventLine className="badge-icon-sm" /> {daysOld} days
          </span>
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
          <span className="plant-garden">
            <RiMapPin2Line className="meta-icon" /> {plant.gardenId.name}
          </span>
        )}
        <span className="plant-water">
          <RiDropLine className="meta-icon water" /> every {plant.waterFrequency || 3}d
        </span>
        {plant.sunlight && (
          <span className="plant-sunlight" title={`Sunlight: ${plant.sunlight}`}>
            {plant.sunlight === 'full' ? (
              <RiSunLine className="meta-icon sun" />
            ) : (
              <RiSunCloudyLine className="meta-icon shade" />
            )}
          </span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="plant-actions">
        <button className="action-btn view" onClick={onViewDetails} title="View Details">
          <RiEyeLine />
        </button>
        <button className="action-btn water" onClick={onQuickWater} title="Quick Water">
          <RiDropLine />
        </button>
        <button className="action-btn diagnose" onClick={onQuickDiagnose} title="Quick Diagnose">
          <RiMicroscopeLine />
        </button>
        {onLogHarvest && (
          <button className="action-btn harvest" onClick={() => onLogHarvest(plant)} title="Record Harvest">
            <RiShoppingBasketLine />
          </button>
        )}
        {onShowQR && (
          <button className="action-btn qr" onClick={() => onShowQR(plant)} title="QR Code">
            <RiQrCodeLine />
          </button>
        )}
      </div>
    </div>
  );
};

export default PlantCard;