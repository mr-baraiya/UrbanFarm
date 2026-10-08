import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import WateringSchedule from './WateringSchedule';
import WateringHistory from './WateringHistory';
import WeatherWidget from './WeatherWidget';
import SmartWateringBanner from './SmartWateringBanner';
import './WateringTab.css';

const WateringTab = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
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
      const validPlants = plantsData || [];
      const validSchedules = schedulesData || [];
      setPlants(validPlants);
      setHistory(validSchedules);
      setFilteredHistory(validSchedules);

      if (validPlants.length > 0) {
        setSelectedPlant((prevPlant) => {
          const activePlant = prevPlant 
            ? (validPlants.find(p => p._id.toString() === prevPlant._id.toString()) || validPlants[0]) 
            : validPlants[0];
          
          setSchedule((prevSchedule) => {
            if (validSchedules.length > 0) {
              // 1. Keep currently selected schedule by _id if it exists in validSchedules
              if (prevSchedule && prevSchedule._id) {
                const existing = validSchedules.find(s => s._id.toString() === prevSchedule._id.toString());
                if (existing) {
                  return existing;
                }
              }
              // 2. Otherwise find schedule matching activePlant
              const matchForActivePlant = validSchedules.find(
                (s) => (s.plantId?._id || s.plantId)?.toString() === activePlant._id.toString()
              );
              if (matchForActivePlant) {
                return matchForActivePlant;
              }
            }
            // 3. Return null if activePlant has no schedule (NEVER fall back to another plant's schedule!)
            return null;
          });

          return activePlant;
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      addNotification(t('watering.failedLoadData', 'Failed to load data'), 'error');
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
    
    if (filterStatus === 'pending') {
      filtered = filtered.filter(h => {
        const events = h.schedule || [];
        const completedCount = events.filter(e => e.completed).length;
        return completedCount < events.length && !h.isCompleted;
      });
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(h => {
        const events = h.schedule || [];
        const completedCount = events.filter(e => e.completed).length;
        return h.isCompleted || (events.length > 0 && completedCount === events.length);
      });
    } else if (filterStatus === 'missed') {
      filtered = filtered.filter(h => {
        const events = h.schedule || [];
        return h.isMissed || events.some(e => new Date(e.date) < new Date() && !e.completed && !e.skipped);
      });
    } else if (filterStatus === 'skipped') {
      filtered = filtered.filter(h => h.isSkipped || (h.schedule && h.schedule.some(e => e.skipped)));
    }
    
    setFilteredHistory(filtered);
  };

  const handleGenerate = async () => {
    if (!selectedPlant) return;
    setLoading(true);
    try {
      const sched = await generateWateringSchedule(selectedPlant._id);
      setSchedule(sched);
      addNotification(t('watering.scheduleGeneratedSuccess', 'Watering schedule generated successfully!'), 'success');
      loadData();
    } catch (error) {
      addNotification(t('watering.scheduleGeneratedFailed', 'Failed to generate schedule'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item) => {
    const targetPlantId = (item.plantId?._id || item.plantId)?.toString();
    if (targetPlantId && plants.length > 0) {
      const match = plants.find(p => p._id.toString() === targetPlantId);
      if (match) {
        setSelectedPlant(match);
      }
    }
    setSchedule(item);
  };

  const handleMarkWatered = async (scheduleId, eventIndex) => {
    try {
      if (!schedule) return;
      
      const updatedEvents = schedule.schedule.map((evt, i) => {
        if (i === eventIndex) {
          const isCurrentlyCompleted = !!evt.completed;
          const nextCompleted = !isCurrentlyCompleted;
          return {
            ...evt,
            completed: nextCompleted,
            skipped: false, // Reset skipped so completed and skipped are mutually exclusive
            completedAt: nextCompleted ? new Date().toISOString() : null,
            adjustmentReason: evt.adjustmentReason === 'Skipped by user' ? undefined : evt.adjustmentReason,
          };
        }
        return evt;
      });
      
      const allDoneOrSkipped = updatedEvents.length > 0 && updatedEvents.every(e => e.completed || e.skipped);
      
      const updatedSchedule = {
        ...schedule,
        schedule: updatedEvents,
        isCompleted: allDoneOrSkipped,
      };
      
      await updateWateringSchedule(schedule._id, {
        schedule: updatedEvents,
        isCompleted: allDoneOrSkipped,
      });
      
      setSchedule(updatedSchedule);
      setHistory(prev => prev.map(h => h._id === schedule._id ? updatedSchedule : h));
      setFilteredHistory(prev => prev.map(h => h._id === schedule._id ? updatedSchedule : h));
      
      addNotification(t('watering.statusUpdated', 'Watering status updated!'), 'success');
      loadData();
    } catch (error) {
      console.error('Failed to update schedule:', error);
      addNotification(t('watering.updateFailed', 'Failed to update schedule'), 'error');
    }
  };

  const handleSkipWatering = async (scheduleId, eventIndex) => {
    try {
      if (!schedule) return;

      const updatedEvents = schedule.schedule.map((evt, i) => {
        if (i === eventIndex) {
          const isCurrentlySkipped = !!evt.skipped;
          const nextSkipped = !isCurrentlySkipped;
          return {
            ...evt,
            skipped: nextSkipped,
            completed: false, // Reset completed so completed and skipped are mutually exclusive
            completedAt: null,
            adjustmentReason: nextSkipped ? 'Skipped by user' : undefined,
          };
        }
        return evt;
      });

      const hasSkipped = updatedEvents.some(e => e.skipped);
      const allDoneOrSkipped = updatedEvents.length > 0 && updatedEvents.every(e => e.completed || e.skipped);

      const updatedSchedule = {
        ...schedule,
        schedule: updatedEvents,
        isSkipped: hasSkipped,
        isCompleted: allDoneOrSkipped,
      };

      await updateWateringSchedule(schedule._id, {
        schedule: updatedEvents,
        isSkipped: hasSkipped,
        isCompleted: allDoneOrSkipped,
      });

      setSchedule(updatedSchedule);
      setHistory(prev => prev.map(h => h._id === schedule._id ? updatedSchedule : h));
      setFilteredHistory(prev => prev.map(h => h._id === schedule._id ? updatedSchedule : h));

      addNotification(hasSkipped ? t('watering.sessionSkipped', 'Watering session skipped!') : t('watering.skipCanceled', 'Skip canceled'), 'info');
      loadData();
    } catch (error) {
      console.error('Failed to skip watering:', error);
      addNotification(t('watering.skipFailed', 'Failed to skip watering'), 'error');
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
        addNotification(t('watering.rainDelayApplied', 'Rain delay applied! Skipping watering for 3 days.'), 'info');
      } else if (adjustment === 'hot_weather') {
        updatedSchedule.weatherAdjusted = true;
        updatedSchedule.skipReason = 'Heatwave boost applied';
        addNotification(t('watering.heatwaveBoostApplied', 'Heatwave boost applied! Increased all volumes by 20%.'), 'info');
      }
      
      await updateWateringSchedule(schedule._id, {
        schedule: updatedSchedule.schedule,
        weatherAdjusted: updatedSchedule.weatherAdjusted,
        skipReason: updatedSchedule.skipReason,
      });
      
      setSchedule(updatedSchedule);
      addNotification(t('watering.adjustedSuccess', 'Schedule adjusted successfully!'), 'success');
      loadData();
    } catch (error) {
      addNotification(t('watering.adjustFailed', 'Failed to adjust schedule'), 'error');
    }
  };

  const handleCustomEdit = async (scheduleId, eventIndex, newAmount) => {
    try {
      if (!schedule) return;
      
      const updatedSchedule = { ...schedule };
      updatedSchedule.schedule[eventIndex].amount = newAmount;
      updatedSchedule.schedule[eventIndex].customEdited = true;
      
      await updateWateringSchedule(schedule._id, {
        schedule: updatedSchedule.schedule,
      });
      
      setSchedule(updatedSchedule);
      addNotification(t('watering.volumeUpdated', 'Volume updated successfully!'), 'success');
      loadData();
    } catch (error) {
      addNotification(t('watering.volumeUpdateFailed', 'Failed to update volume'), 'error');
    }
  };

  const getPlantName = (plantId) => {
    if (!plantId) return t('watering.unknownPlant', 'Unknown Plant');
    if (typeof plantId === 'object' && plantId.name) {
      return getLocalizedDynamicText(plantId.name, i18n.language);
    }
    const pidStr = (typeof plantId === 'object' ? plantId._id : plantId)?.toString();
    if (pidStr) {
      const plant = plants.find(p => p._id.toString() === pidStr);
      if (plant?.name) {
        return getLocalizedDynamicText(plant.name, i18n.language);
      }
    }
    return t('watering.unknownPlant', 'Unknown Plant');
  };

  return (
    <div className="watering-tab">
      <h2>
        <RiDropLine className="header-icon" /> {t('watering.title', 'Smart Watering')}
      </h2>
      <p className="subtitle">{t('watering.subtitle', 'Intelligent watering schedules powered by weather data')}</p>
      
      {/* Top Section: Weather Widget & Plant Selector Controls */}
      <div className="watering-top-stack">
        <WeatherWidget 
          weather={weatherData} 
          forecast={forecastData}
          loading={loadingWeather}
        />

        <div className="watering-generate-section">
          <div className="plant-selector">
            <label>{t('watering.selectPlant', 'Select Plant:')}</label>
            {loadingData ? (
              <div className="plant-selector-skeleton">
                <RiLoader4Line className="spin" /> {t('watering.loadingPlants', 'Loading plants...')}
              </div>
            ) : (
              <select 
                value={selectedPlant?._id || ''} 
                onChange={(e) => {
                  const plant = plants.find(p => p._id.toString() === e.target.value);
                  if (plant) {
                    setSelectedPlant(plant);
                    const match = history.find(s => (s.plantId?._id || s.plantId)?.toString() === plant._id.toString());
                    setSchedule(match || null);
                  }
                }}
              >
                {plants.map(p => (
                  <option key={p._id} value={p._id}>{getLocalizedDynamicText(p.name, i18n.language)}</option>
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
                <><RiLoader4Line className="spin" /> {t('watering.generatingSchedule', 'Generating...')}</>
              ) : (
                <><RiRefreshLine /> {t('watering.generateSchedule', 'Generate Schedule')}</>
              )}
            </button>
          </div>
        </div>

        {/* AI Smart IoT Watering Banner */}
        <SmartWateringBanner plant={selectedPlant} weather={weatherData} />

        {/* Bulk Adjustment Controls */}
        {schedule && schedule.schedule && schedule.schedule.length > 0 && (
          <div className="bulk-controls">
            <span className="controls-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <RiFlashlightLine /> {t('watering.quickAdjust', 'Quick Adjust:')}
            </span>
            <button 
              className="control-btn hot"
              onClick={() => handleBulkAdjust('hot_weather')}
              title={t('watering.heatwaveBoostTitle', 'Increase all volumes by 20% for hot weather')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <RiSunLine /> {t('watering.heatwaveBoost', 'Heatwave Boost')}
            </button>
            <button 
              className="control-btn rain"
              onClick={() => handleBulkAdjust('rain_delay')}
              title={t('watering.rainDelayTitle', 'Skip watering for next 3 days due to rain')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <RiRainyLine /> {t('watering.rainDelay', 'Rain Delay')}
            </button>
          </div>
        )}
      </div>

      {/* 2-Column Equal Height Layout */}
      <div className="watering-layout">
        {/* Left Column - Active Schedule Card */}
        <div className="watering-left">
          {schedule ? (
            <div className="watering-schedule-section">
              <WateringSchedule 
                schedule={schedule} 
                plantName={getPlantName(schedule.plantId)}
                onMarkWatered={handleMarkWatered}
                onSkipWatering={handleSkipWatering}
                onCustomEdit={handleCustomEdit}
                weatherData={weatherData}
                forecastData={forecastData}
              />
            </div>
          ) : (
            <div className="no-schedule-box">
              <p style={{ color: '#4a3f3a', marginBottom: '1rem', fontWeight: 500 }}>
                {t('watering.noScheduleForPlant', { plant: (selectedPlant?.name ? getLocalizedDynamicText(selectedPlant.name, i18n.language) : t('watering.thisPlant', 'this plant')) })}
              </p>
              <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
                {t('watering.generateScheduleForPlant', { plant: (selectedPlant?.name ? getLocalizedDynamicText(selectedPlant.name, i18n.language) : t('watering.plant', 'Plant')) })}
              </button>
            </div>
          )}
        </div>

        {/* Right Column - History Card */}
        <div className="watering-right">
          <WateringHistory 
            allHistory={history}
            history={filteredHistory}
            onItemClick={handleHistoryClick}
            selectedId={schedule?._id}
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