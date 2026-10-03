import React from 'react';
import { 
  RiLeafLine, 
  RiMicroscopeLine, 
  RiTeamLine, 
  RiDropLine 
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import './ProfileStats.css';

const ProfileStats = ({ stats = {} }) => {
  const statItems = [
    { 
      key: 'totalGardens', 
      icon: <RiLeafLine />, 
      bgClass: 'bg-green',
      label: 'ACTIVE GARDENS', 
      value: stats.totalGardens || 0 
    },
    { 
      key: 'totalPlants', 
      icon: <TbPlant2 />, 
      bgClass: 'bg-emerald',
      label: 'PLANTS GROWN', 
      value: stats.totalPlants || 0 
    },
    { 
      key: 'totalDiagnoses', 
      icon: <RiMicroscopeLine />, 
      bgClass: 'bg-purple',
      label: 'DIAGNOSES RUN', 
      value: stats.totalDiagnoses || 0 
    },
    { 
      key: 'totalCommunityPosts', 
      icon: <RiTeamLine />, 
      bgClass: 'bg-blue',
      label: 'COMMUNITY POSTS', 
      value: stats.totalCommunityPosts || 0 
    },
    { 
      key: 'totalWateringEvents', 
      icon: <RiDropLine />, 
      bgClass: 'bg-cyan',
      label: 'WATERING EVENTS', 
      value: stats.totalWateringEvents || 0 
    },
  ];

  return (
    <div className="profile-stats-row">
      {statItems.map((stat) => (
        <div key={stat.key} className="stat-pill-card">
          <div className={`stat-icon-circle ${stat.bgClass}`}>
            {stat.icon}
          </div>
          <span className="stat-pill-value">{stat.value}</span>
          <span className="stat-pill-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;