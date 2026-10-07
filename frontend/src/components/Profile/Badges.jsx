import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getBadgesData, updateBadgeSettings } from '../../services/authService';
import { useNotification } from '../../hooks/useNotification';
import BadgeEmblem from './BadgeEmblem';
import './Badges.css';

const Badges = ({ badges: propBadges, stats = {}, onSettingsUpdated }) => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [allBadges, setAllBadges] = useState([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState([]);
  const [badgeStats, setBadgeStats] = useState(stats || {});
  
  // Settings state
  const [displayedBadges, setDisplayedBadges] = useState([]);
  const [pinnedBadge, setPinnedBadge] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('showcase'); // 'showcase' | 'settings'

  useEffect(() => {
    loadBadgeData();
  }, []);

  useEffect(() => {
    if (stats && typeof stats === 'object' && Object.keys(stats).length > 0) {
      setBadgeStats(prev => ({ ...prev, ...stats }));
    }
  }, [stats]);

  const loadBadgeData = async () => {
    setLoading(true);
    try {
      const data = await getBadgesData();
      if (data) {
        setAllBadges(data.allBadges || []);
        setEarnedBadgeIds(data.badges || []);
        if (data.stats && typeof data.stats === 'object') {
          setBadgeStats(prev => ({ ...prev, ...data.stats }));
        }
        
        const settings = data.badgeSettings || {};
        setDisplayedBadges(settings.displayedBadges || data.badges || []);
        setPinnedBadge(settings.pinnedBadge || '');
        setIsPublic(settings.isPublic !== false);
      }
    } catch (err) {
      console.error('Failed to load badge data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeCurrentProgress = (badgeId, s = {}, isEarned = false) => {
    const normId = (badgeId || '').toLowerCase().replace(/[- ]/g, '_').trim();
    switch (normId) {
      case 'first_sprout':
        return s.totalPlants !== undefined ? s.totalPlants : (isEarned ? 1 : 0);
      case 'hydration_master':
        return s.totalWateringEvents !== undefined ? s.totalWateringEvents : (isEarned ? 10 : 0);
      case 'plant_doctor':
      case 'disease_detective':
        return s.totalDiagnoses !== undefined ? s.totalDiagnoses : (isEarned ? 1 : 0);
      case 'first_harvest':
      case 'master_harvester':
        return s.totalHarvests !== undefined ? s.totalHarvests : (isEarned ? 1 : 0);
      case 'green_thumb':
      case 'green_thumb_pioneer':
        return s.totalPlants !== undefined ? s.totalPlants : (isEarned ? 5 : 0);
      case 'community_gardener':
      case 'community_mentor':
        return s.totalCommunityPosts !== undefined ? s.totalCommunityPosts : (isEarned ? 5 : 0);
      case 'gardening_guru':
      case 'soil_alchemist': {
        const calculatedPoints = ((s.totalPlants || 0) * 10 + (s.totalCommunityPosts || 0) * 10 + (s.totalHarvests || 0) * 15);
        return calculatedPoints > 0 ? calculatedPoints : (isEarned ? 100 : 0);
      }
      case 'weather_watcher':
        return s.totalGardens !== undefined ? s.totalGardens : (isEarned ? 1 : 0);
      default:
        return isEarned ? 1 : 0;
    }
  };

  const handleToggleDisplayed = (badgeId) => {
    if (!earnedBadgeIds.includes(badgeId)) return; // Only earned badges can be displayed
    setDisplayedBadges(prev => {
      if (prev.includes(badgeId)) {
        return prev.filter(id => id !== badgeId);
      } else {
        return [...prev, badgeId];
      }
    });
  };

  const handleSetPinned = (badgeId) => {
    if (pinnedBadge === badgeId) {
      setPinnedBadge(''); // Unpin
    } else {
      setPinnedBadge(badgeId);
      // Auto-include in displayed badges if not already
      if (!displayedBadges.includes(badgeId)) {
        setDisplayedBadges(prev => [...prev, badgeId]);
      }
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const payload = {
        displayedBadges,
        pinnedBadge,
        isPublic,
      };
      const res = await updateBadgeSettings(payload);
      if (res && res.success) {
        addNotification(t('profile.badges.settingsSaved', 'Badge showcase settings saved successfully!'), 'success');
        if (onSettingsUpdated) {
          onSettingsUpdated(res.badgeSettings);
        }
      }
    } catch (err) {
      console.error('Save badge settings error:', err);
      addNotification(t('profile.badges.settingsSaveFailed', 'Failed to save badge settings.'), 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return <div className="badges-loading">{t('profile.badgesSection.loading', 'Loading badges...')}</div>;
  }

  const earnedCount = earnedBadgeIds.length;

  return (
    <div className="badges-section">
      {/* Sub-navigation: Showcase vs Badge Settings */}
      <div className="badges-subnav-row">
        <div className="badges-subnav-buttons">
          <button 
            type="button" 
            className={`subnav-pill ${activeSubTab === 'showcase' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('showcase')}
          >
            {t('profile.badgesSection.allBadges', 'All Badges')} ({earnedCount}/{allBadges.length})
          </button>
          <button 
            type="button" 
            className={`subnav-pill ${activeSubTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('settings')}
          >
            {t('profile.badgesSection.settingsTab', 'Badge Settings')}
          </button>
        </div>

        <div className="badges-counter-tag">
          {t('profile.badgesSection.earnedCountTag', '{{earned}} of {{total}} Earned', { earned: earnedCount, total: allBadges.length })}
        </div>
      </div>

      {/* SHOWCASE / ALL BADGES VIEW */}
      {activeSubTab === 'showcase' && (
        <div className="badges-showcase-view">
          <div className="badges-section-intro">
            <h3>{t('profile.badgesSection.title', 'Garden Achievements')}</h3>
            <p className="badges-subtitle">
              {t('profile.badgesSection.subtitle', 'Earn distinctive milestones as you care for plants, diagnose issues, and grow your urban sanctuary.')}
            </p>
          </div>

          <div className="badges-cards-grid">
            {allBadges.map((badge) => {
              const isEarned = earnedBadgeIds.includes(badge.id);
              const isPinned = pinnedBadge === badge.id;
              const isDisplayed = displayedBadges.includes(badge.id);

              const badgeName = t(`profile.badges.${badge.id}.name`, badge.name);
              const badgeTier = t(`profile.badges.${badge.id}.tier`, badge.tier);
              const badgeDesc = t(`profile.badges.${badge.id}.description`, badge.description);
              
              const currentVal = getBadgeCurrentProgress(badge.id, badgeStats, isEarned);
              let howToEarnText = t(`profile.badges.${badge.id}.requirement`, {
                defaultValue: badge.howToEarn,
                current: currentVal,
              });
              if (typeof howToEarnText === 'string') {
                howToEarnText = howToEarnText.replace(/\{\{\s*current\s*\}\}/g, String(currentVal));
              }

              return (
                <div 
                  key={badge.id} 
                  className={`badge-card-item ${isEarned ? 'earned' : 'locked'}`}
                >
                  <div className="badge-card-top">
                    <div className="badge-emblem-wrap">
                      <BadgeEmblem id={badge.id} isUnlocked={isEarned} size={64} />
                    </div>

                    <div className="badge-status-tags">
                      {isPinned && (
                        <span className="pinned-badge-chip">
                          ★ {t('profile.badges.pinned', 'Pinned')}
                        </span>
                      )}
                      <span className={`badge-state-pill ${isEarned ? 'unlocked' : 'locked'}`}>
                        {isEarned ? t('profile.badges.earned', 'Earned') : t('profile.badges.locked', 'Locked')}
                      </span>
                    </div>
                  </div>

                  <div className="badge-card-body">
                    <span className="badge-tier-label">{badgeTier}</span>
                    <h4 className="badge-card-name">{badgeName}</h4>
                    <p className="badge-description">{badgeDesc}</p>
                    
                    <div className="badge-how-to-earn-box">
                      <span className="how-to-label">
                        {isEarned 
                          ? t('profile.badges.unlockedVia', 'Unlocked via:') 
                          : t('profile.badges.howToEarn', 'How to Earn:')}
                      </span>
                      <p className="how-to-text">{howToEarnText}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BADGE SETTINGS VIEW */}
      {activeSubTab === 'settings' && (
        <div className="badges-settings-panel">
          <div className="settings-panel-header">
            <div>
              <h3>{t('profile.badges.settingsTitle', 'Badge Display & Privacy Settings')}</h3>
              <p className="settings-desc">
                {t('profile.badges.settingsDesc', 'Choose which earned badges are highlighted on your profile, pin your favorite milestone, and control public visibility.')}
              </p>
            </div>
            <button 
              type="button" 
              className="btn-save-badge-settings"
              onClick={handleSaveSettings}
              disabled={savingSettings}
            >
              {savingSettings ? t('profile.badges.saving', 'Saving...') : t('profile.badges.saveSettings', 'Save Settings')}
            </button>
          </div>

          {/* Privacy Toggle Card */}
          <div className="settings-option-card">
            <div className="settings-option-info">
              <span className="option-title">{t('profile.badges.privacyTitle', 'Public & Community Profile Visibility')}</span>
              <span className="option-sub">
                {t('profile.badges.privacySub', 'When enabled, your chosen badges will appear on your public gardener profile and community posts.')}
              </span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={isPublic} 
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {/* Pin Favorite Badge */}
          <div className="settings-option-card">
            <div className="settings-option-info">
              <span className="option-title">{t('profile.badges.pinTitle', 'Pin Favorite Badge')}</span>
              <span className="option-sub">
                {t('profile.badges.pinSub', 'Select one earned badge to feature prominently in your profile header as your primary accolade.')}
              </span>
            </div>
            <select 
              value={pinnedBadge} 
              onChange={(e) => setPinnedBadge(e.target.value)}
              className="pinned-badge-select"
            >
              <option value="">{t('profile.badges.noPinned', '-- No Pinned Badge --')}</option>
              {allBadges.filter(b => earnedBadgeIds.includes(b.id)).map(b => (
                <option key={b.id} value={b.id}>
                  ★ {t(`profile.badges.${b.id}.name`, b.name)} ({t(`profile.badges.${b.id}.tier`, b.tier)})
                </option>
              ))}
            </select>
          </div>

          {/* Choose Which Earned Badges to Display */}
          <div className="settings-showcase-picker">
            <div className="picker-header">
              <h4>{t('profile.badges.chooseDisplayed', 'Choose Displayed Badges ({{count}} selected)', { count: displayedBadges.length })}</h4>
              <p>{t('profile.badges.chooseDisplayedSub', 'Toggle which of your unlocked badges appear on your showcase:')}</p>
            </div>

            {earnedBadgeIds.length === 0 ? (
              <div className="no-earned-notice">
                <span>{t('profile.badges.noEarnedYet', "You haven't unlocked any badges yet. Complete garden activities to unlock achievements!")}</span>
              </div>
            ) : (
              <div className="badge-picker-grid">
                {allBadges.filter(b => earnedBadgeIds.includes(b.id)).map(badge => {
                  const isChecked = displayedBadges.includes(badge.id);
                  const isPinned = pinnedBadge === badge.id;
                  const bName = t(`profile.badges.${badge.id}.name`, badge.name);
                  const bTier = t(`profile.badges.${badge.id}.tier`, badge.tier);

                  return (
                    <div 
                      key={badge.id}
                      className={`picker-badge-card ${isChecked ? 'selected' : ''}`}
                      onClick={() => handleToggleDisplayed(badge.id)}
                    >
                      <div className="picker-card-top">
                        <div className="picker-badge-emblem-mini">
                          <BadgeEmblem id={badge.id} isUnlocked={true} size={42} />
                        </div>
                        <div className="picker-top-actions">
                          {isPinned && <span className="pinned-badge-chip">★ {t('profile.badges.pinned', 'Pinned')}</span>}
                          <span className="picker-checkbox">
                            {isChecked ? '✓' : ''}
                          </span>
                        </div>
                      </div>
                      <span className="picker-name">{bName}</span>
                      <span className="picker-tier">{bTier}</span>
                      <button 
                        type="button" 
                        className={`pin-btn ${isPinned ? 'is-pinned' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPinned(badge.id);
                        }}
                      >
                        {isPinned ? `★ ${t('profile.badges.unpin', 'Unpin')}` : `☆ ${t('profile.badges.pinAsFavorite', 'Pin as Favorite')}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="settings-bottom-actions">
            <button 
              type="button" 
              className="btn-save-badge-settings"
              onClick={handleSaveSettings}
              disabled={savingSettings}
            >
              {savingSettings ? t('profile.badges.saving', 'Saving...') : t('profile.badges.saveSettings', 'Save Badge Settings')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Badges;