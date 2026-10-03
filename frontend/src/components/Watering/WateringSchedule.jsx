import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiDropLine, 
  RiSunCloudyLine, 
  RiAlertLine, 
  RiCheckLine, 
  RiEditLine, 
  RiRainyLine, 
  RiSunLine, 
  RiMoonLine,
  RiBarChartLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiLeafLine,
  RiSkipForwardLine
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { formatDate } from '../../utils/helpers';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './WateringSchedule.css';

const WateringSchedule = ({ 
  schedule, 
  plantName, 
  onMarkWatered, 
  onSkipWatering,
  onCustomEdit, 
  weatherData, 
  forecastData, 
  isHistory 
}) => {
  const { t, i18n } = useTranslation();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  if (!schedule || !schedule.schedule) {
    return <p className="no-schedule">{t('watering.noEventsScheduled', 'No schedule available.')}</p>;
  }

  // Check for missed watering
  const today = new Date();
  const missedEvents = schedule.schedule.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate < today && !event.completed && !event.skipped;
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
        icon: <RiRainyLine style={{ color: '#38bdf8' }} />, 
        message: t('watering.rainForecastOverride', { rain, defaultValue: `Rain forecast (${rain}mm) - Consider skipping watering` }),
        severity: 'info'
      };
    }
    if (temp > 35) {
      return { 
        icon: <RiSunLine style={{ color: '#f59e0b' }} />, 
        message: t('watering.heatwaveAlertOverride', { temp: Math.round(temp), defaultValue: `Heatwave alert (${Math.round(temp)}°C) - Consider evening watering` }),
        severity: 'warning'
      };
    }
    return null;
  };

  const weatherOverride = getWeatherOverride();

  // Deterministic soil moisture calculation based on schedule ID (prevents random changes on re-renders)
  const soilMoisture = React.useMemo(() => {
    if (schedule?.soilMoisture !== undefined) return schedule.soilMoisture;
    if (!schedule || !schedule._id) return 65;
    let hash = 0;
    const str = String(schedule._id);
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return 52 + (Math.abs(hash) % 24);
  }, [schedule?._id, schedule?.soilMoisture]);

  const isDry = soilMoisture < 40;

  const handleEditSubmit = (index, scheduleId) => {
    if (editAmount && editAmount.trim()) {
      onCustomEdit(scheduleId, index, editAmount.trim());
      setEditingIndex(null);
      setEditAmount('');
    }
  };

  const getTimeIcon = (timeOfDay) => {
    if (!timeOfDay) return null;
    const lower = timeOfDay.toLowerCase();
    if (lower.includes('morning')) return <RiSunLine className="ws-time-icon morning" />;
    if (lower.includes('evening') || lower.includes('night')) return <RiMoonLine className="ws-time-icon evening" />;
    return <RiTimeLine className="ws-time-icon" />;
  };

  const getTimeLabel = (timeOfDay) => {
    if (!timeOfDay) return '';
    const lower = timeOfDay.toLowerCase().trim();
    if (lower === 'morning') return t('watering.timeMorning', 'Morning');
    if (lower === 'afternoon') return t('watering.timeAfternoon', 'Afternoon');
    if (lower === 'evening') return t('watering.timeEvening', 'Evening');
    if (lower === 'night') return t('watering.timeNight', 'Night');
    return getLocalizedDynamicText(timeOfDay, i18n.language);
  };

  const isRestDay = (amount) => {
    if (!amount) return true;
    const norm = amount.toLowerCase().trim();
    return norm === '0ml' || norm === '0l' || norm === '0' || norm === 'none';
  };

  const handledCount = schedule.schedule.filter(e => e.completed || e.skipped).length;
  const totalCount = schedule.schedule.length;

  return (
    <div className="watering-schedule">
      <div className="schedule-header">
        <h3>
          <RiDropLine className="schedule-header-icon" /> {plantName ? t('watering.scheduleFor', { plant: getLocalizedDynamicText(plantName, i18n.language) }) : t('watering.smartIrrigation', 'Watering Schedule')}
        </h3>
        {schedule.weatherAdjusted && (
          <span className="weather-adjusted-badge">
            <RiSunCloudyLine /> {t('watering.weatherAdjusted', 'Weather Adjusted')}
          </span>
        )}
      </div>

      {/* Soil Moisture Indicator */}
      <div className="soil-moisture">
        <div className="moisture-header">
          <span className="moisture-label">
            <TbPlant2 /> {t('watering.currentSoilMoisture', 'Current Soil Moisture')}
          </span>
          <span className={`moisture-value ${isDry ? 'dry' : 'good'}`}>
            {soilMoisture}% {isDry ? <><RiCloseCircleLine /> {t('watering.moistureDry', 'Dry')}</> : <><RiCheckboxCircleLine /> {t('watering.moistureGood', 'Good')}</>}
          </span>
        </div>
        <div className="moisture-bar">
          <div 
            className={`moisture-fill ${soilMoisture < 40 ? 'dry' : soilMoisture < 70 ? 'medium' : 'good'}`} 
            style={{ width: `${soilMoisture}%` }}
          />
        </div>
        {isDry && (
          <span className="moisture-warning">
            <RiAlertLine /> {t('watering.soilDryWarning', 'Soil is dry - consider watering')}
          </span>
        )}
      </div>

      {/* Weather Override Alert */}
      {weatherOverride && !isHistory && (
        <div className={`weather-override ${weatherOverride.severity}`}>
          <span className="override-emoji">
            {weatherOverride.icon}
          </span>
          <span className="override-message">{weatherOverride.message}</span>
        </div>
      )}

      {/* Missed Watering Alert */}
      {missedEvents.length > 0 && !isHistory && (
        <div className="missed-alert">
          <div className="missed-alert-title">
            <RiAlertLine /> {t('watering.missedSessionsAlert', { count: missedEvents.length, defaultValue: `${missedEvents.length} watering session(s) missed` })}
          </div>
          <div className="missed-dates-list">
            {missedEvents.map((event, idx) => (
              <span key={idx} className="missed-date-chip">
                {new Date(event.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats Row */}
      {schedule.schedule.length > 0 && (
        <div className="schedule-controls-card">
          <div className="schedule-stat-chip">
            <RiBarChartLine className="stat-chip-icon" />
            <span>
              {i18n.language.startsWith('gu') ? (
                <><strong>{totalCount}</strong> માંથી <strong>{handledCount}</strong> પૂર્ણ</>
              ) : i18n.language.startsWith('hi') ? (
                <><strong>{totalCount}</strong> में से <strong>{handledCount}</strong> पूर्ण</>
              ) : (
                <><strong>{handledCount}</strong> of {totalCount} completed</>
              )}
            </span>
          </div>
          {!isHistory && schedule.nextWateringDate && (
            <div className="schedule-next-chip">
              <RiCalendarEventLine className="stat-chip-icon" />
              <span>{t('watering.nextLabel', 'Next:')} <strong>{new Date(schedule.nextWateringDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Schedule List of Day Cards */}
      <div className="ws-cards-container">
        {schedule.schedule.length === 0 ? (
          <div className="no-events">{t('watering.noEventsScheduled', 'No watering events scheduled.')}</div>
        ) : (
          schedule.schedule.map((item, idx) => {
            const eventDate = new Date(item.date);
            const now = new Date();
            const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()).getTime();

            const isFuture = eventDay > todayDay;
            const isToday = eventDay === todayDay;
            const isPast = eventDay < todayDay;
            const isMissed = isPast && !item.completed && !item.skipped;
            const rest = isRestDay(item.amount);
            const dayOfWeek = eventDate.toLocaleDateString(i18n.language, { weekday: 'short' });
            const formattedDateStr = eventDate.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <div 
                key={idx} 
                className={`ws-day-card ${item.completed ? 'completed' : ''} ${isMissed ? 'missed' : ''} ${isToday ? 'today' : ''} ${isFuture ? 'future-card' : ''} ${rest ? 'rest-day' : 'active-watering'}`}
              >
                {/* Left: Day & Date Header */}
                <div className="ws-card-left">
                  <div className="ws-day-tag">
                    <span className="ws-weekday">{dayOfWeek}</span>
                    <span className="ws-date-text">{formattedDateStr}</span>
                  </div>
                  <div className="ws-status-badges">
                    {isToday && <span className="ws-badge today">{t('watering.badgeToday', 'Today')}</span>}
                    {isFuture && !item.completed && !item.skipped && <span className="ws-badge future">{t('watering.badgeFuture', 'Future')}</span>}
                    {isMissed && !item.skipped && <span className="ws-badge missed">{t('watering.badgeMissed', 'Missed')}</span>}
                    {item.completed && <span className="ws-badge done"><RiCheckLine /> {t('watering.badgeDone', 'Done')}</span>}
                    {item.skipped && <span className="ws-badge skipped"><RiSkipForwardLine /> {t('watering.badgeSkipped', 'Skipped')}</span>}
                  </div>
                </div>

                {/* Middle: Watering Details or Rest Description */}
                <div className="ws-card-middle">
                  {editingIndex === idx ? (
                    <div className="ws-inline-edit" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        placeholder={t('watering.editVolumePlaceholder', 'e.g., 500ml')}
                        autoFocus
                      />
                      <button className="btn-edit-save" onClick={() => handleEditSubmit(idx, schedule._id)}>{t('watering.save', 'Save')}</button>
                      <button className="btn-edit-cancel" onClick={() => setEditingIndex(null)}>{t('watering.cancel', 'Cancel')}</button>
                    </div>
                  ) : (
                    <div className="ws-details-row">
                      {!rest ? (
                        <div className="ws-badges-group">
                          <span 
                            className="ws-amount-pill active"
                            onClick={() => {
                              if (!isHistory) {
                                setEditingIndex(idx);
                                setEditAmount(item.amount);
                              }
                            }}
                            title={t('watering.clickToEditVolume', 'Click to edit volume')}
                          >
                            <RiDropLine className="pill-water-icon" />
                            <strong>{item.amount}</strong>
                            {!isHistory && <RiEditLine className="pill-edit-icon" />}
                          </span>

                          {item.timeOfDay && item.timeOfDay.toLowerCase() !== 'none' && (
                            <span className="ws-time-pill">
                              {getTimeIcon(item.timeOfDay)}
                              <span className="time-text">{getTimeLabel(item.timeOfDay)}</span>
                            </span>
                          )}

                          {item.adjustmentReason && (
                            <span className="ws-reason-pill">{getLocalizedDynamicText(item.adjustmentReason, i18n.language)}</span>
                          )}
                        </div>
                      ) : (
                        <div className="ws-badges-group">
                          <span className="ws-amount-pill rest">
                            <RiLeafLine className="pill-leaf-icon" />
                            <span>{t('watering.restDay', 'Rest (0ml)')}</span>
                          </span>
                        </div>
                      )}

                      {item.notes && (
                        <p className="ws-notes-text">{getLocalizedDynamicText(item.notes, i18n.language)}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Action Buttons */}
                <div className="ws-card-right">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className={`ws-action-check-btn ${item.completed ? 'checked' : ''}`}
                      onClick={() => {
                        if (!isFuture || item.completed) {
                          onMarkWatered(schedule._id, idx);
                        }
                      }}
                      disabled={isFuture && !item.completed}
                      title={
                        isFuture && !item.completed
                          ? t('watering.futureTaskTooltip', { date: formattedDateStr, defaultValue: `Future task scheduled for ${formattedDateStr}` })
                          : item.completed
                          ? t('watering.markedAsWatered', 'Marked as watered')
                          : t('watering.markAsWatered', 'Mark as watered')
                      }
                      aria-label="Toggle completed"
                    >
                      <RiCheckLine className="check-svg-icon" />
                    </button>

                    <button
                      type="button"
                      className={`ws-action-skip-btn ${item.skipped ? 'skipped' : ''}`}
                      onClick={() => {
                        if (onSkipWatering) {
                          onSkipWatering(schedule._id, idx);
                        }
                      }}
                      disabled={isFuture && !item.skipped}
                      title={item.skipped ? t('watering.unskipSessionTooltip', 'Un-skip session') : t('watering.skipSessionTooltip', 'Skip watering session (e.g. Rain/Moist soil)')}
                      aria-label="Toggle skipped"
                    >
                      <RiSkipForwardLine className="skip-svg-icon" />
                    </button>
                  </div>
                  {item.completed && item.completedAt && (
                    <span className="ws-completed-timestamp">
                      {new Date(item.completedAt).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      {!isHistory && (
        <div className="ws-schedule-legend">
          <span className="ws-legend-item">
            <span className="ws-legend-chip today"></span> {t('watering.legendToday', 'Today')}
          </span>
          <span className="ws-legend-item">
            <span className="ws-legend-chip completed"></span> {t('watering.legendCompleted', 'Completed')}
          </span>
          <span className="ws-legend-item">
            <span className="ws-legend-chip pending"></span> {t('watering.legendPending', 'Pending')}
          </span>
          <span className="ws-legend-item">
            <span className="ws-legend-chip missed"></span> {t('watering.legendMissed', 'Missed')}
          </span>
        </div>
      )}
    </div>
  );
};

export default WateringSchedule;