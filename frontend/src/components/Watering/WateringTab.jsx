import React, { useState, useEffect } from 'react';
import { 
  RiDropLine, 
  RiRefreshLine, 
  RiLoader4Line, 
  RiFlashlightLine, 
  RiSunLine, 
  RiRainyLine, 
  RiCheckLine,
  RiHistoryLine,
  RiCloseLine
} from 'react-icons/ri';
import { getPlants, generateWateringSchedule, getWateringSchedules, updateWateringSchedule } from '../../services/plantService';
import { getWeather, getForecast } from '../../services/weatherService';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import WateringSchedule from './WateringSchedule';
import WateringHistory from './WateringHistory';
import WeatherWidget from './WeatherWidget';
import './WateringTab.css';

const WateringTab = () => {
  const { user } = useAuth();
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const { addNotification } = useNotification();

  useEffect(() => {
    loadData();
    fetchWeather();
  }, [user]);

  useEffect(() => {
    applyHistoryFilters();
  }, [history, filterStatus]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [plantsData, schedulesData] = await Promise.all([
        getPlants(),
        getWateringSchedules(),
      ]);
      setPlants(plantsData || []);
      setHistory(schedulesData || []);
      setFilteredHistory(schedulesData || []);
      if (plantsData.length > 0) setSelectedPlant(plantsData[0]);
    } catch (error) {
      console.error('Failed to load data:', error);
      addNotification('Failed to load data', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchWeather = async () => {
    setLoadingWeather(true);
    try {
      const city = user?.location?.city || 'London';
      const [weather, forecast] = await Promise.all([
        getWeather(city),
        getForecast(city),
      ]);
      setWeatherData(weather);
      setForecastData(forecast);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const applyHistoryFilters = () => {
    let filtered = [...history];
    
    if (filterStatus === 'completed') {
      filtered = filtered.filter(h => h.isCompleted);
    } else if (filterStatus === 'missed') {
      filtered = filtered.filter(h => h.isMissed);
    } else if (filterStatus === 'skipped') {
      filtered = filtered.filter(h => h.isSkipped);
    }
    
    setFilteredHistory(filtered);
  };

  const handleGenerate = async () => {
    if (!selectedPlant) return;
    setLoading(true);
    try {
      const sched = await generateWateringSchedule(selectedPlant._id);
      setSchedule(sched);
      setSelectedHistory(null);
      addNotification('Watering schedule generated successfully!', 'success');
      loadData();
    } catch (error) {
      addNotification('Failed to generate schedule', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item) => {
    setSelectedHistory(item);
  };

  const handleMarkWatered = async (scheduleId, eventIndex) => {
    try {
      const scheduleData = schedule || selectedHistory;
      if (!scheduleData) return;
      
      // Mark the specific event as completed
      const updatedSchedule = { ...scheduleData };
      updatedSchedule.schedule[eventIndex].completed = true;
      updatedSchedule.schedule[eventIndex].completedAt = new Date().toISOString();
      
      // Check if all events are completed
      const allCompleted = updatedSchedule.schedule.every(e => e.completed);
      if (allCompleted) {
        updatedSchedule.isCompleted = true;
      }
      
      await updateWateringSchedule(scheduleData._id, {
        schedule: updatedSchedule.schedule,
        isCompleted: allCompleted,
      });
      
      setSchedule(updatedSchedule);
      if (selectedHistory) setSelectedHistory(updatedSchedule);
      addNotification('Watering marked as completed!', 'success');
      loadData();
    } catch (error) {
      addNotification('Failed to update schedule', 'error');
    }
  };

  const handleBulkAdjust = async (adjustment) => {
    if (!schedule) return;
    
    try {
      const updatedSchedule = { ...schedule };
      updatedSchedule.schedule = updatedSchedule.schedule.map(event => {
        if (event.completed) return event;
        
        let newAmount = event.amount;
        let adjusted = false;
        
        // Parse current amount
        const amountMatch = event.amount.match(/(\d+)(ml|L)/);
        if (amountMatch) {
          let value = parseInt(amountMatch[1]);
          const unit = amountMatch[2];
          
          if (adjustment === 'hot_weather') {
            value = Math.round(value * 1.2);
            adjusted = true;
          } else if (adjustment === 'rain_delay') {
            // Skip watering for 2-3 days
            const eventDate = new Date(event.date);
            const today = new Date();
            const daysDiff = Math.floor((eventDate - today) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 3 && daysDiff > 0) {
              return null; // Remove this event
            }
          }
          
          newAmount = `${value}${unit}`;
        }
        
        return {
          ...event,
          amount: newAmount,
          adjusted: adjusted,
          adjustmentReason: adjustment === 'hot_weather' ? 'Heatwave boost (+20%)' : undefined,
        };
      }).filter(e => e !== null);
      
      // Update weather adjusted status
      if (adjustment === 'rain_delay') {
        updatedSchedule.weatherAdjusted = true;
        updatedSchedule.skipReason = 'Rain delay applied';
        addNotification('Rain delay applied! Skipping watering for 3 days.', 'info');
      } else if (adjustment === 'hot_weather') {
        updatedSchedule.weatherAdjusted = true;
        updatedSchedule.skipReason = 'Heatwave boost applied';
        addNotification('Heatwave boost applied! Increased all volumes by 20%.', 'info');
      }
      
      await updateWateringSchedule(schedule._id, {
        schedule: updatedSchedule.schedule,
        weatherAdjusted: updatedSchedule.weatherAdjusted,
        skipReason: updatedSchedule.skipReason,
      });
      
      setSchedule(updatedSchedule);
      addNotification('Schedule adjusted successfully!', 'success');
      loadData();
    } catch (error) {
      addNotification('Failed to adjust schedule', 'error');
    }
  };

  const handleCustomEdit = async (scheduleId, eventIndex, newAmount) => {
    try {
      const scheduleData = schedule || selectedHistory;
      if (!scheduleData) return;
      
      const updatedSchedule = { ...scheduleData };
      updatedSchedule.schedule[eventIndex].amount = newAmount;
      updatedSchedule.schedule[eventIndex].customEdited = true;
      
      await updateWateringSchedule(scheduleData._id, {
        schedule: updatedSchedule.schedule,
      });
      
      setSchedule(updatedSchedule);
      if (selectedHistory) setSelectedHistory(updatedSchedule);
      addNotification('Volume updated successfully!', 'success');
      loadData();
    } catch (error) {
      addNotification('Failed to update volume', 'error');
    }
  };

  const getPlantName = (plantId) => {
    if (!plantId) return 'Unknown Plant';
    if (typeof plantId === 'object' && plantId.name) {
      return plantId.name;
    }
    if (typeof plantId === 'string') {
      const plant = plants.find(p => p._id === plantId);
      return plant?.name || 'Unknown Plant';
    }
    return 'Unknown Plant';
  };

  return (
    <div className="watering-tab">
      <h2>
        <RiDropLine className="header-icon" /> Smart Watering
      </h2>
      <p className="subtitle">Intelligent watering schedules powered by weather data</p>
      
      <div className="watering-layout">
        {/* Left Column - Generate & Current Schedule */}
        <div className="watering-left">
          {/* Weather Widget */}
          <WeatherWidget 
            weather={weatherData} 
            forecast={forecastData}
            loading={loadingWeather}
          />

          {/* Plant Selector & Generate */}
          <div className="watering-generate-section">
            <div className="plant-selector">
              <label>Select Plant:</label>
              {loadingData ? (
                <div className="plant-selector-skeleton">
                  <RiLoader4Line className="spin" /> Loading plants...
                </div>
              ) : (
                <select 
                  value={selectedPlant?._id || ''} 
                  onChange={(e) => {
                    const plant = plants.find(p => p._id === e.target.value);
                    setSelectedPlant(plant);
                    setSchedule(null);
                    setSelectedHistory(null);
                  }}
                >
                  {plants.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              )}
              <button 
                className="btn-primary" 
                onClick={handleGenerate} 
                disabled={!selectedPlant || loading || loadingData}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                {loading ? (
                  <><RiLoader4Line className="spin" /> Generating...</>
                ) : (
                  <><RiRefreshLine /> Generate Schedule</>
                )}
              </button>
            </div>
          </div>

          {/* Bulk Adjustment Controls */}
          {schedule && schedule.schedule && schedule.schedule.length > 0 && (
            <div className="bulk-controls">
              <span className="controls-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <RiFlashlightLine /> Quick Adjust:
              </span>
              <button 
                className="control-btn hot"
                onClick={() => handleBulkAdjust('hot_weather')}
                title="Increase all volumes by 20% for hot weather"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <RiSunLine /> Heatwave Boost
              </button>
              <button 
                className="control-btn rain"
                onClick={() => handleBulkAdjust('rain_delay')}
                title="Skip watering for next 3 days due to rain"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <RiRainyLine /> Rain Delay
              </button>
            </div>
          )}

          {/* Schedule Display: Current or Selected History */}
          {selectedHistory ? (
            <div className="watering-history-detail">
              <div className="history-detail-header-bar">
                <span className="history-badge-tag">
                  <RiHistoryLine /> Viewing Archived Schedule
                </span>
                <button 
                  className="btn-close-history" 
                  onClick={() => setSelectedHistory(null)}
                >
                  <RiCloseLine /> Close History
                </button>
              </div>
              <WateringSchedule 
                schedule={selectedHistory} 
                plantName={getPlantName(selectedHistory.plantId)}
                onMarkWatered={handleMarkWatered}
                onCustomEdit={handleCustomEdit}
                weatherData={weatherData}
                forecastData={forecastData}
                isHistory={true}
              />
            </div>
          ) : schedule ? (
            <div className="watering-schedule-section">
              <WateringSchedule 
                schedule={schedule} 
                plantName={getPlantName(schedule.plantId)}
                onMarkWatered={handleMarkWatered}
                onCustomEdit={handleCustomEdit}
                weatherData={weatherData}
                forecastData={forecastData}
              />
            </div>
          ) : null}
        </div>

        {/* Right Column - History */}
        <div className="watering-right">
          <WateringHistory 
            history={filteredHistory}
            onItemClick={handleHistoryClick}
            selectedId={selectedHistory?._id}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            getPlantName={getPlantName}
            loading={loadingData}
          />
        </div>
      </div>
    </div>
  );
};

export default WateringTab;