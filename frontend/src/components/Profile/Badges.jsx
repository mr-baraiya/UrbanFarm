import React, { useState, useEffect } from 'react';
import { 
  RiAwardLine, 
  RiCheckLine, 
  RiLockLine,
  RiTrophyLine,
  RiSparklingFill
} from 'react-icons/ri';
import { getBadges } from '../../services/authService';
import BadgeEmblem from './BadgeEmblem';
import './Badges.css';

const Badges = ({ badges: propBadges, stats = {} }) => {
  const [badges, setBadges] = useState(propBadges || []);
  const [loading, setLoading] = useState(!propBadges);

  useEffect(() => {
    if (!propBadges) {
      loadBadges();
    } else {
      setBadges(propBadges);
    }
  }, [propBadges]);

  const loadBadges = async () => {
    try {
      const data = await getBadges();
      setBadges(data || []);
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStatus = (badgeId) => {
    const { 
      totalPlants = 0, 
      totalWateringEvents = 0, 
      totalDiagnoses = 0, 
      totalCommunityPosts = 0, 
      totalHarvests = 0, 
      totalGardens = 0 
    } = stats;

    const totalPts = (totalPlants * 10) + (totalCommunityPosts * 10) + (totalHarvests * 15);

    switch (badgeId) {
      case 'first_sprout':
        return totalPlants >= 1;
      case 'hydration_master':
        return totalWateringEvents >= 10;
      case 'plant_doctor':
        return totalDiagnoses >= 1;
      case 'first_harvest':
        return totalHarvests >= 1;
      case 'green_thumb':
        return totalPlants >= 5;
      case 'community_gardener':
        return totalCommunityPosts >= 5;
      case 'gardening_guru':
        return totalPts >= 100;
      case 'weather_watcher':
        return totalGardens >= 1;
      default:
        return false;
    }
  };

  const getBadgeProgress = (badgeId) => {
    const { 
      totalPlants = 0, 
      totalWateringEvents = 0, 
      totalDiagnoses = 0, 
      totalCommunityPosts = 0, 
      totalHarvests = 0, 
      totalGardens = 0 
    } = stats;

    const totalPts = (totalPlants * 10) + (totalCommunityPosts * 10) + (totalHarvests * 15);

    switch (badgeId) {
      case 'first_sprout':
        return { current: Math.min(totalPlants, 1), total: 1 };
      case 'hydration_master':
        return { current: Math.min(totalWateringEvents, 10), total: 10 };
      case 'plant_doctor':
        return { current: Math.min(totalDiagnoses, 1), total: 1 };
      case 'first_harvest':
        return { current: Math.min(totalHarvests, 1), total: 1 };
      case 'green_thumb':
        return { current: Math.min(totalPlants, 5), total: 5 };
      case 'community_gardener':
        return { current: Math.min(totalCommunityPosts, 5), total: 5 };
      case 'gardening_guru':
        return { current: Math.min(totalPts, 100), total: 100 };
      case 'weather_watcher':
        return { current: Math.min(totalGardens, 1), total: 1 };
      default:
        return null;
    }
  };

  const allBadges = [
    {
      id: 'first_sprout',
      tier: 'Bronze Milestone',
      themeColor: '#2d6a4f',
      name: 'First Sprout',
      description: 'Planted and registered your first seed or seedling into UrbanFarm.',
      requirement: 'Add your first plant to any garden',
    },
    {
      id: 'hydration_master',
      tier: 'Water Master',
      themeColor: '#0284c7',
      name: 'Hydration Master',
      description: 'Completed 10 regular watering sessions to keep plants thriving.',
      requirement: `Complete 10 watering sessions (${Math.min(stats.totalWateringEvents || 0, 10)}/10)`,
    },
    {
      id: 'plant_doctor',
      tier: 'Plant Health Specialist',
      themeColor: '#7c3aed',
      name: 'Plant Doctor',
      description: 'Diagnosed plant diseases and health conditions with the AI scanner.',
      requirement: 'Run your first disease diagnosis',
    },
    {
      id: 'first_harvest',
      tier: 'Harvest Glory',
      themeColor: '#ea580c',
      name: 'First Harvest',
      description: 'Reaped the fresh fruits of your urban garden labour.',
      requirement: 'Harvest your first crop',
    },
    {
      id: 'green_thumb',
      tier: 'Emerald Mastery',
      themeColor: '#059669',
      name: 'Green Thumb',
      description: 'Cultivated 5 or more active healthy urban plants simultaneously.',
      requirement: `Grow 5+ plants (${Math.min(stats.totalPlants || 0, 5)}/5)`,
    },
    {
      id: 'community_gardener',
      tier: 'Community Champion',
      themeColor: '#4f46e5',
      name: 'Community Gardener',
      description: 'Shared knowledge, tips, and achievements with other city growers.',
      requirement: `Share 5 community posts (${Math.min(stats.totalCommunityPosts || 0, 5)}/5)`,
    },
    {
      id: 'gardening_guru',
      tier: 'Master Seal',
      themeColor: '#d97706',
      name: 'Gardening Guru',
      description: 'Attained supreme gardening knowledge and master experience.',
      requirement: `Earn 100+ gardening points (${Math.min((stats.totalPlants || 0) * 10 + (stats.totalCommunityPosts || 0) * 10 + (stats.totalHarvests || 0) * 15, 100)}/100)`,
    },
    {
      id: 'weather_watcher',
      tier: 'Microclimate Expert',
      themeColor: '#0891b2',
      name: 'Weather Watcher',
      description: 'Utilised hyper-local weather alerts and irrigation intelligence.',
      requirement: `Register garden and check weather (${Math.min(stats.totalGardens || 0, 1)}/1)`,
    },
  ];

  if (loading) {
    return <div className="badges-loading">Loading badges...</div>;
  }

  const unlockedCount = allBadges.filter(b => getBadgeStatus(b.id)).length;

  return (
    <div className="badges-section">
      <div className="badges-section-header">
        <div>
          <h3>
            <RiAwardLine className="badges-header-icon" /> Badges & Achievements
          </h3>
          <p className="badges-subtitle">
            Earn distinctive achievement medallions as you grow and maintain your urban sanctuary!
          </p>
        </div>
        <div className="badges-counter-pill">
          <RiSparklingFill /> {unlockedCount} / {allBadges.length} Unlocked
        </div>
      </div>
      
      <div className="badges-grid">
        {allBadges.map((badge) => {
          const isUnlocked = getBadgeStatus(badge.id);
          const progress = getBadgeProgress(badge.id);
          
          return (
            <div 
              key={badge.id} 
              className={`badge-item ${isUnlocked ? 'unlocked' : 'locked'}`}
              style={{
                '--badge-color': badge.themeColor,
              }}
            >
              <div className="badge-emblem-wrap">
                <BadgeEmblem id={badge.id} isUnlocked={isUnlocked} size={74} />
                {isUnlocked ? (
                  <span className="badge-status-pill unlocked" title="Unlocked Achievement">
                    <RiCheckLine />
                  </span>
                ) : (
                  <span className="badge-status-pill locked" title="Locked Achievement">
                    <RiLockLine />
                  </span>
                )}
              </div>
              <div className="badge-card-details">
                <div className="badge-header-row">
                  <h4 className="badge-card-title">{badge.name}</h4>
                  <span className={`badge-tier-tag ${isUnlocked ? 'unlocked' : ''}`}>
                    {badge.tier}
                  </span>
                </div>
                <p className="badge-description">{badge.description}</p>
                <p className="badge-requirement">
                  <span className="req-label">Goal:</span> {badge.requirement}
                </p>
                {progress && !isUnlocked && (
                  <div className="badge-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${(progress.current / progress.total) * 100}%`,
                          background: `linear-gradient(90deg, ${badge.themeColor}, #10b981)`
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      Progress: {progress.current}/{progress.total}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allBadges.length === 0 && (
        <div className="badges-empty">
          <div className="badges-empty-icon">
            <RiTrophyLine />
          </div>
          <p>Start earning badges by caring for your garden!</p>
          <small>Water plants, run health diagnoses, and share with the community to unlock achievements.</small>
        </div>
      )}
    </div>
  );
};

export default Badges;