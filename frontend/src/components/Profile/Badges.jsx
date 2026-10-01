import React, { useState, useEffect } from 'react';
import { getBadges } from '../../services/authService';
import './Badges.css';

const Badges = ({ badges: propBadges }) => {
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

  // Define all possible badges with their requirements
  const allBadges = [
    {
      id: 'first_sprout',
      icon: '🌱',
      name: 'First Sprout',
      description: 'Added your first plant',
      requirement: 'Add your first plant to any garden',
    },
    {
      id: 'hydration_master',
      icon: '💧',
      name: 'Hydration Master',
      description: 'Completed 10 watering sessions',
      requirement: 'Complete 10 watering sessions (0/10)',
    },
    {
      id: 'plant_doctor',
      icon: '🔬',
      name: 'Plant Doctor',
      description: 'Ran your first disease diagnosis',
      requirement: 'Run your first disease diagnosis',
    },
    {
      id: 'first_harvest',
      icon: '🍅',
      name: 'First Harvest',
      description: 'Marked a crop as harvested',
      requirement: 'Harvest your first crop',
    },
    {
      id: 'green_thumb',
      icon: '🌿',
      name: 'Green Thumb',
      description: 'Grew 5+ plants successfully',
      requirement: 'Grow 5+ plants (0/5)',
    },
    {
      id: 'community_gardener',
      icon: '👥',
      name: 'Community Gardener',
      description: 'Shared 5 posts in the community',
      requirement: 'Share 5 community posts (0/5)',
    },
    {
      id: 'gardening_guru',
      icon: '🌟',
      name: 'Gardening Guru',
      description: 'Reached Master Gardener level',
      requirement: 'Earn 100+ gardening points',
    },
    {
      id: 'weather_watcher',
      icon: '🌤️',
      name: 'Weather Watcher',
      description: 'Used weather features 10 times',
      requirement: 'Check weather 10 times (0/10)',
    },
  ];

  // Check which badges are unlocked
  const getBadgeStatus = (badgeId) => {
    return badges.some(b => b.id === badgeId || b === badgeId);
  };

  // Get progress for a badge (mock data)
  const getBadgeProgress = (badgeId) => {
    // In a real implementation, this would come from the backend
    const progress = {
      'hydration_master': { current: 3, total: 10 },
      'green_thumb': { current: 2, total: 5 },
      'community_gardener': { current: 1, total: 5 },
      'weather_watcher': { current: 4, total: 10 },
    };
    return progress[badgeId] || null;
  };

  if (loading) {
    return <div className="badges-loading">Loading badges...</div>;
  }

  return (
    <div className="badges-section">
      <h3>🏅 Badges & Achievements</h3>
      <p className="badges-subtitle">Collect badges as you grow your urban garden!</p>
      
      <div className="badges-grid">
        {allBadges.map((badge) => {
          const isUnlocked = getBadgeStatus(badge.id);
          const progress = getBadgeProgress(badge.id);
          
          return (
            <div 
              key={badge.id} 
              className={`badge-item ${isUnlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="badge-icon-container">
                <span className="badge-icon">{badge.icon}</span>
                {isUnlocked && <span className="badge-check">✅</span>}
                {!isUnlocked && <span className="badge-lock">🔒</span>}
              </div>
              <div className="badge-info">
                <h4 className="badge-name">{badge.name}</h4>
                <p className="badge-description">{badge.description}</p>
                <p className="badge-requirement">{badge.requirement}</p>
                {progress && !isUnlocked && (
                  <div className="badge-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${(progress.current / progress.total) * 100}%`,
                          background: 'linear-gradient(90deg, #b8a9c9, #9a87b1)'
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      {progress.current}/{progress.total}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {badges.length === 0 && (
        <div className="badges-empty">
          <span>🎯</span>
          <p>Start earning badges by growing your garden!</p>
          <small>Complete activities to unlock achievements</small>
        </div>
      )}
    </div>
  );
};

export default Badges;