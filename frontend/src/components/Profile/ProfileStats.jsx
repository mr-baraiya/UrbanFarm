import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiLeafLine, 
  RiMicroscopeLine, 
  RiTeamLine, 
  RiDropLine 
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import './ProfileStats.css';

/**
 * Animated number counter component for smooth dynamic count-up transitions
 */
const AnimatedCount = ({ value = 0, duration = 650 }) => {
  const [displayCount, setDisplayCount] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const startVal = prevValueRef.current;
    const targetVal = Number(value) || 0;
    prevValueRef.current = targetVal;

    if (startVal === targetVal) {
      setDisplayCount(targetVal);
      return;
    }

    let startTimestamp = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Smooth easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (targetVal - startVal) * ease);
      setDisplayCount(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayCount(targetVal);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return <span className="stat-pill-value">{displayCount}</span>;
};

const ProfileStats = ({ stats = {} }) => {
  const { t } = useTranslation();

  const statItems = [
    { 
      key: 'totalGardens', 
      icon: <RiLeafLine />, 
      theme: 'theme-green',
      label: t('profile.statsRow.activeGardens', 'Active Gardens'), 
      value: stats.totalGardens || 0 
    },
    { 
      key: 'totalPlants', 
      icon: <TbPlant2 />, 
      theme: 'theme-emerald',
      label: t('profile.statsRow.plantsGrown', 'Plants Grown'), 
      value: stats.totalPlants || 0 
    },
    { 
      key: 'totalDiagnoses', 
      icon: <RiMicroscopeLine />, 
      theme: 'theme-purple',
      label: t('profile.statsRow.diagnosesRun', 'Diagnoses Run'), 
      value: stats.totalDiagnoses || 0 
    },
    { 
      key: 'totalCommunityPosts', 
      icon: <RiTeamLine />, 
      theme: 'theme-blue',
      label: t('profile.statsRow.communityPosts', 'Community Posts'), 
      value: stats.totalCommunityPosts || 0 
    },
    { 
      key: 'totalWateringEvents', 
      icon: <RiDropLine />, 
      theme: 'theme-cyan',
      label: t('profile.statsRow.wateringEvents', 'Watering Events'), 
      value: stats.totalWateringEvents || 0 
    },
  ];

  return (
    <div className="profile-stats-row">
      {statItems.map((stat) => (
        <div key={stat.key} className={`stat-pill-card ${stat.theme}`}>
          <div className="stat-icon-wrapper">
            <div className="stat-icon-circle">
              {stat.icon}
            </div>
          </div>
          <div className="stat-pill-content">
            <AnimatedCount value={stat.value} />
            <span className="stat-pill-label">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;