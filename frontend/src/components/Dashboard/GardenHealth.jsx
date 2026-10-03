import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiHeartPulseLine, 
  RiSparklingLine, 
  RiCheckLine, 
  RiTimeLine, 
  RiAlertLine 
} from 'react-icons/ri';
import './GardenHealth.css';

const GardenHealth = ({ score }) => {
  const { t } = useTranslation();

  const getHealthInfo = (score) => {
    if (score >= 80) return { label: t('dashboard.healthExcellent'), icon: <RiSparklingLine className="health-icon excellent" />, color: '#2d6a4f' };
    if (score >= 60) return { label: t('dashboard.healthGood'), icon: <RiCheckLine className="health-icon good" />, color: '#52b788' };
    if (score >= 40) return { label: t('dashboard.healthFair'), icon: <RiTimeLine className="health-icon fair" />, color: '#f59e0b' };
    return { label: t('dashboard.healthNeedsAttention'), icon: <RiAlertLine className="health-icon warning" />, color: '#ef4444' };
  };

  const health = getHealthInfo(score);

  return (
    <div className="garden-health">
      <div className="health-header">
        <span className="health-label">
          <RiHeartPulseLine className="health-header-icon" /> {t('dashboard.gardenHealth')}
        </span>
        <div className="health-header-right">
          <span className="health-score-pill">{score}%</span>
          <span className="health-status" style={{ color: health.color, background: `${health.color}15` }}>
            {health.icon} {health.label}
          </span>
        </div>
      </div>
      <div className="health-bar-container">
        <div className="health-bar">
          <div 
            className="health-fill" 
            style={{ 
              width: `${score}%`, 
              background: `linear-gradient(90deg, ${health.color}aa, ${health.color})` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GardenHealth;