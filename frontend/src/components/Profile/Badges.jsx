import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getBadgesData, updateBadgeSettings } from '../../services/authService';
import { useNotification } from '../../hooks/useNotification';
import './Badges.css';

const Badges = ({ badges: propBadges, stats = {}, onSettingsUpdated }) => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [allBadges, setAllBadges] = useState([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState([]);
  
  // Settings state
  const [displayedBadges, setDisplayedBadges] = useState([]);
  const [pinnedBadge, setPinnedBadge] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('showcase'); // 'showcase' | 'settings'

  useEffect(() => {
    loadBadgeData();
  }, []);

  const loadBadgeData = async () => {
    setLoading(true);
    try {
      const data = await getBadgesData();
      if (data) {
        setAllBadges(data.allBadges || []);
        setEarnedBadgeIds(data.badges || []);
        
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
          {earnedCount} of {allBadges.length} Earned
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

              return (
                <div 
                  key={badge.id} 
                  className={`badge-card-item ${isEarned ? 'earned' : 'locked'}`}
                >
                  <div className="badge-card-top">
                    <div className="badge-geometric-crest" style={{ borderColor: badge.themeColor }}>
                      <span className="badge-crest-inner" style={{ backgroundColor: isEarned ? badge.themeColor : '#cce3de' }}>
                        {badge.name.charAt(0)}
                      </span>
                    </div>

                    <div className="badge-status-tags">
                      {isPinned && <span className="pinned-badge-chip">★ Pinned</span>}
                      <span className={`badge-state-pill ${isEarned ? 'unlocked' : 'locked'}`}>
                        {isEarned ? 'Earned' : 'Locked'}
                      </span>
                    </div>
                  </div>

                  <div className="badge-card-body">
                    <span className="badge-tier-label">{badge.tier}</span>
                    <h4 className="badge-card-name">{badge.name}</h4>
                    <p className="badge-description">{badge.description}</p>
                    
                    <div className="badge-how-to-earn-box">
                      <span className="how-to-label">
                        {isEarned ? 'Unlocked via:' : 'How to Earn:'}
                      </span>
                      <p className="how-to-text">{badge.howToEarn}</p>
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
              <h3>Badge Display & Privacy Settings</h3>
              <p className="settings-desc">
                Choose which earned badges are highlighted on your profile, pin your favorite milestone, and control public visibility.
              </p>
            </div>
            <button 
              type="button" 
              className="btn-save-badge-settings"
              onClick={handleSaveSettings}
              disabled={savingSettings}
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {/* Privacy Toggle Card */}
          <div className="settings-option-card">
            <div className="settings-option-info">
              <span className="option-title">Public & Community Profile Visibility</span>
              <span className="option-sub">
                When enabled, your chosen badges will appear on your public gardener profile and community posts.
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
              <span className="option-title">Pin Favorite Badge</span>
              <span className="option-sub">
                Select one earned badge to feature prominently in your profile header as your primary accolade.
              </span>
            </div>
            <select 
              value={pinnedBadge} 
              onChange={(e) => setPinnedBadge(e.target.value)}
              className="pinned-badge-select"
            >
              <option value="">-- No Pinned Badge --</option>
              {allBadges.filter(b => earnedBadgeIds.includes(b.id)).map(b => (
                <option key={b.id} value={b.id}>
                  ★ {b.name} ({b.tier})
                </option>
              ))}
            </select>
          </div>

          {/* Choose Which Earned Badges to Display */}
          <div className="settings-showcase-picker">
            <div className="picker-header">
              <h4>Choose Displayed Badges ({displayedBadges.length} selected)</h4>
              <p>Toggle which of your unlocked badges appear on your showcase:</p>
            </div>

            {earnedBadgeIds.length === 0 ? (
              <div className="no-earned-notice">
                <span>You haven't unlocked any badges yet. Complete garden activities to unlock achievements!</span>
              </div>
            ) : (
              <div className="badge-picker-grid">
                {allBadges.filter(b => earnedBadgeIds.includes(b.id)).map(badge => {
                  const isChecked = displayedBadges.includes(badge.id);
                  const isPinned = pinnedBadge === badge.id;

                  return (
                    <div 
                      key={badge.id}
                      className={`picker-badge-card ${isChecked ? 'selected' : ''}`}
                      onClick={() => handleToggleDisplayed(badge.id)}
                    >
                      <div className="picker-card-top">
                        <span className="picker-checkbox">
                          {isChecked ? '✓' : ''}
                        </span>
                        {isPinned && <span className="pinned-badge-chip">Pinned</span>}
                      </div>
                      <span className="picker-name">{badge.name}</span>
                      <span className="picker-tier">{badge.tier}</span>
                      <button 
                        type="button" 
                        className={`pin-btn ${isPinned ? 'is-pinned' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPinned(badge.id);
                        }}
                      >
                        {isPinned ? 'Unpin' : 'Pin as Favorite'}
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
              {savingSettings ? 'Saving...' : 'Save Badge Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Badges;