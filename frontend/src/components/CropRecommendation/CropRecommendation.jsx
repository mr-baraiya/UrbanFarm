import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { addNotification } = useNotification();

  const [inputs, setInputs] = useState({
    soilType: 'Loam',
    ph: 6.5,
    temperature: 25,
    humidity: 60,
    rainfall: 100,
    season: 'Summer',
    region: 'Temperate Zone',
    gardenType: 'container',
    spaceAvailable: 'medium',
    targetCrop: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [soilAnalysis, setSoilAnalysis] = useState(null);
  const [targetCropCheck, setTargetCropCheck] = useState(null);
  const [gardens, setGardens] = useState([]);
  const [selectedCropForAdd, setSelectedCropForAdd] = useState(null);
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

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

  const loadHistory = async () => {
    try {
      const data = await getRecommendationHistory();
      setHistory(data || []);
      setFilteredHistory(data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  useEffect(() => {
    applyHistoryFilters();
  }, [history, searchTerm, filterType]);

  const applyHistoryFilters = () => {
    let filtered = [...history];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(h => {
        const soil = (h.inputData?.soilType || '').toLowerCase();
        const season = (h.inputData?.season || '').toLowerCase();
        const hasCropMatch = h.recommendations?.some(r => 
          (r.cropName || '').toLowerCase().includes(term)
        );
        return soil.includes(term) || season.includes(term) || hasCropMatch;
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

  const validateInputs = () => {
    const errs = {};
    if (!inputs.soilType) {
      errs.soilType = 'Soil type is required.';
    }
    const phVal = parseFloat(inputs.ph);
    if (isNaN(phVal) || phVal < 3.5 || phVal > 9.5) {
      errs.ph = 'Soil pH must be between 3.5 (highly acidic) and 9.5 (strongly alkaline).';
    }
    const tempVal = parseFloat(inputs.temperature);
    if (isNaN(tempVal) || tempVal < -20 || tempVal > 60) {
      errs.temperature = 'Temperature must be between -20°C and 60°C.';
    }
    const humVal = parseFloat(inputs.humidity);
    if (isNaN(humVal) || humVal < 0 || humVal > 100) {
      errs.humidity = 'Humidity must be between 0% and 100%.';
    }
    const rainVal = parseFloat(inputs.rainfall);
    if (isNaN(rainVal) || rainVal < 0 || rainVal > 5000) {
      errs.rainfall = 'Rainfall must be between 0mm and 5000mm.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handlePresetSelect = (preset) => {
    setInputs(prev => ({
      ...prev,
      ...preset.inputs,
      gardenType: preset.id,
    }));
    setFormErrors({});
    addNotification(t('crops.loadedPreset', { name: preset.label }), 'info');
  };

  const handleUseLocation = async () => {
    setLoadingLocation(true);
    try {
      let city = user?.location?.city || 'London';
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
      console.error('Failed to get location weather:', error);
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
    if (e) e.preventDefault();
    if (!validateInputs()) {
      addNotification('Please resolve input errors before submitting.', 'warning');
      return;
    }

    setLoading(true);
    setApiError(null);
    setRecommendations([]);
    setSoilAnalysis(null);
    setTargetCropCheck(null);

    try {
      const data = await getCropRecommendations(inputs);
      setRecommendations(data.recommendations || []);
      setSoilAnalysis(data.soilAnalysis || null);
      setTargetCropCheck(data.targetCropCheck || null);
      addNotification(t('crops.recommendationsReady', 'Recommendations generated via Gemini AI!'), 'success');
      loadHistory();
    } catch (error) {
      console.error('Crop AI call failed:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to get crop recommendations from Gemini AI.';
      setApiError(msg);
      addNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item) => {
    setSelectedHistory(item);
    setRecommendations(item.recommendations || []);
    setSoilAnalysis(null);
    setTargetCropCheck(null);
    setApiError(null);
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
      addNotification(t('crops.saveFailed', 'Failed to save bookmark.'), 'error');
    }
  };

  const handleAddToPlants = (crop) => {
    setSelectedCropForAdd({
      name: crop.cropName,
      variety: '',
      notes: crop.plantingTips ? `AI Recommendation: ${crop.plantingTips}` : `Recommended by Gemini for ${inputs.soilType} soil.`,
      waterFrequency: 3,
      sunlight: 'full',
      status: 'seedling',
    });
  };

  return (
    <div className="crop-recommendation">
      <div className="crop-page-header">
        <span className="crop-header-badge">Gemini Agronomy Intelligence</span>
        <h2>{t('crops.title', 'AI Crop Recommendations')}</h2>
        <p className="subtitle">
          {t('crops.subtitle', 'Get science-backed crop choices tailored directly to your soil chemistry, climate, and space.')}
        </p>
      </div>
      
      <div className="crop-layout">
        {/* Left Column - Form & Results */}
        <div className="crop-left">
          {/* Urban Presets */}
          <UrbanPresets onSelect={handlePresetSelect} currentPreset={inputs.gardenType} />
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="crop-form" noValidate>
            <div className="form-header">
              <h4>{t('crops.enterConditions', 'Soil & Growing Conditions')}</h4>
              <button 
                type="button" 
                className="location-btn"
                onClick={handleUseLocation}
                disabled={loadingLocation}
              >
                {loadingLocation ? t('crops.detectingLocation', 'Detecting Climate...') : t('crops.useMyLocation', 'Autofill Climate')}
              </button>
            </div>
            
            {/* Soil Type and pH */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="soilType-select">
                  {t('crops.soilType', 'Soil Type')} <span className="req-star">*</span>
                </label>
                <select 
                  id="soilType-select"
                  name="soilType" 
                  value={inputs.soilType} 
                  onChange={handleChange}
                  className={formErrors.soilType ? 'input-error' : ''}
                >
                  <option value="Loam">Loam (Balanced, rich, versatile)</option>
                  <option value="Sandy">Sandy (Fast draining, light, warms fast)</option>
                  <option value="Clay">Clay (Heavy, dense, moisture & nutrient rich)</option>
                  <option value="Silty">Silty (Smooth, highly fertile, compacts easily)</option>
                  <option value="Peaty">Peaty (Acidic, dark, high organic matter)</option>
                  <option value="Chalky">Chalky (Alkaline, stony, free-draining)</option>
                  <option value="Sandy Loam">Sandy Loam (Aerated & fertile)</option>
                  <option value="Potting Mix">Potting Mix (Container substrate)</option>
                </select>
                {formErrors.soilType && <span className="inline-err">{formErrors.soilType}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="ph-input">
                  {t('crops.phLevel', 'Soil pH Level')} <span className="req-star">*</span>
                </label>
                <input 
                  id="ph-input"
                  name="ph" 
                  type="number" 
                  step="0.1" 
                  min="3.5" 
                  max="9.5" 
                  value={inputs.ph} 
                  onChange={handleChange} 
                  className={formErrors.ph ? 'input-error' : ''}
                />
                {formErrors.ph && <span className="inline-err">{formErrors.ph}</span>}
              </div>
            </div>
            
            {/* Climate Parameters */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="temp-input">{t('crops.temperature', 'Temperature (°C)')}</label>
                <input 
                  id="temp-input"
                  name="temperature" 
                  type="number" 
                  min="-20"
                  max="60"
                  value={inputs.temperature} 
                  onChange={handleChange} 
                  className={formErrors.temperature ? 'input-error' : ''}
                />
                {formErrors.temperature && <span className="inline-err">{formErrors.temperature}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="hum-input">{t('crops.humidity', 'Humidity (%)')}</label>
                <input 
                  id="hum-input"
                  name="humidity" 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={inputs.humidity} 
                  onChange={handleChange} 
                  className={formErrors.humidity ? 'input-error' : ''}
                />
                {formErrors.humidity && <span className="inline-err">{formErrors.humidity}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rain-input">{t('crops.rainfall', 'Rainfall / Water (mm)')}</label>
                <input 
                  id="rain-input"
                  name="rainfall" 
                  type="number" 
                  min="0" 
                  max="5000"
                  value={inputs.rainfall} 
                  onChange={handleChange} 
                  className={formErrors.rainfall ? 'input-error' : ''}
                />
                {formErrors.rainfall && <span className="inline-err">{formErrors.rainfall}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="season-select">{t('crops.season', 'Growing Season')}</label>
                <select id="season-select" name="season" value={inputs.season} onChange={handleChange}>
                  <option value="Spring">{t('crops.seasonSpring', 'Spring')}</option>
                  <option value="Summer">{t('crops.seasonSummer', 'Summer')}</option>
                  <option value="Fall">{t('crops.seasonFall', 'Fall / Autumn')}</option>
                  <option value="Winter">{t('crops.seasonWinter', 'Winter')}</option>
                </select>
              </div>
            </div>

            {/* Inquire about a specific crop to test soil validation */}
            <div className="form-group highlight-input-group">
              <label htmlFor="targetCrop-input">
                Evaluate Specific Crop Compatibility (Optional):
              </label>
              <input 
                id="targetCrop-input"
                name="targetCrop" 
                value={inputs.targetCrop} 
                onChange={handleChange} 
                placeholder="e.g., Carrot, Cabbage, Blueberry, Watermelon"
              />
              <span className="field-hint">
                Tests whether this specific crop can thrive in your chosen {inputs.soilType} soil (pH {inputs.ph}).
              </span>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="region-input">{t('crops.region', 'Region / Environment')}</label>
                <input 
                  id="region-input"
                  name="region" 
                  value={inputs.region} 
                  onChange={handleChange} 
                  placeholder="e.g., Urban Balcony, Suburban Backyard"
                />
              </div>

              <div className="form-group">
                <label htmlFor="space-select">{t('crops.spaceAvailable', 'Available Space')}</label>
                <select id="space-select" name="spaceAvailable" value={inputs.spaceAvailable} onChange={handleChange}>
                  <option value="small">{t('crops.spaceSmall', 'Small (Window box, container pot)')}</option>
                  <option value="medium">{t('crops.spaceMedium', 'Medium (Balcony, small raised bed)')}</option>
                  <option value="large">{t('crops.spaceLarge', 'Large (Rooftop, garden plot)')}</option>
                </select>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary submit-btn" 
              disabled={loading}
            >
              {loading ? t('crops.generating', 'Analyzing Soil & Calling Gemini AI...') : t('crops.getRecommendations', 'Get AI Crop Recommendations')}
            </button>
          </form>

          {/* Loading Shimmer State */}
          {loading && (
            <div className="crop-loading-banner">
              <span className="crop-pulse-dot" />
              <div className="loading-text-col">
                <strong>Consulting Gemini Agronomy Engine...</strong>
                <span>Evaluating {inputs.soilType} soil traits, pH {inputs.ph}, and climatic suitability.</span>
              </div>
            </div>
          )}

          {/* Error & Retry State */}
          {apiError && !loading && (
            <div className="crop-api-error-card">
              <span className="error-tag">Agronomy Service Error</span>
              <p className="error-message">{apiError}</p>
              <button 
                type="button" 
                className="btn-retry" 
                onClick={() => handleSubmit()}
              >
                Retry Analysis
              </button>
            </div>
          )}

          {/* Soil Analysis Spotlight Card */}
          {soilAnalysis && (
            <div className="soil-analysis-card">
              <div className="soil-analysis-header">
                <span className="soil-badge">Soil Profile</span>
                <h4>{soilAnalysis.soilType} Soil Assessment (pH {soilAnalysis.ph})</h4>
              </div>
              <p className="soil-drainage-text">
                <strong>Characteristics:</strong> {soilAnalysis.drainageAndTexture || soilAnalysis.characteristics}
              </p>
              <p className="soil-tip-text">
                <strong>Agronomic Advice:</strong> {soilAnalysis.soilManagementTip || soilAnalysis.soilAdvice || 'Ensure adequate compost incorporation.'}
              </p>
            </div>
          )}

          {/* Target Crop Validation Card */}
          {targetCropCheck && (
            <div className={`target-crop-result-card ${targetCropCheck.isSuitable ? 'suitable' : 'unsuitable'}`}>
              <div className="target-result-header">
                <span className={`target-suitability-pill ${targetCropCheck.isSuitable ? 'pass' : 'fail'}`}>
                  {targetCropCheck.isSuitable ? 'Suitable Match' : 'Soil Mismatch Warning'}
                </span>
                <h4>Evaluation for "{targetCropCheck.cropName}" in {inputs.soilType} Soil</h4>
              </div>

              <p className="target-explanation">
                {targetCropCheck.soilMismatchReason}
              </p>

              {!targetCropCheck.isSuitable && targetCropCheck.suggestedAlternatives?.length > 0 && (
                <div className="target-alternatives-box">
                  <span className="alt-title">Recommended Alternatives for {inputs.soilType} Soil:</span>
                  <div className="alt-chips-row">
                    {targetCropCheck.suggestedAlternatives.map((alt, idx) => (
                      <span key={idx} className="alt-chip">{alt}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Grid */}
          {recommendations.length > 0 && (
            <div className="crop-results">
              <div className="results-header">
                <h4>{t('crops.recommendationsTitle', 'Recommended Crops')}</h4>
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
                    existingPlants={[]}
                    onAddToPlants={() => handleAddToPlants(crop)}
                  />
                ))}
              </div>
              {selectedHistory && (
                <div className="crop-history-detail">
                  <button 
                    type="button"
                    className="btn-secondary" 
                    onClick={() => {
                      setSelectedHistory(null);
                      setRecommendations([]);
                    }}
                  >
                    {t('crops.closeHistory', 'Close History View')}
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