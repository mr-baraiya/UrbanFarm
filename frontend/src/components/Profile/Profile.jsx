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
  RiArrowRightLine
} from 'react-icons/ri';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, getBadges, uploadImage } from '../../services/authService';
import { getGardens, getPlants, getDiagnosisHistory, getCommunityPosts } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import Badges from './Badges';
import ProfileStats from './ProfileStats';
import BadgeEmblem from './BadgeEmblem';
import { GARDENING_LEVELS } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';
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
      const [badgesData, gardensData, plantsData, diagnosesData, postsData] = await Promise.all([
        getBadges(),
        getGardens(),
        getPlants(),
        getDiagnosisHistory(),
        getCommunityPosts(),
      ]);

      setBadges(badgesData || []);
      
      const currentUserId = user?._id || user?.id;
      const userPosts = Array.isArray(postsData) 
        ? postsData.filter(p => {
            const pUserId = (p.userId?._id || p.userId)?.toString();
            return currentUserId && pUserId === currentUserId.toString();
          })
        : [];

      const totalGardens = Array.isArray(gardensData) ? gardensData.length : 0;
      const totalPlants = Array.isArray(plantsData) ? plantsData.length : 0;
      const totalDiagnoses = Array.isArray(diagnosesData) ? diagnosesData.length : 0;
      const totalPosts = userPosts.length;
      const totalWatering = Array.isArray(plantsData) 
        ? plantsData.reduce((acc, p) => acc + (Array.isArray(p.wateringHistory) ? p.wateringHistory.length : 0), 0)
        : 0;
      const totalHarvests = Array.isArray(plantsData) 
        ? plantsData.filter(p => p.status === 'harvested' || (Array.isArray(p.harvestHistory) && p.harvestHistory.length > 0)).length 
        : 0;
      
      setStats({
        totalGardens,
        totalPlants,
        totalDiagnoses,
        totalCommunityPosts: totalPosts,
        totalWateringEvents: totalWatering,
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
        addNotification('Image size should be under 5MB', 'warning');
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
          addNotification('Failed to upload photo to Cloudinary', 'error');
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
      addNotification('Profile updated successfully! 🌱', 'success');
      setEditing(false);
      setSelectedFile(null);
    } catch (error) {
      addNotification('Update failed', 'error');
    } finally {
      setLoading(false);
      setUploadingPhoto(false);
    }
  };

  const urbanSpaceOptions = [
    { value: 'balcony', label: 'Balcony' },
    { value: 'rooftop', label: 'Rooftop' },
    { value: 'indoor', label: 'Indoor Window Sill' },
    { value: 'backyard', label: 'Backyard' },
    { value: 'community', label: 'Community Garden' },
    { value: 'windowsill', label: 'Window Sill' },
  ];

  const climateZoneOptions = [
    { value: 'tropical', label: 'Tropical' },
    { value: 'subtropical', label: 'Humid Subtropical' },
    { value: 'temperate', label: 'Temperate' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'continental', label: 'Continental' },
    { value: 'arctic', label: 'Arctic' },
  ];

  const userCity = user?.location?.city || 'Mumbai';
  const userCountry = user?.location?.country || 'India';
  const locationDisplay = `${userCity}, ${userCountry}`;

  const currentLevelLabel = GARDENING_LEVELS.find(l => l.value === user?.gardeningLevel)?.label || 'Intermediate';
  const currentSpaceLabel = urbanSpaceOptions.find(o => o.value === user?.urbanSpaceType)?.label || 'Balcony';
  const currentClimateLabel = climateZoneOptions.find(z => z.value === user?.climateZone)?.label || 'Humid Subtropical';

  const getTopBadgeData = () => {
    const unlockedBadges = BADGE_DEFINITIONS.filter(b => b.check(stats));
    if (unlockedBadges.length > 0) {
      return { 
        badge: unlockedBadges[0], 
        isUnlocked: true, 
        count: unlockedBadges.length 
      };
    }
    return { 
      badge: BADGE_DEFINITIONS[BADGE_DEFINITIONS.length - 2], 
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
              title="Click to edit profile photo"
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
                {user?.name || 'Priya Sharma'}'s Profile
              </h2>
              {topBadgeInfo.isUnlocked && (
                <div className="header-highest-badge-pill" style={{ '--pill-color': topBadgeInfo.badge.themeColor }}>
                  <RiTrophyLine /> Highest Badge: <strong>{topBadgeInfo.badge.name}</strong> ({topBadgeInfo.badge.tier})
                </div>
              )}
            </div>
            <div className="info-item">
              <span className="info-label">Language / ભાષા</span>
              <span className="info-value">
                {i18n.language === 'gu' ? 'ગુજરાતી (Gujarati)' : i18n.language === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
              </span>
            </div>
          </div>
          <button 
            className="btn-edit-profile"
            onClick={() => setEditing(true)}
          >
            <RiEditLine /> Edit Profile
          </button>
        </div>

        {/* Tabbed Profile Content Card */}
        <div className="profile-content-card">
          {/* Tab Navigation */}
          <div className="profile-tabs-nav">
            <button 
              className={`tab-nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              My Garden Stats
            </button>
            <button 
              className={`tab-nav-btn ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              My Achievements
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
                        <RiTrophyLine style={{ color: topBadgeInfo.badge.themeColor }} /> HIGHEST EARNED BADGE
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
                    <RiSparklingFill /> {topBadgeInfo.count} / {BADGE_DEFINITIONS.length} Unlocked
                  </div>
                  <button 
                    className="btn-view-all-badges"
                    onClick={() => setActiveTab('achievements')}
                  >
                    View All Badges <RiArrowRightLine />
                  </button>
                </div>
              </div>

              {/* My Info Section */}
              <div className="my-info-section">
                <h3 className="my-info-title">My Info</h3>
                <div className="my-info-grid">
                  <div className="info-col">
                    <div className="info-row">
                      <span className="info-key">Name</span>
                      <span className="info-val">{user?.name || 'Priya Sharma'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-key">Location</span>
                      <span className="info-val">{locationDisplay}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-key">Gardening Level</span>
                      <span className="info-val">{currentLevelLabel}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-key">Urban Space Type</span>
                      <span className="info-val">{currentSpaceLabel}</span>
                    </div>
                  </div>

                  <div className="info-col">
                    <div className="info-row">
                      <span className="info-key">Email</span>
                      <span className="info-val">{user?.email || 'priya@urbanfarm.com'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-key">Climate Zone</span>
                      <span className="info-val">{currentClimateLabel}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-key">Unit System</span>
                      <span className="info-val">
                        {user?.preferences?.unitSystem === 'imperial' ? 'Imperial (in, °F)' : 'Metric (cm, °C)'}
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
          <h3 className="rail-title">Upcoming & Urgent</h3>
          <div className="urgent-list">
            <div className="urgent-item">
              <div className="urgent-icon icon-blue">
                <RiDropLine />
              </div>
              <div className="urgent-meta">
                <span className="urgent-item-title">Watering Due</span>
                <span className="urgent-item-sub">Balcony Plants (Tomorrow AM)</span>
              </div>
            </div>

            <div className="urgent-item">
              <div className="urgent-icon icon-orange">
                <RiShoppingBasketLine />
              </div>
              <div className="urgent-meta">
                <span className="urgent-item-title">Harvest Ready</span>
                <span className="urgent-item-sub">Tomatoes (In 2 days)</span>
              </div>
            </div>

            <div className="urgent-item">
              <div className="urgent-icon icon-green">
                <RiMicroscopeLine />
              </div>
              <div className="urgent-meta">
                <span className="urgent-item-title">Diagnosis Recommended</span>
                <span className="urgent-item-sub">Basil (View Details)</span>
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
              <h3>Edit Profile</h3>
              <button className="close-btn" onClick={() => setEditing(false)}>
                <RiCloseLine />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              {/* Optional Photo Upload Section */}
              <div className="form-section photo-upload-section">
                <h4>Profile Photo (Optional)</h4>
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
                      <RiCameraLine /> {selectedFile || photoPreview ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {photoPreview && (
                      <button 
                        type="button" 
                        className="btn-remove-photo"
                        onClick={handleRemovePhoto}
                      >
                        <RiDeleteBinLine /> Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Location & Climate</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      name="location.country"
                      value={formData.location.country}
                      onChange={handleChange}
                      placeholder="e.g., India"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Climate Zone</label>
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
                <h4>Urban Garden Setup</h4>
                <div className="form-group">
                  <label>Primary Growing Space</label>
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
                <h4>Gardening Experience</h4>
                <div className="form-group">
                  <label>Skill Level</label>
                  <select
                    name="gardeningLevel"
                    value={formData.gardeningLevel}
                    onChange={handleChange}
                  >
                    {GARDENING_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h4>Preferences & Notifications</h4>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="preferences.showAdvancedTips"
                      checked={formData.preferences.showAdvancedTips}
                      onChange={handleChange}
                    />
                    <span>Show advanced gardening tips</span>
                  </label>
                </div>
                <div className="form-group">
                  <label>Unit System</label>
                  <select
                    name="preferences.unitSystem"
                    value={formData.preferences.unitSystem}
                    onChange={handleChange}
                  >
                    <option value="metric">Metric (cm, kg, °C)</option>
                    <option value="imperial">Imperial (in, lb, °F)</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading || uploadingPhoto}>
                  {uploadingPhoto ? 'Uploading Photo...' : loading ? 'Saving...' : 'Save Profile'}
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