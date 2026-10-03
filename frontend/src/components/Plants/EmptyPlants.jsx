import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RiPlantLine, RiAddLine, RiMapPin2Line, RiLightbulbLine } from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './EmptyPlants.css';

const EmptyPlants = ({ onCreateClick, gardenName }) => {
  const { t, i18n } = useTranslation();
  const localizedGarden = gardenName ? getLocalizedDynamicText(gardenName, i18n.language) : '';

  return (
    <div className="empty-plants">
      <div className="empty-content">
        <div className="empty-illustration">
          <div className="empty-icon-wrap">
            <RiPlantLine className="main-empty-svg" />
          </div>
          <div className="growing-plants">
            <TbPlant2 className="pot-svg" />
            <TbPlant2 className="pot-svg center" />
            <TbPlant2 className="pot-svg" />
          </div>
        </div>
        <h2>
          {t('plants.emptyTitle', 'No plants found')}
          {localizedGarden ? ` (${localizedGarden})` : ''}
        </h2>
        <p>
          {localizedGarden 
            ? `${localizedGarden} - ${t('plants.emptyDesc', "Add your first plant to start tracking growth and irrigation schedules.")}`
            : t('plants.emptyDesc', "Add your first plant to start tracking growth and irrigation schedules.")}
        </p>
        <div className="empty-actions">
          <button className="btn-primary" onClick={onCreateClick}>
            <RiAddLine /> {t('plants.addPlant', 'Add Plant')}
          </button>
          <Link to="/app/gardens" className="btn-secondary">
            <RiMapPin2Line /> {t('navigation.gardens', 'Gardens')}
          </Link>
        </div>
        <div className="empty-tips">
          <h4>
            <RiLightbulbLine className="tip-icon" /> {t('dashboard.quickTips', 'Quick tips for starting your urban garden:')}
          </h4>
          <ul>
            <li>Start with easy-to-grow plants like herbs (basil, mint)</li>
            <li>Match plants to your available sunlight</li>
            <li>Use good quality potting soil with drainage</li>
            <li>Water consistently but don't overwater</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmptyPlants;