import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  RiMore2Fill
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { getStatusColor, getGrowthProgress, getPlantImage } from '../../utils/helpers';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
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
  const { t, i18n } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [imgError, setImgError] = useState(false);

  const getHealthDisplay = (h) => {
    if (h === 'healthy') return { label: t('plants.healthy', 'Healthy'), color: '#10b981' };
    if (h === 'warning') return { label: t('plants.needsWater', 'Needs Attention'), color: '#f59e0b' };
    if (h === 'unhealthy') return { label: t('plants.atRisk', 'At Risk'), color: '#ef4444' };
    return { label: t('plants.healthy', 'Healthy'), color: '#10b981' };
  };

  const getGrowthStageDisplay = (s) => {
    if (s === 'seedling') return t('plants.seedling', 'Seedling');
    if (s === 'growing') return t('plants.statusGrowing', 'Growing');
    if (s === 'mature') return t('plants.statusMature', 'Mature');
    if (s === 'harvested') return t('plants.harvested', 'Harvesting');
    if (s === 'dead') return t('plants.statusDead', 'Ended');
    return t('plants.statusGrowing', 'Growing');
  };

  const health = getHealthDisplay(plant.health);
  const growthProgress = getGrowthProgress(plant.status);
  const growthLabel = getGrowthStageDisplay(plant.status);
  const statusColor = getStatusColor(plant.status);
  const plantImgUrl = getPlantImage(plant);

  // Calculate days since planting
  const getDaysSincePlanting = () => {
    if (!plant.plantingDate) return null;
    const days = Math.floor((Date.now() - new Date(plant.plantingDate)) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysOld = getDaysSincePlanting();

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('.plant-menu')) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  return (
    <div className={`plant-card ${isSelected ? 'selected' : ''} ${showMenu ? 'menu-open' : ''}`}>
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
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)} aria-label={t('plants.plantName', 'Plant Options')} title={t('plants.plantName', 'Plant Options')}>
            <RiMore2Fill />
          </button>
          {showMenu && (
            <div className="menu-dropdown">
              {onLogHarvest && (
                <button onClick={() => { onLogHarvest(plant); setShowMenu(false); }}>
                  <RiShoppingBasketLine /> {t('plants.logHarvest', 'Log Harvest')}
                </button>
              )}
              {onShowQR && (
                <button onClick={() => { onShowQR(plant); setShowMenu(false); }}>
                  <RiQrCodeLine /> {t('plants.qrCode', 'QR Code')}
                </button>
              )}
              <button onClick={() => { onEdit(); setShowMenu(false); }}>
                <RiEditLine /> {t('common.edit', 'Edit')}
              </button>
              <button onClick={() => { onDelete(); setShowMenu(false); }} className="danger">
                <RiDeleteBinLine /> {t('common.delete', 'Delete')}
              </button>
            </div>
          )}
        </div>

        <div className="plant-image" style={{ background: statusColor + '22' }}>
          {!imgError && plantImgUrl ? (
            <img 
              src={plantImgUrl} 
              alt={getLocalizedDynamicText(plant.name, i18n.language)}
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
        <h4 className="plant-name">{getLocalizedDynamicText(plant.name, i18n.language)}</h4>
        {plant.variety && (
          <span className="plant-variety">{getLocalizedDynamicText(plant.variety, i18n.language)}</span>
        )}
        {plant.scientificName && (
          <span className="plant-scientific">{getLocalizedDynamicText(plant.scientificName, i18n.language)}</span>
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
            <RiCalendarEventLine className="badge-icon-sm" /> {t('plants.daysCount', '{{count}} days', { count: daysOld })}
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
        <span className="progress-label">
          {t('plants.percentComplete', '{{percent}}% complete', { percent: growthProgress })}
        </span>
      </div>

      {/* Garden & Water info */}
      <div className="plant-meta">
        {plant.gardenId?.name && (
          <span className="plant-garden">
            <RiMapPin2Line className="meta-icon" /> {getLocalizedDynamicText(plant.gardenId.name, i18n.language)}
          </span>
        )}
        <span className="plant-water">
          <RiDropLine className="meta-icon water" /> {t('plants.everyDays', 'every {{days}}d', { days: plant.waterFrequency !== undefined && plant.waterFrequency !== null ? plant.waterFrequency : 3 })}
        </span>
        {plant.sunlight && (
          <span className="plant-sunlight" title={`${t('crops.selectSunlight', 'Sunlight')}: ${plant.sunlight}`}>
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
        <button className="action-btn view" onClick={onViewDetails} title={t('common.viewDetails', 'View Details')}>
          <RiEyeLine />
        </button>
        <button className="action-btn water" onClick={onQuickWater} title={t('plants.quickWater', 'Quick Water')}>
          <RiDropLine />
        </button>
        <button className="action-btn diagnose" onClick={onQuickDiagnose} title={t('plants.quickDiagnose', 'Quick Diagnose')}>
          <RiMicroscopeLine />
        </button>
        {onLogHarvest && (
          <button className="action-btn harvest" onClick={() => onLogHarvest(plant)} title={t('plants.recordHarvest', 'Record Harvest')}>
            <RiShoppingBasketLine />
          </button>
        )}
        {onShowQR && (
          <button className="action-btn qr" onClick={() => onShowQR(plant)} title={t('plants.qrCode', 'QR Code')}>
            <RiQrCodeLine />
          </button>
        )}
      </div>
    </div>
  );
};

export default PlantCard;