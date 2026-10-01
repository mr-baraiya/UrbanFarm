import React, { useState } from 'react';
import { formatDate } from '../../utils/helpers';
import './WateringSchedule.css';

const WateringSchedule = ({ 
  schedule, 
  plantName, 
  onMarkWatered, 
  onCustomEdit,
  weatherData,
  forecastData,
  isHistory 
}) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  if (!schedule || !schedule.schedule) {
    return <p className="no-schedule">No schedule available.</p>;
  }

  // Check for missed watering
  const today = new Date();
  const missedEvents = schedule.schedule.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate < today && !event.completed;
  });

  // Get weather override
  const getWeatherOverride = () => {
    if (!forecastData || !forecastData.list) return null;
    
    const todayForecast = forecastData.list[0];
    if (!todayForecast) return null;
    
    const rain = todayForecast.rain?.['3h'] || 0;
    const temp = todayForecast.main?.temp || 0;
    
    if (rain > 5) {
      return { 
        emoji: '🌧️', 
        message: `Rain forecast (${rain}mm) - Consider skipping watering`,
        severity: 'info'
      };
    }
    if (temp > 35) {
      return { 
        emoji: '☀️', 
        message: `Heatwave alert (${Math.round(temp)}°C) - Consider evening watering`,
        severity: 'warning'
      };
    }
    return null;
  };

  const weatherOverride = getWeatherOverride();

  // Calculate soil moisture (mock data - could be from real sensors)
  const soilMoisture = Math.round(60 + (Math.random() * 30 - 15));
  const isDry = soilMoisture < 40;

  const handleEditSubmit = (index, scheduleId) => {
    if (editAmount && editAmount.trim()) {
      onCustomEdit(scheduleId, index, editAmount.trim());
      setEditingIndex(null);
      setEditAmount('');
    }
  };

  return (
    <div className="watering-schedule">
      <div className="schedule-header">
        <h3>💧 Watering Schedule {plantName && `for ${plantName}`}</h3>
        {schedule.weatherAdjusted && (
          <span className="weather-adjusted-badge">🌤️ Weather Adjusted</span>
        )}
      </div>

      {/* Soil Moisture Indicator */}
      <div className="soil-moisture">
        <div className="moisture-header">
          <span>🌱 Current Soil Moisture</span>
          <span className={`moisture-value ${isDry ? 'dry' : 'good'}`}>
            {soilMoisture}% {isDry ? '🔴 Dry' : '🟢 Good'}
          </span>
        </div>
        <div className="moisture-bar">
          <div 
            className="moisture-fill" 
            style={{ 
              width: `${soilMoisture}%`,
              background: soilMoisture < 40 ? '#e8b4b4' : soilMoisture < 70 ? '#f0d5c0' : '#a8d5ba'
            }}
          />
        </div>
        {isDry && (
          <span className="moisture-warning">⚠️ Soil is dry - consider watering</span>
        )}
      </div>

      {/* Weather Override */}
      {weatherOverride && !isHistory && (
        <div className={`weather-override ${weatherOverride.severity}`}>
          <span className="override-emoji">{weatherOverride.emoji}</span>
          <span className="override-message">{weatherOverride.message}</span>
        </div>
      )}

      {/* Missed Watering Alert */}
      {missedEvents.length > 0 && !isHistory && (
        <div className="missed-alert">
          ⚠️ {missedEvents.length} watering session{missedEvents.length > 1 ? 's' : ''} missed
          {missedEvents.map((event, idx) => (
            <span key={idx} className="missed-date">
              {formatDate(event.date)}
            </span>
          ))}
        </div>
      )}

      {/* Schedule Controls */}
      {schedule.schedule.length > 0 && (
        <div className="schedule-controls">
          <span className="schedule-stats">
            📊 {schedule.schedule.filter(e => e.completed).length}/{schedule.schedule.length} completed
          </span>
          {!isHistory && schedule.nextWateringDate && (
            <span className="next-watering">
              Next: {new Date(schedule.nextWateringDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Schedule List */}
      <ul className="schedule-list">
        {schedule.schedule.length === 0 ? (
          <li className="no-events">No watering events scheduled.</li>
        ) : (
          schedule.schedule.map((item, idx) => {
            const eventDate = new Date(item.date);
            const isPast = eventDate < today;
            const isMissed = isPast && !item.completed;
            const isToday = eventDate.toDateString() === today.toDateString();
            
            return (
              <li 
                key={idx} 
                className={`schedule-item ${item.completed ? 'completed' : ''} ${isMissed ? 'missed' : ''} ${isToday ? 'today' : ''}`}
              >
                <div className="schedule-left">
                  <input
                    type="checkbox"
                    className="water-checkbox"
                    checked={item.completed || false}
                    onChange={() => onMarkWatered(schedule._id, idx)}
                    disabled={isHistory}
                  />
                  <span className="schedule-date">
                    {formatDate(item.date)}
                    {isToday && <span className="today-badge">Today</span>}
                    {isMissed && <span className="missed-badge">Missed</span>}
                    {item.completed && <span className="done-badge">✅ Done</span>}
                  </span>
                </div>
                
                <div className="schedule-middle">
                  {editingIndex === idx ? (
                    <div className="edit-amount">
                      <input
                        type="text"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        placeholder="e.g., 600ml"
                        autoFocus
                      />
                      <button onClick={() => handleEditSubmit(idx, schedule._id)}>Save</button>
                      <button onClick={() => setEditingIndex(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div className="schedule-details">
                      <span 
                        className="schedule-amount"
                        onClick={() => {
                          setEditingIndex(idx);
                          setEditAmount(item.amount);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {item.amount}
                        {item.customEdited && <span className="edited-badge">✏️</span>}
                      </span>
                      <span className="schedule-time">{item.timeOfDay}</span>
                      {item.adjustmentReason && (
                        <span className="adjustment-reason">{item.adjustmentReason}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="schedule-right">
                  <span className="schedule-notes">{item.notes}</span>
                  {item.completed && item.completedAt && (
                    <span className="completed-time">
                      {new Date(item.completedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>

      {/* Legend */}
      {!isHistory && (
        <div className="schedule-legend">
          <span className="legend-item">
            <span className="legend-dot unchecked"></span> Pending
          </span>
          <span className="legend-item">
            <span className="legend-dot checked"></span> Completed
          </span>
          <span className="legend-item">
            <span className="legend-dot missed"></span> Missed
          </span>
          <span className="legend-item">
            <span className="legend-dot today"></span> Today
          </span>
        </div>
      )}
    </div>
  );
};

export default WateringSchedule;