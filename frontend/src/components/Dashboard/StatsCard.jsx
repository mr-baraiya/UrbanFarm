import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="stats-card" style={{ borderColor: color }}>
      <div className="stats-icon" style={{ background: color + '33' }}>
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