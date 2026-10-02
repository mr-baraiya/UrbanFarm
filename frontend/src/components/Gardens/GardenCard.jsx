import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RiPlantLine, 
  RiMapPin2Line, 
  RiSunLine, 
  RiSunCloudyLine, 
  RiDropLine, 
  RiEditLine, 
  RiDeleteBinLine, 
  RiLayoutMasonryLine, 
  RiMoreFill,
  RiAddLine,
  RiAlertLine,
  RiCheckLine,
  RiSparklingLine
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { getWeatherEmoji } from '../../utils/weatherHelpers';
import './GardenCard.css';

const GardenCard = ({ garden, viewMode, onEdit, onDelete, onOpenLayout, weather, weatherLoading }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const getTypeLabel = (type) => {
    const map = {
      balcony: 'Balcony',
      rooftop: 'Rooftop',
      terrace: 'Terrace',
      indoor: 'Indoor',
      backyard: 'Backyard',
      community: 'Community',
    };
    return map[type] || 'Garden';
  };

  const getHealthStatus = (garden) => {
    const plants = garden.plants || [];
    const unhealthy = plants.filter(p => p.health === 'unhealthy');
    const warning = plants.filter(p => p.health === 'warning');
    
    if (plants.length === 0) return { label: 'Empty', color: '#6b7280', icon: <TbPlant2 /> };
    if (unhealthy.length > 0) return { label: 'Needs Attention', color: '#ef4444', icon: <RiAlertLine /> };
    if (warning.length > 0) return { label: 'Monitor', color: '#f59e0b', icon: <RiAlertLine /> };
    return { label: 'Thriving', color: '#10b981', icon: <RiSparklingLine /> };
  };

  const getSunlightLabel = (sunlight) => {
    const map = {
      'full': 'Full Sun (6-8h)',
      'partial': 'Partial Shade (3-6h)',
      'shade': 'Shade (<3h)',
    };
    return map[sunlight] || 'Full Sun';
  };

  const getSoilLabel = (soil) => {
    const map = {
      'potting_mix': 'Potting Mix',
      'hydroponics': 'Hydroponics',
      'raised_bed': 'Raised Bed',
      'coco_peat': 'Coco Peat',
      'loam': 'Loam',
      'clay': 'Clay',
      'sandy': 'Sandy',
    };
    return map[soil] || 'Soil';
  };

  const getWaterStatus = (garden) => {
    if (!garden.lastWatered) {
      return { label: 'Not watered yet', color: '#6b7280' };
    }
    
    const days = Math.floor((Date.now() - new Date(garden.lastWatered)) / (1000 * 60 * 60 * 24));
    if (days <= 0) return { label: 'Watered today', color: '#10b981' };
    if (days === 1) return { label: 'Watered yesterday', color: '#10b981' };
    if (days <= 3) return { label: `${days} days ago`, color: '#f59e0b' };
    return { label: `Water ${days} days ago`, color: '#ef4444' };
  };

  const health = getHealthStatus(garden);
  const waterStatus = getWaterStatus(garden);
  const plantCount = garden.plants?.length || 0;

  const handleViewPlants = () => {
    navigate(`/app/plants?garden=${garden._id}`);
  };

  const handleQuickAddPlant = () => {
    navigate(`/app/plants?garden=${garden._id}&action=add`);
  };

  return (
    <div className={`garden-card ${viewMode}`}>
      {/* Card Header */}
      <div className="garden-card-header">
        <div className="garden-header-left">
          <span className="garden-type-badge">
            <RiPlantLine className="type-icon" /> {getTypeLabel(garden.type)}
          </span>
          <span className="garden-health-badge" style={{ background: health.color + '22', color: health.color }}>
            {health.icon} {health.label}
          </span>
        </div>
        <div className="garden-header-right">
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)} aria-label="Options">
            <RiMoreFill />
          </button>
          {showMenu && (
            <div className="menu-dropdown">
              {onOpenLayout && (
                <button onClick={() => { onOpenLayout(garden); setShowMenu(false); }}>
                  <RiLayoutMasonryLine /> Space & Layout
                </button>
              )}
              <button onClick={() => { onEdit(); setShowMenu(false); }}>
                <RiEditLine /> Edit Garden
              </button>
              <button onClick={() => { onDelete(); setShowMenu(false); }} className="danger">
                <RiDeleteBinLine /> Delete Garden
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Garden Name */}
      <h3 className="garden-name">{garden.name}</h3>

      {/* Garden Details Grid */}
      <div className="garden-details-grid">
        {garden.location && (
          <div className="detail-item">
            <span className="detail-icon"><RiMapPin2Line /></span>
            <span className="detail-text">{garden.location}</span>
          </div>
        )}
        <div className="detail-item">
          <span className="detail-icon"><TbPlant2 /></span>
          <span className="detail-text">{plantCount} plants</span>
        </div>
        {garden.size && (
          <div className="detail-item">
            <span className="detail-icon"><RiLayoutMasonryLine /></span>
            <span className="detail-text">{garden.size} m²</span>
          </div>
        )}
        <div className="detail-item">
          <span className="detail-icon">
            {garden.sunlight === 'full' ? <RiSunLine className="sun" /> : <RiSunCloudyLine className="shade" />}
          </span>
          <span className="detail-text">{getSunlightLabel(garden.sunlight || 'full')}</span>
        </div>
        {garden.soilType && (
          <div className="detail-item">
            <span className="detail-icon"><RiPlantLine /></span>
            <span className="detail-text">{getSoilLabel(garden.soilType)}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {garden.description && (
        <p className="garden-description">{garden.description}</p>
      )}

      {/* Weather & Water Status */}
      <div className="garden-weather-status">
        <div className="weather-mini">
          {weatherLoading ? (
            <span className="weather-loading">Loading weather...</span>
          ) : weather ? (
            <>
              <span className="weather-temp">{Math.round(weather.main?.temp || 0)}°C</span>
              <span className="weather-condition">{weather.weather?.[0]?.description || ''}</span>
            </>
          ) : (
            <span className="weather-na">No weather data</span>
          )}
        </div>
        <div className="water-status" style={{ color: waterStatus.color }}>
          <RiDropLine className="water-icon" />
          <span>{waterStatus.label}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="garden-actions">
        <button className="btn-secondary-small" onClick={handleViewPlants}>
          <TbPlant2 /> View Plants
        </button>
        {onOpenLayout && (
          <button className="btn-secondary-small" onClick={() => onOpenLayout(garden)}>
            <RiLayoutMasonryLine /> Layout
          </button>
        )}
        <button className="btn-primary-small" onClick={handleQuickAddPlant}>
          <RiAddLine /> Add Plant
        </button>
      </div>

      {/* Footer - Created Date */}
      <div className="garden-footer">
        <span className="garden-created">
          Created {new Date(garden.createdAt).toLocaleDateString()}
        </span>
        {garden.updatedAt && garden.updatedAt !== garden.createdAt && (
          <span className="garden-updated">
            Updated {new Date(garden.updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default GardenCard;