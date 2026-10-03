import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RiPlantLine, RiAddLine } from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { getPlantImage } from '../../utils/helpers';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './PlantGallery.css';

const PlantGallery = ({ plants }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const getStatusLabel = (rawStatus) => {
    if (!rawStatus) return '';
    const cleanStatus = rawStatus.toString().toLowerCase().replace('plants.status', '').replace('status', '').trim();
    switch (cleanStatus) {
      case 'seedling': return t('plants.statusSeedling') || t('plants.seedling') || 'Seedling';
      case 'growing': return t('plants.statusGrowing') || 'Growing';
      case 'mature': return t('plants.statusMature') || 'Mature';
      case 'harvested': return t('plants.harvested') || 'Harvested';
      case 'dead': return t('plants.statusDead') || 'Dead';
      default: return rawStatus;
    }
  };

  if (!plants || plants.length === 0) {
    return (
      <div className="plant-gallery">
        <h3>
          <TbPlant2 className="gallery-header-icon" /> {t('dashboard.plantGallery')}
        </h3>
        <div className="empty-gallery">
          <div className="empty-icon-wrap">
            <TbPlant2 />
          </div>
          <p>{t('dashboard.noPlantsYet')}</p>
          <button className="btn-primary" onClick={() => navigate('/app/plants')}>
            <RiAddLine /> {t('dashboard.addPlant')}
          </button>
        </div>
      </div>
    );
  }

  // Get status color
  const getStatusColor = (rawStatus) => {
    const cleanStatus = (rawStatus || '').toString().toLowerCase().replace('plants.status', '').replace('status', '').trim();
    const map = {
      seedling: 'rgba(240, 232, 220, 0.8)',
      growing: 'rgba(168, 213, 186, 0.6)',
      mature: 'rgba(240, 213, 192, 0.7)',
      harvested: 'rgba(212, 184, 160, 0.7)',
      dead: 'rgba(201, 176, 160, 0.5)',
    };
    return map[cleanStatus] || 'rgba(184, 169, 201, 0.5)';
  };

  return (
    <div className="plant-gallery">
      <div className="gallery-header">
        <h3>
          <TbPlant2 className="gallery-header-icon" /> {t('dashboard.plantGallery')}
        </h3>
        <span className="plant-count">{plants.length} {t('dashboard.plantsCount')}</span>
      </div>
      <div className="gallery-scroll">
        {plants.slice(0, 6).map((plant) => (
          <div 
            key={plant._id} 
            className="gallery-item"
            onClick={() => navigate(`/app/plants?plant=${plant._id}`)}
          >
            <div className="plant-thumbnail" style={{ background: getStatusColor(plant.status) }}>
              {getPlantImage(plant) ? (
                <img src={getPlantImage(plant)} alt={plant.name} loading="lazy" />
              ) : (
                <TbPlant2 className="plant-svg-thumb" />
              )}
            </div>
            <div className="plant-info">
              <span className="plant-name">{getLocalizedDynamicText(plant.name, i18n.language)}</span>
              <div className="plant-meta">
                <span className="plant-status">{getStatusLabel(plant.status)}</span>
                <span 
                  className={`plant-health-dot ${plant.health || 'healthy'}`} 
                  title={`${t('common.status')}: ${plant.health || 'healthy'}`} 
                />
              </div>
            </div>
          </div>
        ))}
        {plants.length > 6 && (
          <div className="gallery-more" onClick={() => navigate('/app/plants')}>
            <span>+{plants.length - 6} {t('common.more') || 'more'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantGallery;