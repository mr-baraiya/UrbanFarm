import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiPlantLine, RiAddLine, RiDashboardLine, RiLightbulbLine } from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import './EmptyGardens.css';

const EmptyGardens = ({ onCreateClick }) => {
  const { t } = useTranslation();

  return (
    <div className="empty-gardens">
      <div className="empty-content">
        <div className="empty-illustration">
          <div className="empty-icon-wrap">
            <RiPlantLine className="main-empty-svg" />
          </div>
          <div className="plant-pots">
            <TbPlant2 className="pot-svg" />
            <TbPlant2 className="pot-svg center" />
            <TbPlant2 className="pot-svg" />
          </div>
        </div>
        <h2>{t('gardens.emptyTitle')}</h2>
        <p>{t('gardens.emptyDesc')}</p>
        <div className="empty-actions">
          <button className="btn-primary" onClick={onCreateClick}>
            <RiAddLine /> {t('gardens.addGarden')}
          </button>
          <button className="btn-secondary" onClick={() => window.location.href = '/app/dashboard'}>
            <RiDashboardLine /> {t('navigation.dashboard')}
          </button>
        </div>
        <div className="empty-tips">
          <h4>
            <RiLightbulbLine className="tip-icon" /> {t('featuresPage.builtinTitle')}:
          </h4>
          <ul>
            <li>{t('landing.whyItem1')}</li>
            <li>{t('landing.whyItem2')}</li>
            <li>{t('landing.whyItem3')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmptyGardens;