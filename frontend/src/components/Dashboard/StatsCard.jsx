import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="stats-card">
      <div 
        className="stats-icon" 
        style={{ color: color || 'var(--sage, #6b9080)' }}
      >
        {icon}
      </div>
      <div className="stats-info">
        <span className="stats-value">{value}</span>
        <span className="stats-label">{title}</span>
      </div>
    </div>
  );
};

export default StatsCard;