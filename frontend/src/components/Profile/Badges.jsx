import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      tier: t('profile.badges.first_sprout.tier', 'Bronze Milestone'),
      themeColor: '#2d6a4f',
      name: t('profile.badges.first_sprout.name', 'First Sprout'),
      description: t('profile.badges.first_sprout.description', 'Planted and registered your first seed or seedling into UrbanFarm.'),
      requirement: t('profile.badges.first_sprout.requirement', 'Add your first plant to any garden'),
    },
    {
      id: 'hydration_master',
      tier: t('profile.badges.hydration_master.tier', 'Water Master'),
      themeColor: '#0284c7',
      name: t('profile.badges.hydration_master.name', 'Hydration Master'),
      description: t('profile.badges.hydration_master.description', 'Completed 10 regular watering sessions to keep plants thriving.'),
      requirement: t('profile.badges.hydration_master.requirement', 'Complete 10 watering sessions ({{current}}/10)', { current: Math.min(stats.totalWateringEvents || 0, 10) }),
    },
    {
      id: 'plant_doctor',
      tier: t('profile.badges.plant_doctor.tier', 'Plant Health Specialist'),
      themeColor: '#7c3aed',
      name: t('profile.badges.plant_doctor.name', 'Plant Doctor'),
      description: t('profile.badges.plant_doctor.description', 'Diagnosed plant diseases and health conditions with the AI scanner.'),
      requirement: t('profile.badges.plant_doctor.requirement', 'Run your first disease diagnosis'),
    },
    {
      id: 'first_harvest',
      tier: t('profile.badges.first_harvest.tier', 'Harvest Glory'),
      themeColor: '#ea580c',
      name: t('profile.badges.first_harvest.name', 'First Harvest'),
      description: t('profile.badges.first_harvest.description', 'Reaped the fresh fruits of your urban garden labour.'),
      requirement: t('profile.badges.first_harvest.requirement', 'Harvest your first crop'),
    },
    {
      id: 'green_thumb',
      tier: t('profile.badges.green_thumb.tier', 'Emerald Mastery'),
      themeColor: '#059669',
      name: t('profile.badges.green_thumb.name', 'Green Thumb'),
      description: t('profile.badges.green_thumb.description', 'Cultivated 5 or more active healthy urban plants simultaneously.'),
      requirement: t('profile.badges.green_thumb.requirement', 'Grow 5+ plants ({{current}}/5)', { current: Math.min(stats.totalPlants || 0, 5) }),
    },
    {
      id: 'community_gardener',
      tier: t('profile.badges.community_gardener.tier', 'Community Champion'),
      themeColor: '#4f46e5',
      name: t('profile.badges.community_gardener.name', 'Community Gardener'),
      description: t('profile.badges.community_gardener.description', 'Shared knowledge, tips, and achievements with other city growers.'),
      requirement: t('profile.badges.community_gardener.requirement', 'Share 5 community posts ({{current}}/5)', { current: Math.min(stats.totalCommunityPosts || 0, 5) }),
    },
    {
      id: 'gardening_guru',
      tier: t('profile.badges.gardening_guru.tier', 'Master Seal'),
      themeColor: '#d97706',
      name: t('profile.badges.gardening_guru.name', 'Gardening Guru'),
      description: t('profile.badges.gardening_guru.description', 'Attained supreme gardening knowledge and master experience.'),
      requirement: t('profile.badges.gardening_guru.requirement', 'Earn 100+ gardening points ({{current}}/100)', { current: Math.min((stats.totalPlants || 0) * 10 + (stats.totalCommunityPosts || 0) * 10 + (stats.totalHarvests || 0) * 15, 100) }),
    },
    {
      id: 'weather_watcher',
      tier: t('profile.badges.weather_watcher.tier', 'Microclimate Expert'),
      themeColor: '#0891b2',
      name: t('profile.badges.weather_watcher.name', 'Weather Watcher'),
      description: t('profile.badges.weather_watcher.description', 'Utilised hyper-local weather alerts and irrigation intelligence.'),
      requirement: t('profile.badges.weather_watcher.requirement', 'Register garden and check weather ({{current}}/1)', { current: Math.min(stats.totalGardens || 0, 1) }),
    },
  ];

  if (loading) {
    return <div className="badges-loading">{t('profile.badgesSection.loading', 'Loading badges...')}</div>;
  }

  const unlockedCount = allBadges.filter(b => getBadgeStatus(b.id)).length;

  return (
    <div className="badges-section">
      <div className="badges-section-header">
        <div>
          <h3>
            <RiAwardLine className="badges-header-icon" /> {t('profile.badgesSection.title', 'Badges & Achievements')}
          </h3>
          <p className="badges-subtitle">
            {t('profile.badgesSection.subtitle', 'Earn distinctive achievement medallions as you grow and maintain your urban sanctuary!')}
          </p>
        </div>
        <div className="badges-counter-pill">
          <RiSparklingFill /> {t('profile.badgesSection.unlocked', '{{count}} / {{total}} Unlocked', { count: unlockedCount, total: allBadges.length })}
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
                  <span className="req-label">{t('profile.badgesSection.goal', 'Goal:')}</span> {badge.requirement}
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
                      {t('profile.badgesSection.progress', 'Progress:')} {progress.current}/{progress.total}
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
          <p>{t('profile.badgesSection.emptyTitle', 'Start earning badges by caring for your garden!')}</p>
          <small>{t('profile.badgesSection.emptySubtitle', 'Water plants, run health diagnoses, and share with the community to unlock achievements.')}</small>
        </div>
      )}
    </div>
  );
};

export default Badges;