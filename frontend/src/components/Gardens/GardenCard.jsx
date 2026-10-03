import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { formatDate } from '../../utils/helpers';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './GardenCard.css';

const GardenCard = ({ garden, viewMode, onEdit, onDelete, onOpenLayout, weather, weatherLoading }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const getTypeLabel = (type) => {
    switch (type) {
      case 'balcony': return t('gardens.balcony');
      case 'rooftop': return t('gardens.rooftop');
      case 'terrace': return t('gardens.terrace');
      case 'indoor': return t('gardens.indoor');
      case 'backyard': return t('gardens.backyard');
      case 'community': return t('gardens.community');
      default: return type || t('navigation.gardens');
    }
  };

  const getHealthStatus = (garden) => {
    const plants = garden.plants || [];
    const unhealthy = plants.filter(p => p.health === 'unhealthy');
    const warning = plants.filter(p => p.health === 'warning');
    
    if (plants.length === 0) return { label: t('gardens.empty'), color: '#6b7280', icon: <TbPlant2 /> };
    if (unhealthy.length > 0) return { label: t('dashboard.healthNeedsAttention'), color: '#ef4444', icon: <RiAlertLine /> };
    if (warning.length > 0) return { label: t('gardens.monitor'), color: '#f59e0b', icon: <RiAlertLine /> };
    return { label: t('gardens.thriving'), color: '#10b981', icon: <RiSparklingLine /> };
  };

  const getSunlightLabel = (sunlight) => {
    switch (sunlight) {
      case 'full': return t('gardens.fullSun');
      case 'partial': return t('gardens.partialSun');
      case 'shade': return t('gardens.shade');
      default: return t('gardens.fullSun');
    }
  };

  const getSoilLabel = (soil) => {
    switch (soil) {
      case 'potting_mix': return t('gardens.pottingMix');
      case 'hydroponics': return t('gardens.hydroponics');
      case 'raised_bed': return t('gardens.raisedBed');
      case 'coco_peat': return t('gardens.cocoPeat');
      case 'loam': return t('gardens.loam');
      case 'clay': return t('gardens.clay');
      case 'sandy': return t('gardens.sandy');
      default: return soil || t('common.soil');
    }
  };

  const getWaterStatus = (garden) => {
    if (!garden.lastWatered) {
      return { label: t('gardens.notWateredYet'), color: '#6b7280' };
    }
    
    const days = Math.floor((Date.now() - new Date(garden.lastWatered)) / (1000 * 60 * 60 * 24));
    if (days <= 0) return { label: t('gardens.wateredToday'), color: '#10b981' };
    if (days === 1) return { label: t('gardens.wateredYesterday'), color: '#10b981' };
    if (days <= 3) return { label: `${days} ${t('gardens.daysAgo')}`, color: '#f59e0b' };
    return { label: t('gardens.waterDaysAgo', { days }), color: '#ef4444' };
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
                  <RiLayoutMasonryLine /> {t('gardens.spaceLayout')}
                </button>
              )}
              <button onClick={() => { onEdit(); setShowMenu(false); }}>
                <RiEditLine /> {t('gardens.editGarden')}
              </button>
              <button onClick={() => { onDelete(); setShowMenu(false); }} className="danger">
                <RiDeleteBinLine /> {t('gardens.deleteGarden')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Garden Name */}
      <h3 className="garden-name">{getLocalizedDynamicText(garden.name, i18n.language)}</h3>

      {/* Garden Details Grid */}
      <div className="garden-details-grid">
        {garden.location && (
          <div className="detail-item">
            <span className="detail-icon"><RiMapPin2Line /></span>
            <span className="detail-text">{getLocalizedDynamicText(garden.location, i18n.language)}</span>
          </div>
        )}
        <div className="detail-item">
          <span className="detail-icon"><TbPlant2 /></span>
          <span className="detail-text">{plantCount} {t('dashboard.plantsCount')}</span>
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
        <p className="garden-description">{getLocalizedDynamicText(garden.description, i18n.language)}</p>
      )}

      {/* Weather & Water Status */}
      <div className="garden-weather-status">
        <div className="weather-mini">
          {weatherLoading ? (
            <span className="weather-loading">{t('gardens.loadingWeather')}</span>
          ) : weather ? (
            <>
              <span className="weather-temp">{Math.round(weather.main?.temp || 0)}°C</span>
              <span className="weather-condition">{weather.weather?.[0]?.description || ''}</span>
            </>
          ) : (
            <span className="weather-na">{t('gardens.noWeatherData')}</span>
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
          <TbPlant2 /> {t('gardens.viewPlants')}
        </button>
        {onOpenLayout && (
          <button className="btn-secondary-small" onClick={() => onOpenLayout(garden)}>
            <RiLayoutMasonryLine /> {t('gardens.layoutView')}
          </button>
        )}
        <button className="btn-primary-small" onClick={handleQuickAddPlant}>
          <RiAddLine /> {t('dashboard.addPlant')}
        </button>
      </div>

      {/* Footer - Created Date */}
      <div className="garden-footer">
        <span className="garden-created">
          {t('gardens.createdOn')} {formatDate(garden.createdAt, i18n.language)}
        </span>
        {garden.updatedAt && garden.updatedAt !== garden.createdAt && (
          <span className="garden-updated">
            {t('gardens.updatedOn')} {formatDate(garden.updatedAt, i18n.language)}
          </span>
        )}
      </div>
    </div>
  );
};

export default GardenCard;