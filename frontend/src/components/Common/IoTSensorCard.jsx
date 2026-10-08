import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Thermometer, Sun, Activity, Wifi, WifiOff, RefreshCw, LineChart, Cpu } from 'lucide-react';
import iotService from '../../services/iotService';
import IoTSensorHistoryModal from './IoTSensorHistoryModal';
import './IoTSensorCard.css';

const IoTSensorCard = ({ plantId, plantName, deviceId = 'ESP32-TOMATO-01' }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [sensorData, setSensorData] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const fetchSensors = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await iotService.getLatestPlantSensors(plantId || 'tomato-01');
      if (data && data.success) {
        setSensorData(data.reading);
        setIsOnline(data.isOnline);
        setLastSeen(data.lastSeen);
      }
    } catch (error) {
      console.warn('Failed to fetch IoT sensor data:', error);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors(true);
    const interval = setInterval(() => fetchSensors(false), 5000);

    const handleCustomUpdate = (e) => {
      if (e.detail?.reading) {
        setSensorData(e.detail.reading);
        setIsOnline(true);
        setLastSeen(new Date().toISOString());
      }
    };
    window.addEventListener('iot-data-updated', handleCustomUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('iot-data-updated', handleCustomUpdate);
    };
  }, [plantId]);

  const formatLastUpdated = (dateStr) => {
    if (!dateStr) return '--';
    const diffSec = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diffSec < 10) return t('common.justNow', 'Just now');
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="iot-sensor-card">
      <div className="iot-card-header">
        <div className="iot-header-title font-semibold">
          <div className="iot-icon-badge">
            <Cpu size={18} />
          </div>
          <div>
            <div className="iot-device-row">
              <span className="iot-device-name">{deviceId}</span>
              <span className={`iot-badge ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? <Wifi size={12} className="iot-pulse" /> : <WifiOff size={12} />}
                {isOnline ? t('iot.connected') : t('iot.offline')}
              </span>
            </div>
            <span className="iot-timestamp">
              {t('iot.lastUpdated')}: <strong className="iot-timestamp-val">{formatLastUpdated(lastSeen)}</strong>
            </span>
          </div>
        </div>

        <div className="iot-header-actions">
          <button
            onClick={fetchSensors}
            className="iot-btn-icon"
            title="Refresh Sensors"
          >
            <RefreshCw size={14} className={loading ? 'iot-spin' : ''} />
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="iot-btn-history"
          >
            <LineChart size={14} />
            <span>{t('iot.sensorHistory')}</span>
          </button>
        </div>
      </div>

      {sensorData ? (
        <div className="iot-metrics-grid">
          {/* Soil Moisture */}
          <div className="iot-metric-box moisture">
            <div className="iot-metric-top">
              <span>{t('iot.soilMoisture')}</span>
              <Droplets size={16} />
            </div>
            <div className="iot-metric-val">{sensorData.soilMoisture}%</div>
            <div className="iot-progress-bg">
              <div
                className="iot-progress-fill moisture"
                style={{ width: `${Math.min(100, Math.max(0, sensorData.soilMoisture))}%` }}
              />
            </div>
          </div>

          {/* Temperature */}
          <div className="iot-metric-box temp">
            <div className="iot-metric-top">
              <span>{t('iot.temperature')}</span>
              <Thermometer size={16} />
            </div>
            <div className="iot-metric-val">{sensorData.temperature}°C</div>
            <div className="iot-metric-sub">
              {sensorData.temperature > 35 ? t('iot.highTemp') : sensorData.temperature < 15 ? t('iot.lowTemp') : t('iot.optimal')}
            </div>
          </div>

          {/* Humidity */}
          <div className="iot-metric-box humidity">
            <div className="iot-metric-top">
              <span>{t('iot.humidity')}</span>
              <Activity size={16} />
            </div>
            <div className="iot-metric-val">{sensorData.humidity}%</div>
            <div className="iot-metric-sub">{t('iot.relativeAmbient')}</div>
          </div>

          {/* Light Intensity */}
          <div className="iot-metric-box light">
            <div className="iot-metric-top">
              <span>{t('iot.light')}</span>
              <Sun size={16} />
            </div>
            <div className="iot-metric-val">
              {sensorData.light} <small>lux</small>
            </div>
            <div className="iot-metric-sub">
              {sensorData.light > 1000 ? t('iot.directLight') : sensorData.light > 400 ? t('iot.partialLight') : t('iot.shade')}
            </div>
          </div>
        </div>
      ) : (
        <div className="iot-loading-empty">
          {loading ? t('common.loading') : t('iot.offline')}
        </div>
      )}

      {showHistory && (
        <IoTSensorHistoryModal
          plantId={plantId || 'tomato-01'}
          plantName={plantName || 'Tomato'}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export default IoTSensorCard;
