import React from 'react';
import './ProfileStats.css';

const ProfileStats = ({ stats }) => {
  const statItems = [
    { 
      key: 'totalGardens', 
      icon: '🌿', 
      label: 'Active Gardens', 
      value: stats.totalGardens || 0 
    },
    { 
      key: 'totalPlants', 
      icon: '🌱', 
      label: 'Plants Grown', 
      value: stats.totalPlants || 0 
    },
    { 
      key: 'totalDiagnoses', 
      icon: '🔬', 
      label: 'Diagnoses Run', 
      value: stats.totalDiagnoses || 0 
    },
    { 
      key: 'totalCommunityPosts', 
      icon: '👥', 
      label: 'Community Posts', 
      value: stats.totalCommunityPosts || 0 
    },
    { 
      key: 'totalWateringEvents', 
      icon: '💧', 
      label: 'Watering Events', 
      value: stats.totalWateringEvents || 0 
    },
    { 
      key: 'totalHarvests', 
      icon: '🍅', 
      label: 'Harvests', 
      value: stats.totalHarvests || 0 
    },
  ];

  return (
    <div className="profile-stats">
      <h4>📊 Gardening Stats</h4>
      <div className="stats-grid">
        {statItems.map((stat) => (
          <div key={stat.key} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileStats;