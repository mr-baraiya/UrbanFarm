import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeatherAdvice, getWeatherEmoji } from '../../utils/weatherHelpers';
import './GardenCard.css';

const GardenCard = ({ garden, viewMode, onEdit, onDelete, weather, weatherLoading }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const getTypeEmoji = (type) => {
    const map = {
      balcony: '🏠',
      rooftop: '🏢',
      terrace: '🏡',
      indoor: '🪴',
      backyard: '🌳',
      community: '👥',
    };
    return map[type] || '🌿';
  };

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
    const healthy = plants.filter(p => p.health === 'healthy' || !p.health);
    const warning = plants.filter(p => p.health === 'warning');
    const unhealthy = plants.filter(p => p.health === 'unhealthy');
    
    if (plants.length === 0) return { label: 'Empty', color: '#9a8a7a', emoji: '🌱' };
    if (unhealthy.length > 0) return { label: 'Needs Attention', color: '#e8b4b4', emoji: '⚠️' };
    if (warning.length > 0) return { label: 'Monitor', color: '#f0d5c0', emoji: '👀' };
    return { label: 'Thriving', color: '#a8d5ba', emoji: '🌟' };
  };

  const getSunlightEmoji = (sunlight) => {
    const map = {
      'full': '☀️ Full Sun (6-8 hrs)',
      'partial': '⛅ Partial Shade (3-6 hrs)',
      'shade': '🌥️ Shade (<3 hrs)',
    };
    return map[sunlight] || '☀️ Full Sun';
  };

  const getSoilEmoji = (soil) => {
    const map = {
      'potting_mix': '🪴 Potting Mix',
      'hydroponics': '💧 Hydroponics',
      'raised_bed': '📦 Raised Bed',
      'coco_peat': '🥥 Coco Peat',
      'loam': '🌱 Loam',
      'clay': '🏺 Clay',
      'sandy': '🏖️ Sandy',
    };
    return map[soil] || '🌱 Soil';
  };

  const getWaterStatus = (garden) => {
    // If no schedule, show default
    if (!garden.lastWatered) {
      return { label: 'Not watered yet', emoji: '💧', color: '#9a8a7a' };
    }
    
    const days = Math.floor((Date.now() - new Date(garden.lastWatered)) / (1000 * 60 * 60 * 24));
    if (days <= 0) return { label: 'Watered today', emoji: '💧', color: '#a8d5ba' };
    if (days === 1) return { label: 'Watered yesterday', emoji: '💧', color: '#a8d5ba' };
    if (days <= 3) return { label: `${days} days ago`, emoji: '💧', color: '#f0d5c0' };
    return { label: `Water ${days} days ago`, emoji: '⚠️', color: '#e8b4b4' };
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
            {getTypeEmoji(garden.type)} {getTypeLabel(garden.type)}
          </span>
          <span className="garden-health-badge" style={{ background: health.color + '33', color: health.color }}>
            {health.emoji} {health.label}
          </span>
        </div>
        <div className="garden-header-right">
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
            ⋮
          </button>
          {showMenu && (
            <div className="menu-dropdown">
              <button onClick={() => { onEdit(); setShowMenu(false); }}>
                ✏️ Edit Garden
              </button>
              <button onClick={() => { onDelete(); setShowMenu(false); }} className="danger">
                🗑️ Delete Garden
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
            <span className="detail-icon">📍</span>
            <span className="detail-text">{garden.location}</span>
          </div>
        )}
        <div className="detail-item">
          <span className="detail-icon">🌱</span>
          <span className="detail-text">{plantCount} plants</span>
        </div>
        {garden.size && (
          <div className="detail-item">
            <span className="detail-icon">📐</span>
            <span className="detail-text">{garden.size} m²</span>
          </div>
        )}
        <div className="detail-item">
          <span className="detail-icon">☀️</span>
          <span className="detail-text">{getSunlightEmoji(garden.sunlight || 'full')}</span>
        </div>
        {garden.soilType && (
          <div className="detail-item">
            <span className="detail-icon">🌍</span>
            <span className="detail-text">{getSoilEmoji(garden.soilType)}</span>
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
              <span className="weather-emoji">{getWeatherEmoji(weather)}</span>
              <span className="weather-temp">{Math.round(weather.main?.temp || 0)}°C</span>
              <span className="weather-condition">{weather.weather?.[0]?.description || ''}</span>
            </>
          ) : (
            <span className="weather-na">🌤️ No location set</span>
          )}
        </div>
        <div className="water-status" style={{ color: waterStatus.color }}>
          <span>{waterStatus.emoji}</span>
          <span>{waterStatus.label}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="garden-actions">
        <button className="btn-secondary-small" onClick={handleViewPlants}>
          🌱 View Plants
        </button>
        <button className="btn-primary-small" onClick={handleQuickAddPlant}>
          + Add Plant
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