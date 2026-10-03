import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiPlantLine, 
  RiFileList3Line, 
  RiMapPinLine, 
  RiLoader4Line, 
  RiSparklingLine, 
  RiSeedlingLine,
  RiStarFill
} from 'react-icons/ri';
import { getCropRecommendations, getRecommendationHistory, saveRecommendation, addPlant, getGardens } from '../../services/plantService';
import { getWeather } from '../../services/weatherService';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import CropCard from './CropCard';
import CropHistory from './CropHistory';
import UrbanPresets from './UrbanPresets';
import PlantForm from '../GrowthTracker/PlantForm';
import './CropRecommendation.css';

const CropRecommendation = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [inputs, setInputs] = useState({
    soilType: 'Loam',
    ph: 6.5,
    temperature: 25,
    humidity: 60,
    rainfall: 100,
    season: 'Summer',
    region: 'Temperate',
    gardenType: 'container', // balcony, raised_bed, rooftop
    spaceAvailable: 'medium', // small, medium, large
  });
  const [recommendations, setRecommendations] = useState([]);
  const [gardens, setGardens] = useState([]);
  const [selectedCropForAdd, setSelectedCropForAdd] = useState(null);
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { addNotification } = useNotification();

  useEffect(() => {
    loadHistory();
    loadGardens();
  }, []);

  const loadGardens = async () => {
    try {
      const data = await getGardens();
      setGardens(data || []);
    } catch (err) {
      console.error('Failed to load gardens:', err);
    }
  };

  useEffect(() => {
    applyHistoryFilters();
  }, [history, searchTerm, filterType]);

  const loadHistory = async () => {
    try {
      const data = await getRecommendationHistory();
      setHistory(data || []);
      setFilteredHistory(data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const applyHistoryFilters = () => {
    let filtered = [...history];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(h => {
        const soil = (h.inputData?.soilType || '').toLowerCase();
        const localizedSoil = getLocalizedDynamicText(h.inputData?.soilType, i18n.language).toLowerCase();
        const season = (h.inputData?.season || '').toLowerCase();
        const localizedSeason = getLocalizedDynamicText(h.inputData?.season, i18n.language).toLowerCase();
        const hasCropMatch = h.recommendations?.some(r => {
          const cName = (r.cropName || '').toLowerCase();
          const localizedCName = getLocalizedDynamicText(r.cropName, i18n.language).toLowerCase();
          return cName.includes(term) || localizedCName.includes(term);
        });
        return soil.includes(term) || localizedSoil.includes(term) || season.includes(term) || localizedSeason.includes(term) || hasCropMatch;
      });
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(h => {
        if (filterType === 'saved') return h.saved;
        return true;
      });
    }
    
    setFilteredHistory(filtered);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handlePresetSelect = (preset) => {
    setInputs({
      ...inputs,
      ...preset.inputs,
      gardenType: preset.id,
    });
    addNotification(t('crops.loadedPreset', { name: preset.label }), 'info');
  };

  const handleUseLocation = async () => {
    setLoadingLocation(true);
    try {
      // Get user's location from profile or browser
      let city = user?.location?.city;
      
      if (!city) {
        // Try to get from browser geolocation
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const { latitude, longitude } = position.coords;
        // Reverse geocode or use coordinates
        // For now, we'll use a default
        city = 'London';
      }
      
      const weatherData = await getWeather(city);
      
      if (weatherData) {
        const temp = Math.round(weatherData.main?.temp || 25);
        const humidity = Math.round(weatherData.main?.humidity || 60);
        const season = getSeason();
        
        setInputs(prev => ({
          ...prev,
          temperature: temp,
          humidity: humidity,
          season: season,
          region: city,
        }));
        
        addNotification(t('crops.weatherLoaded', { city }), 'success');
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      addNotification(t('crops.locationError', 'Could not auto-detect location. Please enter manually.'), 'warning');
    } finally {
      setLoadingLocation(false);
    }
  };

  const getSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await getCropRecommendations(inputs);
      setRecommendations(data.recommendations || []);
      addNotification(t('crops.recommendationsReady', 'Recommendations ready!'), 'success');
      loadHistory(); // Refresh history
    } catch (error) {
      addNotification(t('crops.recommendationsFailed', 'Failed to get recommendations'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item) => {
    setSelectedHistory(item);
    setRecommendations(item.recommendations || []);
    // Reload the parameters into the form
    if (item.inputData) {
      setInputs(prev => ({
        ...prev,
        ...item.inputData,
      }));
    }
  };

  const handleSaveRecommendation = async (historyId) => {
    try {
      await saveRecommendation(historyId);
      addNotification(t('crops.savedBookmark', 'Recommendation saved to bookmarks!'), 'success');
      loadHistory();
    } catch (error) {
      addNotification(t('crops.saveFailed', 'Failed to save'), 'error');
    }
  };

  const handleAddToPlants = (crop) => {
    setSelectedCropForAdd({
      name: crop.cropName,
      variety: crop.variety || '',
      notes: crop.plantingTips ? `AI Recommendation: ${crop.plantingTips}` : `Recommended by AI. ${crop.reason || ''}`,
      waterFrequency: 3,
      sunlight: 'full',
      status: 'seedling',
    });
  };

  return (
    <div className="crop-recommendation">
      <h2>
        <RiPlantLine className="header-icon" /> {t('crops.title', 'AI Crop Recommendations')}
      </h2>
      <p className="subtitle">{t('crops.subtitle', 'Get personalized crop suggestions for your urban space')}</p>
      
      <div className="crop-layout">
        {/* Left Column - Form & Results */}
        <div className="crop-left">
          {/* Urban Presets */}
          <UrbanPresets onSelect={handlePresetSelect} currentPreset={inputs.gardenType} />
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="crop-form">
            <div className="form-header">
              <h4>
                <RiFileList3Line className="form-header-icon" /> {t('crops.enterConditions', 'Enter Your Conditions')}
              </h4>
              <button 
                type="button" 
                className="location-btn"
                onClick={handleUseLocation}
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <><RiLoader4Line className="spin" /> {t('crops.detectingLocation', 'Detecting Location...')}</>
                ) : (
                  <><RiMapPinLine /> {t('crops.useMyLocation', 'Use My Location')}</>
                )}
              </button>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>{t('crops.soilType', 'Soil Type')}</label>
                <select name="soilType" value={inputs.soilType} onChange={handleChange}>
                  <option value="Loam">{t('crops.soilLoam', 'Loam')}</option>
                  <option value="Sandy">{t('crops.soilSandy', 'Sandy')}</option>
                  <option value="Clay">{t('crops.soilClay', 'Clay')}</option>
                  <option value="Silty">{t('crops.soilSilty', 'Silty')}</option>
                  <option value="Peaty">{t('crops.soilPeaty', 'Peaty')}</option>
                  <option value="Chalky">{t('crops.soilChalky', 'Chalky')}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('crops.phLevel', 'pH Level')}</label>
                <input 
                  name="ph" 
                  type="number" 
                  step="0.1" 
                  min="4" 
                  max="9" 
                  value={inputs.ph} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>{t('crops.temperature', 'Temperature (°C)')}</label>
                <input 
                  name="temperature" 
                  type="number" 
                  value={inputs.temperature} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group">
                <label>{t('crops.humidity', 'Humidity (%)')}</label>
                <input 
                  name="humidity" 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={inputs.humidity} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>{t('crops.rainfall', 'Rainfall (mm)')}</label>
                <input 
                  name="rainfall" 
                  type="number" 
                  min="0" 
                  value={inputs.rainfall} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group">
                <label>{t('crops.season', 'Season')}</label>
                <select name="season" value={inputs.season} onChange={handleChange}>
                  <option value="Spring">{t('crops.seasonSpring', 'Spring')}</option>
                  <option value="Summer">{t('crops.seasonSummer', 'Summer')}</option>
                  <option value="Fall">{t('crops.seasonFall', 'Fall')}</option>
                  <option value="Winter">{t('crops.seasonWinter', 'Winter')}</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>{t('crops.region', 'Region')}</label>
              <input 
                name="region" 
                value={inputs.region} 
                onChange={handleChange} 
                placeholder={t('crops.regionPlaceholder', 'e.g., New York, London, Tokyo')}
              />
            </div>
            
            <div className="form-group">
              <label>{t('crops.spaceAvailable', 'Space Available')}</label>
              <select name="spaceAvailable" value={inputs.spaceAvailable} onChange={handleChange}>
                <option value="small">{t('crops.spaceSmall', 'Small (Window box, herb pot)')}</option>
                <option value="medium">{t('crops.spaceMedium', 'Medium (Balcony, small raised bed)')}</option>
                <option value="large">{t('crops.spaceLarge', 'Large (Rooftop, backyard)')}</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary submit-btn" 
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              {loading ? (
                <><RiLoader4Line className="spin" /> {t('crops.generating', 'Generating Recommendations...')}</>
              ) : (
                <><RiSparklingLine /> {t('crops.getRecommendations', 'Get Recommendations')}</>
              )}
            </button>
          </form>

          {/* Results */}
          {recommendations.length > 0 && (
            <div className="crop-results">
              <div className="results-header">
                <h4>
                  <RiSeedlingLine className="results-icon" /> {t('crops.recommendationsTitle', 'Recommendations')}
                </h4>
                <span className="result-count">
                  {t('crops.cropsFound', '{{count}} crops found', { count: recommendations.length })}
                </span>
              </div>
              <div className="crop-grid">
                {recommendations.map((crop, idx) => (
                  <CropCard 
                    key={idx} 
                    crop={crop} 
                    spaceAvailable={inputs.spaceAvailable}
                    existingPlants={[]} // Could pass existing plants for companion planting
                    onAddToPlants={() => handleAddToPlants(crop, selectedHistory?._id)}
                  />
                ))}
              </div>
              {selectedHistory && (
                <div className="crop-history-detail">
                  <button className="btn-secondary" onClick={() => {
                    setSelectedHistory(null);
                    setRecommendations([]);
                  }}>
                    {t('crops.closeHistory', 'Close History')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - History */}
        <div className="crop-right">
          <CropHistory 
            history={filteredHistory}
            onItemClick={handleHistoryClick}
            selectedId={selectedHistory?._id}
            onSave={handleSaveRecommendation}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterType={filterType}
            onFilterChange={setFilterType}
          />
        </div>
      </div>

      {selectedCropForAdd && (
        <PlantForm
          plant={selectedCropForAdd}
          gardens={gardens}
          onClose={() => setSelectedCropForAdd(null)}
          onSubmit={async (plantPayload) => {
            try {
              await addPlant(plantPayload);
              addNotification(t('crops.addedToGarden', { name: getLocalizedDynamicText(plantPayload.name, i18n.language) }), 'success');
              setSelectedCropForAdd(null);
            } catch (err) {
              addNotification(t('crops.addFailed', 'Failed to add plant'), 'error');
            }
          }}
        />
      )}
    </div>
  );
};

export default CropRecommendation;