import React from 'react';
import { 
  RiLeafLine, 
  RiMicroscopeLine, 
  RiTeamLine, 
  RiDropLine, 
  RiShoppingBasketLine, 
  RiBarChart2Line 
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import './ProfileStats.css';

const ProfileStats = ({ stats }) => {
  const statItems = [
    { 
      key: 'totalGardens', 
      icon: <RiLeafLine />, 
      colorClass: 'gardens',
      label: 'Active Gardens', 
      value: stats.totalGardens || 0 
    },
    { 
      key: 'totalPlants', 
      icon: <TbPlant2 />, 
      colorClass: 'plants',
      label: 'Plants Grown', 
      value: stats.totalPlants || 0 
    },
    { 
      key: 'totalDiagnoses', 
      icon: <RiMicroscopeLine />, 
      colorClass: 'diagnoses',
      label: 'Diagnoses Run', 
      value: stats.totalDiagnoses || 0 
    },
    { 
      key: 'totalCommunityPosts', 
      icon: <RiTeamLine />, 
      colorClass: 'community',
      label: 'Community Posts', 
      value: stats.totalCommunityPosts || 0 
    },
    { 
      key: 'totalWateringEvents', 
      icon: <RiDropLine />, 
      colorClass: 'watering',
      label: 'Watering Events', 
      value: stats.totalWateringEvents || 0 
    },
    { 
      key: 'totalHarvests', 
      icon: <RiShoppingBasketLine />, 
      colorClass: 'harvests',
      label: 'Harvests', 
      value: stats.totalHarvests || 0 
    },
  ];

  return (
    <div className="profile-stats">
      <h4>
        <RiBarChart2Line className="stats-header-icon" /> Gardening Stats
      </h4>
      <div className="stats-grid">
        {statItems.map((stat) => (
          <div key={stat.key} className={`stat-card ${stat.colorClass}`}>
            <div className={`stat-icon-wrapper ${stat.colorClass}`}>
              {stat.icon}
            </div>
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