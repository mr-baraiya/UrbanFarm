import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiUser3Line, 
  RiEditLine, 
  RiCloseLine, 
  RiLightbulbLine,
  RiMapPinLine,
  RiSunLine,
  RiBuilding4Line,
  RiAwardLine,
  RiDropLine,
  RiMicroscopeLine,
  RiTeamLine,
  RiSunCloudyLine
} from 'react-icons/ri';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, getBadges } from '../../services/authService';
import { getGardens, getPlants, getDiagnosisHistory } from '../../services/plantService';
import { getCommunityPosts } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import Badges from './Badges';
import ProfileStats from './ProfileStats';
import { GARDENING_LEVELS } from '../../utils/constants';
import './Profile.css';

const Profile = () => {
  const { i18n, t } = useTranslation();
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: {
      city: user?.location?.city || '',
      country: user?.location?.country || '',
      timezone: user?.location?.timezone || '',
    },
    gardeningLevel: user?.gardeningLevel || 'beginner',
    urbanSpaceType: user?.urbanSpaceType || 'balcony',
    climateZone: user?.climateZone || '',
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
  }, []);

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
      
      // Calculate stats
      const totalPlants = plantsData?.length || 0;
      const totalDiagnoses = diagnosesData?.length || 0;
      
      setStats({
        totalGardens: gardensData?.length || 0,
        totalPlants: totalPlants,
        totalDiagnoses: totalDiagnoses,
        totalCommunityPosts: postsData?.length || 0,
        totalWateringEvents: 0,
        totalHarvests: plantsData?.filter(p => p.status === 'harvested').length || 0,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateProfile(formData);
      login(updated, localStorage.getItem('token'));
      addNotification('Profile updated successfully! 🌱', 'success');
      setEditing(false);
    } catch (error) {
      addNotification('Update failed', 'error');
    } finally {
      setLoading(false);
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
    { value: 'tropical', label: 'Tropical (Zone 10-11)' },
    { value: 'subtropical', label: 'Subtropical (Zone 9-10)' },
    { value: 'temperate', label: 'Temperate (Zone 7-8)' },
    { value: 'mediterranean', label: 'Mediterranean (Zone 9)' },
    { value: 'continental', label: 'Continental (Zone 5-6)' },
    { value: 'arctic', label: 'Arctic (Zone 1-4)' },
  ];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>
          <RiUser3Line className="profile-header-icon" /> My Profile
        </h2>
        <button 
          className={`btn-edit ${editing ? 'active' : ''}`}
          onClick={() => setEditing(!editing)}
        >
          {editing ? (
            <><RiCloseLine /> Cancel</>
          ) : (
            <><RiEditLine /> Edit Profile</>
          )}
        </button>
      </div>

      {/* Profile Stats */}
      <ProfileStats stats={stats} />

      {!editing ? (
        <div className="profile-view">
          <div className="profile-info-grid">
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value">{user?.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Location</span>
              <span className="info-value">
                {user?.location?.city || 'Not set'}
                {user?.location?.country && `, ${user.location.country}`}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Climate Zone</span>
              <span className="info-value">{user?.climateZone || 'Not set'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Urban Space Type</span>
              <span className="info-value">
                {urbanSpaceOptions.find(o => o.value === user?.urbanSpaceType)?.label || 'Not set'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Gardening Level</span>
              <span className="info-value">
                {GARDENING_LEVELS.find(l => l.value === user?.gardeningLevel)?.label || 'Beginner'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Language / ભાષા</span>
              <span className="info-value">
                {i18n.language === 'gu' ? 'ગુજરાતી (Gujarati)' : i18n.language === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
              </span>
            </div>
          </div>

          {user?.preferences?.showAdvancedTips && (
            <div className="profile-tip">
              <RiLightbulbLine className="tip-icon" /> Advanced tips are enabled
            </div>
          )}
        </div>
      ) : (

        <form onSubmit={handleSubmit} className="profile-form">
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
                  placeholder="e.g., Rajkot"
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
                <option value="">Select your climate zone</option>
                {climateZoneOptions.map((zone) => (
                  <option key={zone.value} value={zone.value}>
                    {zone.label}
                  </option>
                ))}
              </select>
              <small>This helps tailor plant recommendations to your region</small>
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
              <small>This helps tailor plant suggestions to your space</small>
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
              <small>Affects how detailed AI tips and guides appear</small>
            </div>
          </div>

          <div className="form-section">
            <h4>Preferences & Language</h4>
            <div className="form-group">
              <label>Application Language / ભાષા પસંદગી</label>
              <select
                value={i18n.language || 'en'}
                onChange={(e) => {
                  const newLang = e.target.value;
                  i18n.changeLanguage(newLang);
                  localStorage.setItem('language', newLang);
                  localStorage.setItem('has_chosen_language', 'true');
                  document.documentElement.lang = newLang;
                }}
              >
                <option value="en">English</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="preferences.showAdvancedTips"
                  checked={formData.preferences.showAdvancedTips}
                  onChange={handleChange}
                />
                Show advanced gardening tips and techniques
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

          <div className="form-section">
            <h4>Notifications</h4>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="notification.wateringReminders"
                  checked={formData.preferences.notificationPreferences.wateringReminders}
                  onChange={handleChange}
                />
                <RiDropLine className="checkbox-icon text-blue" /> Watering reminders
              </label>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="notification.diagnosisAlerts"
                  checked={formData.preferences.notificationPreferences.diagnosisAlerts}
                  onChange={handleChange}
                />
                <RiMicroscopeLine className="checkbox-icon text-purple" /> Diagnosis alerts
              </label>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="notification.communityUpdates"
                  checked={formData.preferences.notificationPreferences.communityUpdates}
                  onChange={handleChange}
                />
                <RiTeamLine className="checkbox-icon text-indigo" /> Community updates
              </label>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="notification.weatherAlerts"
                  checked={formData.preferences.notificationPreferences.weatherAlerts}
                  onChange={handleChange}
                />
                <RiSunCloudyLine className="checkbox-icon text-amber" /> Weather alerts
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}

      {/* Badges Section */}
      <Badges badges={badges} />
    </div>
  );
};

export default Profile;