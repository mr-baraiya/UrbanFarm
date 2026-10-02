import React, { useState, useEffect } from 'react';
import { 
  RiPlantLine, 
  RiFileList3Line, 
  RiMapPinLine, 
  RiLoader4Line, 
  RiSparklingLine, 
  RiSeedlingLine,
  RiStarFill
} from 'react-icons/ri';
import { getCropRecommendations, getRecommendationHistory, saveRecommendation, addPlant } from '../../services/plantService';
import { getWeather } from '../../services/weatherService';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import CropCard from './CropCard';
import CropHistory from './CropHistory';
import UrbanPresets from './UrbanPresets';
import './CropRecommendation.css';

const CropRecommendation = () => {
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
  }, []);

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
      filtered = filtered.filter(h => 
        h.inputData?.soilType?.toLowerCase().includes(term) ||
        h.inputData?.season?.toLowerCase().includes(term) ||
        h.recommendations?.some(r => r.cropName.toLowerCase().includes(term))
      );
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
    addNotification(`Loaded preset: ${preset.label}`, 'info');
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
        
        addNotification(`Weather data loaded for ${city}!`, 'success');
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      addNotification('Could not auto-detect location. Please enter manually.', 'warning');
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
      addNotification('Recommendations ready!', 'success');
      loadHistory(); // Refresh history
    } catch (error) {
      addNotification('Failed to get recommendations', 'error');
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
      addNotification('Recommendation saved to bookmarks!', 'success');
      loadHistory();
    } catch (error) {
      addNotification('Failed to save', 'error');
    }
  };

  const handleAddToPlants = async (crop, historyId) => {
    try {
      // Get the garden ID from the recommendation or use the first garden
      // For now, we'll use a prompt to select a garden
      const gardenId = prompt('Enter the garden ID to add this plant to:');
      if (!gardenId) return;
      
      await addPlant({
        name: crop.cropName,
        variety: crop.variety || '',
        gardenId: gardenId,
        plantingDate: new Date().toISOString().split('T')[0],
        status: 'seedling',
        waterFrequency: 3,
        sunlight: 'full',
        notes: crop.plantingTips || `Recommended by AI. ${crop.reason}`,
      });
      
      addNotification(`Added ${crop.cropName} to your garden!`, 'success');
    } catch (error) {
      addNotification('Failed to add plant', 'error');
    }
  };

  return (
    <div className="crop-recommendation">
      <h2>
        <RiPlantLine className="header-icon" /> AI Crop Recommendations
      </h2>
      <p className="subtitle">Get personalized crop suggestions for your urban space</p>
      
      <div className="crop-layout">
        {/* Left Column - Form & Results */}
        <div className="crop-left">
          {/* Urban Presets */}
          <UrbanPresets onSelect={handlePresetSelect} currentPreset={inputs.gardenType} />
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="crop-form">
            <div className="form-header">
              <h4>
                <RiFileList3Line className="form-header-icon" /> Enter Your Conditions
              </h4>
              <button 
                type="button" 
                className="btn-secondary location-btn"
                onClick={handleUseLocation}
                disabled={loadingLocation}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                {loadingLocation ? (
                  <><RiLoader4Line className="spin" /> Detecting Location...</>
                ) : (
                  <><RiMapPinLine /> Use My Location</>
                )}
              </button>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Soil Type</label>
                <select name="soilType" value={inputs.soilType} onChange={handleChange}>
                  <option value="Loam">Loam</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Clay">Clay</option>
                  <option value="Silty">Silty</option>
                  <option value="Peaty">Peaty</option>
                  <option value="Chalky">Chalky</option>
                </select>
              </div>
              <div className="form-group">
                <label>pH Level</label>
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
                <label>Temperature (°C)</label>
                <input 
                  name="temperature" 
                  type="number" 
                  value={inputs.temperature} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group">
                <label>Humidity (%)</label>
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
                <label>Rainfall (mm)</label>
                <input 
                  name="rainfall" 
                  type="number" 
                  min="0" 
                  value={inputs.rainfall} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group">
                <label>Season</label>
                <select name="season" value={inputs.season} onChange={handleChange}>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                  <option value="Winter">Winter</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Region</label>
              <input 
                name="region" 
                value={inputs.region} 
                onChange={handleChange} 
                placeholder="e.g., New York, London, Tokyo"
              />
            </div>
            
            <div className="form-group">
              <label>Space Available</label>
              <select name="spaceAvailable" value={inputs.spaceAvailable} onChange={handleChange}>
                <option value="small">Small (Window box, herb pot)</option>
                <option value="medium">Medium (Balcony, small raised bed)</option>
                <option value="large">Large (Rooftop, backyard)</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary submit-btn" 
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              {loading ? (
                <><RiLoader4Line className="spin" /> Generating Recommendations...</>
              ) : (
                <><RiSparklingLine /> Get Recommendations</>
              )}
            </button>
          </form>

          {/* Results */}
          {recommendations.length > 0 && (
            <div className="crop-results">
              <div className="results-header">
                <h4>
                  <RiSeedlingLine className="results-icon" /> Recommendations
                </h4>
                <span className="result-count">{recommendations.length} crops found</span>
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
                    Close History
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
    </div>
  );
};

export default CropRecommendation;