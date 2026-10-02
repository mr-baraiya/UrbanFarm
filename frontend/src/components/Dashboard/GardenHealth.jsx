import React from 'react';
import { 
  RiHeartPulseLine, 
  RiSparklingLine, 
  RiCheckLine, 
  RiTimeLine, 
  RiAlertLine 
} from 'react-icons/ri';
import './GardenHealth.css';

const GardenHealth = ({ score }) => {
  const getHealthInfo = (score) => {
    if (score >= 80) return { label: 'Excellent', icon: <RiSparklingLine className="health-icon excellent" />, color: '#2d6a4f' };
    if (score >= 60) return { label: 'Good', icon: <RiCheckLine className="health-icon good" />, color: '#52b788' };
    if (score >= 40) return { label: 'Fair', icon: <RiTimeLine className="health-icon fair" />, color: '#f59e0b' };
    return { label: 'Needs Attention', icon: <RiAlertLine className="health-icon warning" />, color: '#ef4444' };
  };

  const health = getHealthInfo(score);

  return (
    <div className="garden-health">
      <div className="health-header">
        <span className="health-label">
          <RiHeartPulseLine className="health-header-icon" /> Garden Health
        </span>
        <span className="health-status" style={{ color: health.color }}>
          {health.icon} {health.label}
        </span>
      </div>
      <div className="health-bar">
        <div 
          className="health-fill" 
          style={{ 
            width: `${score}%`, 
            background: `linear-gradient(90deg, ${health.color}99, ${health.color})` 
          }}
        />
      </div>
      <div className="health-score">{score}%</div>
    </div>
  );
};

export default GardenHealth;