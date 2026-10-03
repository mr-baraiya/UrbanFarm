import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiLeafLine, 
  RiMicroscopeLine, 
  RiTeamLine, 
  RiDropLine 
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import './ProfileStats.css';

const ProfileStats = ({ stats = {} }) => {
  const { t } = useTranslation();

  const statItems = [
    { 
      key: 'totalGardens', 
      icon: <RiLeafLine />, 
      bgClass: 'bg-green',
      label: t('profile.statsRow.activeGardens', 'ACTIVE GARDENS'), 
      value: stats.totalGardens || 0 
    },
    { 
      key: 'totalPlants', 
      icon: <TbPlant2 />, 
      bgClass: 'bg-emerald',
      label: t('profile.statsRow.plantsGrown', 'PLANTS GROWN'), 
      value: stats.totalPlants || 0 
    },
    { 
      key: 'totalDiagnoses', 
      icon: <RiMicroscopeLine />, 
      bgClass: 'bg-purple',
      label: t('profile.statsRow.diagnosesRun', 'DIAGNOSES RUN'), 
      value: stats.totalDiagnoses || 0 
    },
    { 
      key: 'totalCommunityPosts', 
      icon: <RiTeamLine />, 
      bgClass: 'bg-blue',
      label: t('profile.statsRow.communityPosts', 'COMMUNITY POSTS'), 
      value: stats.totalCommunityPosts || 0 
    },
    { 
      key: 'totalWateringEvents', 
      icon: <RiDropLine />, 
      bgClass: 'bg-cyan',
      label: t('profile.statsRow.wateringEvents', 'WATERING EVENTS'), 
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