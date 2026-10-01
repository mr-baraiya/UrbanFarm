import React from 'react';
import './GardenHealth.css';

const GardenHealth = ({ score }) => {
  const getHealthLabel = (score) => {
    if (score >= 80) return { label: 'Excellent 🌟', color: '#a8d5ba' };
    if (score >= 60) return { label: 'Good 🌿', color: '#f0d5c0' };
    if (score >= 40) return { label: 'Fair 🌱', color: '#f0c0a0' };
    return { label: 'Needs Attention ⚠️', color: '#e8b4b4' };
  };

  const health = getHealthLabel(score);

  return (
    <div className="garden-health">
      <div className="health-header">
        <span className="health-label">🌿 Garden Health</span>
        <span className="health-status" style={{ color: health.color }}>
          {health.label}
        </span>
      </div>
      <div className="health-bar">
        <div 
          className="health-fill" 
          style={{ 
            width: `${score}%`, 
            background: `linear-gradient(90deg, ${health.color}dd, ${health.color})` 
          }}
        />
      </div>
      <div className="health-score">{score}%</div>
    </div>
  );
};

export default GardenHealth;