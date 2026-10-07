import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiUser3Line, 
  RiEditLine, 
  RiCloseLine, 
  RiLightbulbLine,
  RiDropLine,
  RiMicroscopeLine,
  RiTeamLine,
  RiSunCloudyLine,
  RiShoppingBasketLine,
  RiAwardLine,
  RiCameraLine,
  RiDeleteBinLine,
  RiUploadCloudLine,
  RiTrophyLine,
  RiSparklingFill,
  RiArrowRightLine,
  RiGlobalLine
} from 'react-icons/ri';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, getBadges, getBadgesData, uploadImage } from '../../services/authService';
import { getGardens, getPlants, getDiagnosisHistory, getCommunityPosts } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import Badges from './Badges';
import ProfileStats from './ProfileStats';
import BadgeEmblem from './BadgeEmblem';
import { GARDENING_LEVELS } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './Profile.css';

const BADGE_DEFINITIONS = [
  {
    id: 'gardening_guru',
    rank: 1,
    name: 'Gardening Guru',
    tier: 'Master Seal',
    themeColor: '#d97706',
    description: 'Attained supreme gardening knowledge and master experience.',
    check: (s) => ((s.totalPlants || 0) * 10 + (s.totalCommunityPosts || 0) * 10 + (s.totalHarvests || 0) * 15) >= 100 || (s.totalPlants || 0) >= 10,
  },
  {
    id: 'green_thumb',
    rank: 2,
    name: 'Green Thumb',
    tier: 'Emerald Mastery',
    themeColor: '#059669',
    description: 'Cultivated 5 or more active healthy urban plants simultaneously.',
    check: (s) => (s.totalPlants || 0) >= 5,
  },
  {
    id: 'community_gardener',
    rank: 3,
    name: 'Community Gardener',
    tier: 'Community Champion',
    themeColor: '#4f46e5',
    description: 'Shared knowledge, tips, and achievements with other city growers.',
    check: (s) => (s.totalCommunityPosts || 0) >= 5,
  },
  {
    id: 'hydration_master',
    rank: 4,
    name: 'Hydration Master',
    tier: 'Water Master',
    themeColor: '#0284c7',
    description: 'Completed 10 regular watering sessions to keep plants thriving.',
    check: (s) => (s.totalWateringEvents || 0) >= 10,
  },
  {
    id: 'plant_doctor',
    rank: 5,
    name: 'Plant Doctor',
    tier: 'Plant Health Specialist',
    themeColor: '#7c3aed',
    description: 'Diagnosed plant diseases and health conditions with the AI scanner.',
    check: (s) => (s.totalDiagnoses || 0) >= 1,
  },
  {
    id: 'first_harvest',
    rank: 6,
    name: 'First Harvest',
    tier: 'Harvest Glory',
    themeColor: '#ea580c',
    description: 'Reaped the fresh fruits of your urban garden labour.',
    check: (s) => (s.totalHarvests || 0) >= 1,
  },
  {
    id: 'first_sprout',
    rank: 7,
    name: 'First Sprout',
    tier: 'Bronze Milestone',
    themeColor: '#2d6a4f',
    description: 'Planted and registered your first seed or seedling into UrbanFarm.',
    check: (s) => (s.totalPlants || 0) >= 1,
  },
  {
    id: 'weather_watcher',
    rank: 8,
    name: 'Weather Watcher',
    tier: 'Microclimate Expert',
    themeColor: '#0891b2',
    description: 'Utilised hyper-local weather alerts and irrigation intelligence.',
    check: (s) => (s.totalGardens || 0) >= 1,
  },
];

const Profile = () => {
  const { i18n, t } = useTranslation();
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'achievements'
  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: {
      city: user?.location?.city || '',
      country: user?.location?.country || '',
      timezone: user?.location?.timezone || '',
    },
    gardeningLevel: user?.gardeningLevel || 'intermediate',
    urbanSpaceType: user?.urbanSpaceType || 'balcony',
    climateZone: user?.climateZone || 'subtropical',
    preferences: {
      showAdvancedTips: user?.preferences?.showAdvancedTips || false,
      unitSystem: user?.preferences?.unitSystem || 'metric',
      notificationPreferences: user?.preferences?.notificationPreferences || {
        wateringReminders: true,
        diagnosisAlerts: true,
        communityUpdates: true,
        weatherAlerts: true,
      },
    },
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePicture || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({
    totalGardens: 0,
    totalPlants: 0,
    totalDiagnoses: 0,
    totalCommunityPosts: 0,
    totalWateringEvents: 0,
    totalHarvests: 0,
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadData();

    const handleDataRefresh = () => {
      loadData();
    };

    window.addEventListener('urbanfarm:refresh-data', handleDataRefresh);
    return () => {
      window.removeEventListener('urbanfarm:refresh-data', handleDataRefresh);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        location: {
          city: user.location?.city || '',
          country: user.location?.country || '',
          timezone: user.location?.timezone || '',
        },
        gardeningLevel: user.gardeningLevel || 'intermediate',
        urbanSpaceType: user.urbanSpaceType || 'balcony',
        climateZone: user.climateZone || 'subtropical',
        preferences: {
          showAdvancedTips: user.preferences?.showAdvancedTips || false,
          unitSystem: user.preferences?.unitSystem || 'metric',
          notificationPreferences: user.preferences?.notificationPreferences || {
            wateringReminders: true,
            diagnosisAlerts: true,
            communityUpdates: true,
            weatherAlerts: true,
          },
        },
      });
      setPhotoPreview(user.profilePicture || null);
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [badgesDataRes, gardensData, plantsData, diagnosesData, postsData] = await Promise.all([
        getBadgesData().catch(() => null),
        getGardens().catch(() => []),
        getPlants().catch(() => []),
        getDiagnosisHistory().catch(() => []),
        getCommunityPosts().catch(() => []),
      ]);

      const earnedBadges = Array.isArray(badgesDataRes?.badges) 
        ? badgesDataRes.badges 
        : (Array.isArray(badgesDataRes) ? badgesDataRes : []);
      setBadges(earnedBadges);
      
      const currentUserId = user?._id || user?.id;
      const userPosts = Array.isArray(postsData) 
        ? postsData.filter(p => {
            const pUserId = (p.userId?._id || p.userId)?.toString();
            return currentUserId && pUserId === currentUserId.toString();
          })
        : [];

      const directGardens = Array.isArray(gardensData) ? gardensData.length : 0;
      const directPlants = Array.isArray(plantsData) ? plantsData.length : 0;
      const directDiagnoses = Array.isArray(diagnosesData) ? diagnosesData.length : 0;
      const directPosts = userPosts.length;
      const directWatering = Array.isArray(plantsData) 
        ? plantsData.reduce((acc, p) => acc + (Array.isArray(p.wateringHistory) ? p.wateringHistory.length : 0), 0)
        : 0;
      const directHarvests = Array.isArray(plantsData) 
        ? plantsData.filter(p => p.status === 'harvested' || (Array.isArray(p.harvestHistory) && p.harvestHistory.length > 0)).length 
        : 0;
      
      const backendStats = badgesDataRes?.stats || {};
      const totalGardens = backendStats.totalGardens !== undefined ? backendStats.totalGardens : directGardens;
      const totalPlants = backendStats.totalPlants !== undefined ? backendStats.totalPlants : directPlants;
      const totalDiagnoses = backendStats.totalDiagnoses !== undefined ? backendStats.totalDiagnoses : directDiagnoses;
      const totalCommunityPosts = backendStats.totalCommunityPosts !== undefined ? backendStats.totalCommunityPosts : directPosts;
      const totalWateringEvents = Math.max(backendStats.totalWateringEvents || 0, directWatering);
      const totalHarvests = backendStats.totalHarvests !== undefined ? backendStats.totalHarvests : directHarvests;

      setStats({
        totalGardens,
        totalPlants,
        totalDiagnoses,
        totalCommunityPosts,
        totalWateringEvents,
        totalHarvests,
      });
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [field]: value },
      }));
    } else if (name.startsWith('preferences.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, [field]: type === 'checkbox' ? checked : value },
      }));
    } else if (name.startsWith('notification.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          notificationPreferences: {
            ...prev.preferences.notificationPreferences,
            [field]: checked,
          },
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addNotification(t('profile.modal.imageSizeWarning', 'Image size should be under 5MB'), 'warning');
        return;
      }
      setSelectedFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let profilePictureUrl = user?.profilePicture || '';

      if (selectedFile) {
        setUploadingPhoto(true);
        try {
          profilePictureUrl = await uploadImage(selectedFile);
        } catch (uploadErr) {
          console.error('Photo upload error:', uploadErr);
          addNotification(t('profile.modal.updateFailed', 'Update failed'), 'error');
          setLoading(false);
          setUploadingPhoto(false);
          return;
        }
        setUploadingPhoto(false);
      } else if (photoPreview === null) {
        profilePictureUrl = '';
      }

      const updated = await updateProfile({
        ...formData,
        profilePicture: profilePictureUrl,
      });

      login(updated, localStorage.getItem('token'));
      addNotification(t('profile.modal.updateSuccess', 'Profile updated successfully! 🌱'), 'success');
      setEditing(false);
      setSelectedFile(null);
    } catch (error) {
      addNotification(t('profile.modal.updateFailed', 'Update failed'), 'error');
    } finally {
      setLoading(false);
      setUploadingPhoto(false);
    }
  };

  const urbanSpaceOptions = [
    { value: 'balcony', label: t('profile.spaces.balcony', 'Balcony') },
    { value: 'rooftop', label: t('profile.spaces.rooftop', 'Rooftop') },
    { value: 'indoor', label: t('profile.spaces.indoor', 'Indoor Window Sill') },
    { value: 'backyard', label: t('profile.spaces.backyard', 'Backyard') },
    { value: 'community', label: t('profile.spaces.community', 'Community Garden') },
    { value: 'windowsill', label: t('profile.spaces.windowsill', 'Window Sill') },
  ];

  const climateZoneOptions = [
    { value: 'tropical', label: t('profile.climates.tropical', 'Tropical') },
    { value: 'subtropical', label: t('profile.climates.subtropical', 'Humid Subtropical') },
    { value: 'temperate', label: t('profile.climates.temperate', 'Temperate') },
    { value: 'mediterranean', label: t('profile.climates.mediterranean', 'Mediterranean') },
    { value: 'continental', label: t('profile.climates.continental', 'Continental') },
    { value: 'arctic', label: t('profile.climates.arctic', 'Arctic') },
  ];

  const gardeningLevelOptions = [
    { value: 'beginner', label: t('profile.levels.beginner', 'Beginner') },
    { value: 'intermediate', label: t('profile.levels.intermediate', 'Intermediate') },
    { value: 'advanced', label: t('profile.levels.advanced', 'Advanced') },
    { value: 'expert', label: t('profile.levels.expert', 'Expert') },
  ];

  const userCity = user?.location?.city || 'Botad';
  const userCountry = user?.location?.country || 'India';
  const rawLocation = user?.location?.city && user?.location?.country 
    ? `${user.location.city}, ${user.location.country}` 
    : `${userCity}, ${userCountry}`;
  const locationDisplay = getLocalizedDynamicText(rawLocation, i18n.language) || rawLocation;

  const currentLevelLabel = gardeningLevelOptions.find(l => l.value === user?.gardeningLevel)?.label 
    || t(`profile.levels.${user?.gardeningLevel || 'intermediate'}`, 'Intermediate');
  const currentSpaceLabel = urbanSpaceOptions.find(o => o.value === user?.urbanSpaceType)?.label 
    || t(`profile.spaces.${user?.urbanSpaceType || 'balcony'}`, 'Balcony');
  const currentClimateLabel = climateZoneOptions.find(z => z.value === user?.climateZone)?.label 
    || t(`profile.climates.${user?.climateZone || 'subtropical'}`, 'Humid Subtropical');

  const getLocalizedBadge = (badge) => {
    if (!badge) return badge;
    return {
      ...badge,
      name: t(`profile.badges.${badge.id}.name`, badge.name),
      tier: t(`profile.badges.${badge.id}.tier`, badge.tier),
      description: t(`profile.badges.${badge.id}.description`, badge.description),
    };
  };

  const getTopBadgeData = () => {
    const unlockedBadges = BADGE_DEFINITIONS.filter(b => b.check(stats));
    if (unlockedBadges.length > 0) {
      return { 
        badge: getLocalizedBadge(unlockedBadges[0]), 
        isUnlocked: true, 
        count: unlockedBadges.length 
      };
    }
    return { 
      badge: getLocalizedBadge(BADGE_DEFINITIONS[BADGE_DEFINITIONS.length - 2]), 
      isUnlocked: false, 
      count: 0 
    };
  };

  const topBadgeInfo = getTopBadgeData();

  return (
    <div className="profile-container-layout">
      {/* Left Main Section */}
      <div className="profile-main-section">
        {/* Profile Header Banner */}
        <div className="profile-banner-card">
          <div className="profile-banner-user">
            <div 
              className="profile-avatar-circle clickable"
              onClick={() => setEditing(true)}
              title={t('profile.modal.photoSection', 'Click to edit profile photo')}
            >
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} />
              ) : (
                getInitials(user?.name || 'Priya Sharma')
              )}
              <div className="avatar-hover-overlay">
                <RiCameraLine />
              </div>
            </div>
            <div className="profile-user-titles">
              <h2 className="profile-user-name">
                {t('profile.userProfile', "{{name}}'s Profile", { name: getLocalizedDynamicText(user?.name || 'Priya Sharma', i18n.language) })}
              </h2>
              {topBadgeInfo.isUnlocked && (
                <div className="header-highest-badge-pill" style={{ '--pill-color': topBadgeInfo.badge.themeColor }}>
                  <RiTrophyLine /> {t('profile.highestBadge', 'Highest Badge')}: <strong>{topBadgeInfo.badge.name}</strong> ({topBadgeInfo.badge.tier})
                </div>
              )}
            </div>
          </div>

          <div className="profile-banner-actions">
            <div className="profile-lang-pill">
              <RiGlobalLine className="profile-lang-icon" />
              <span className="profile-lang-label">{t('profile.language', 'Language')}:</span>
              <span className="profile-lang-value">
                {i18n.language === 'gu' ? 'ગુજરાતી (Gujarati)' : i18n.language === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
              </span>
            </div>
            <button 
              className="btn-edit-profile"
              onClick={() => setEditing(true)}
            >
              <RiEditLine /> {t('profile.editProfile', 'Edit Profile')}
            </button>
          </div>
        </div>

        {/* Tabbed Profile Content Card */}
        <div className="profile-content-card">
          {/* Tab Navigation */}
          <div className="profile-tabs-nav">
            <button 
              className={`tab-nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              {t('profile.tabs.stats', 'My Garden Stats')}
            </button>
            <button 
              className={`tab-nav-btn ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              {t('profile.tabs.achievements', 'My Achievements')}
            </button>
          </div>

          {activeTab === 'stats' ? (
            <div className="tab-pane-stats">
              {/* Horizontal 5 Stat Cards */}
              <ProfileStats stats={stats} />

              {/* Dynamic Highest Badge Spotlight Card */}
              <div className="top-badge-card">
                <div className="top-badge-left">
                  <div className="top-badge-emblem-wrap">
                    <BadgeEmblem id={topBadgeInfo.badge.id} isUnlocked={topBadgeInfo.isUnlocked} size={64} />
                  </div>
                  <div className="top-badge-info">
                    <div className="top-badge-label-row">
                      <span className="top-badge-header-tag">
                        <RiTrophyLine style={{ color: topBadgeInfo.badge.themeColor }} /> {t('profile.spotlight.highestEarned', 'HIGHEST EARNED BADGE')}
                      </span>
                      <span className="top-badge-tier-pill" style={{ color: topBadgeInfo.badge.themeColor }}>
                        {topBadgeInfo.badge.tier}
                      </span>
                    </div>
                    <h3 className="top-badge-title">{topBadgeInfo.badge.name}</h3>
                    <p className="top-badge-desc">{topBadgeInfo.badge.description}</p>
                  </div>
                </div>

                <div className="top-badge-right">
                  <div className="unlocked-count-pill">
                    <RiSparklingFill /> {t('profile.spotlight.unlockedCount', '{{count}} / {{total}} Unlocked', { count: topBadgeInfo.count, total: BADGE_DEFINITIONS.length })}
                  </div>
                  <button 
                    className="btn-view-all-badges"
                    onClick={() => setActiveTab('achievements')}
                  >
                    {t('profile.spotlight.viewAll', 'View All Badges')} <RiArrowRightLine />
                  </button>
                </div>
              </div>

              {/* My Info Section */}
              <div className="my-info-section">
                <h3 className="my-info-title">{t('profile.myInfo.title', 'My Info')}</h3>
                <div className="my-info-grid">
                  <div className="info-col">
                    <div className="info-row">
                      <span className="info-key">{t('profile.myInfo.name', 'Name')}</span>
                      <span className="info-val">{getLocalizedDynamicText(user?.name || 'Priya Sharma', i18n.language)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-key">{t('profile.myInfo.location', 'Location')}</span>
                      <span className="info-val">{locationDisplay}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-key">{t('profile.myInfo.gardeningLevel', 'Gardening Level')}</span>
                      <span className="info-val">{currentLevelLabel}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-key">{t('profile.myInfo.urbanSpaceType', 'Urban Space Type')}</span>
                      <span className="info-val">{currentSpaceLabel}</span>
                    </div>
                  </div>

                  <div className="info-col">
                    <div className="info-row">
                      <span className="info-key">{t('profile.myInfo.email', 'Email')}</span>
                      <span className="info-val">{user?.email || 'priya@urbanfarm.com'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-key">{t('profile.myInfo.climateZone', 'Climate Zone')}</span>
                      <span className="info-val">{currentClimateLabel}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-key">{t('profile.myInfo.unitSystem', 'Unit System')}</span>
                      <span className="info-val">
                        {user?.preferences?.unitSystem === 'imperial' 
                          ? t('profile.units.imperial', 'Imperial (in, °F)') 
                          : t('profile.units.metric', 'Metric (cm, °C)')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="tab-pane-achievements">
              <Badges badges={badges} stats={stats} />
            </div>
          )}
        </div>
      </div>

      {/* Right Rail Column: Upcoming & Urgent */}
      <div className="profile-right-rail">
        <div className="upcoming-urgent-card">
          <h3 className="rail-title">{t('profile.upcoming.title', 'Upcoming & Urgent')}</h3>
          <div className="urgent-list">
            <div className="urgent-item">
              <div className="urgent-icon icon-blue">
                <RiDropLine />
              </div>
              <div className="urgent-meta">
                <span className="urgent-item-title">{t('profile.upcoming.wateringDue', 'Watering Due')}</span>
                <span className="urgent-item-sub">{t('profile.upcoming.wateringSub', 'Balcony Plants (Tomorrow AM)')}</span>
              </div>
            </div>

            <div className="urgent-item">
              <div className="urgent-icon icon-orange">
                <RiShoppingBasketLine />
              </div>
              <div className="urgent-meta">
                <span className="urgent-item-title">{t('profile.upcoming.harvestReady', 'Harvest Ready')}</span>
                <span className="urgent-item-sub">{t('profile.upcoming.harvestSub', 'Tomatoes (In 2 days)')}</span>
              </div>
            </div>

            <div className="urgent-item">
              <div className="urgent-icon icon-green">
                <RiMicroscopeLine />
              </div>
              <div className="urgent-meta">
                <span className="urgent-item-title">{t('profile.upcoming.diagnosisRecommended', 'Diagnosis Recommended')}</span>
                <span className="urgent-item-sub">{t('profile.upcoming.diagnosisSub', 'Basil (View Details)')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="edit-profile-modal-overlay" onClick={() => setEditing(false)}>
          <div className="edit-profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>{t('profile.modal.title', 'Edit Profile')}</h3>
              <button className="close-btn" onClick={() => setEditing(false)}>
                <RiCloseLine />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              {/* Optional Photo Upload Section */}
              <div className="form-section photo-upload-section">
                <h4>{t('profile.modal.photoSection', 'Profile Photo (Optional)')}</h4>
                <div className="photo-upload-container">
                  <div className="photo-preview-avatar">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" />
                    ) : (
                      getInitials(formData.name || 'User')
                    )}
                  </div>
                  <div className="photo-actions-column">
                    <input 
                      type="file" 
                      id="profilePhotoInput" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                    <button 
                      type="button" 
                      className="btn-upload-photo"
                      onClick={() => document.getElementById('profilePhotoInput')?.click()}
                    >
                      <RiCameraLine /> {selectedFile || photoPreview ? t('profile.modal.changePhoto', 'Change Photo') : t('profile.modal.uploadPhoto', 'Upload Photo')}
                    </button>
                    {photoPreview && (
                      <button 
                        type="button" 
                        className="btn-remove-photo"
                        onClick={handleRemovePhoto}
                      >
                        <RiDeleteBinLine /> {t('profile.modal.removePhoto', 'Remove Photo')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>{t('profile.modal.basicInfo', 'Basic Information')}</h4>
                <div className="form-group">
                  <label>{t('profile.modal.name', 'Name')}</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>{t('profile.modal.locationSection', 'Location & Climate')}</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('profile.modal.city', 'City')}</label>
                    <input
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      placeholder={t('profile.modal.cityPlaceholder', 'e.g., Mumbai')}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('profile.modal.country', 'Country')}</label>
                    <input
                      name="location.country"
                      value={formData.location.country}
                      onChange={handleChange}
                      placeholder={t('profile.modal.countryPlaceholder', 'e.g., India')}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('profile.modal.climateZone', 'Climate Zone')}</label>
                  <select
                    name="climateZone"
                    value={formData.climateZone}
                    onChange={handleChange}
                  >
                    {climateZoneOptions.map((zone) => (
                      <option key={zone.value} value={zone.value}>
                        {zone.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h4>{t('profile.modal.gardenSetup', 'Urban Garden Setup')}</h4>
                <div className="form-group">
                  <label>{t('profile.modal.primarySpace', 'Primary Growing Space')}</label>
                  <select
                    name="urbanSpaceType"
                    value={formData.urbanSpaceType}
                    onChange={handleChange}
                  >
                    {urbanSpaceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h4>{t('profile.modal.experience', 'Gardening Experience')}</h4>
                <div className="form-group">
                  <label>{t('profile.modal.skillLevel', 'Skill Level')}</label>
                  <select
                    name="gardeningLevel"
                    value={formData.gardeningLevel}
                    onChange={handleChange}
                  >
                    {gardeningLevelOptions.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h4>{t('profile.modal.preferencesSection', 'Preferences & Notifications')}</h4>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="preferences.showAdvancedTips"
                      checked={formData.preferences.showAdvancedTips}
                      onChange={handleChange}
                    />
                    <span>{t('profile.modal.advancedTips', 'Show advanced gardening tips')}</span>
                  </label>
                </div>
                <div className="form-group">
                  <label>{t('profile.modal.unitSystem', 'Unit System')}</label>
                  <select
                    name="preferences.unitSystem"
                    value={formData.preferences.unitSystem}
                    onChange={handleChange}
                  >
                    <option value="metric">{t('profile.units.metricForm', 'Metric (cm, kg, °C)')}</option>
                    <option value="imperial">{t('profile.units.imperialForm', 'Imperial (in, lb, °F)')}</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                  {t('profile.modal.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn-primary" disabled={loading || uploadingPhoto}>
                  {uploadingPhoto 
                    ? t('profile.modal.uploading', 'Uploading Photo...') 
                    : loading 
                      ? t('profile.modal.saving', 'Saving...') 
                      : t('profile.modal.save', 'Save Profile')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;