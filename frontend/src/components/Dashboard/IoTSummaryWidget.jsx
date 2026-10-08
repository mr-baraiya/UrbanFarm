import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Cpu, Wifi, WifiOff, AlertTriangle, Droplets, Activity } from 'lucide-react';
import iotService from '../../services/iotService';
import './IoTSummaryWidget.css';

const IoTSummaryWidget = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [latestReading, setLatestReading] = useState(null);

  useEffect(() => {
    const loadData = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const [devRes, readingRes] = await Promise.all([
          iotService.getDevices().catch(() => ({ devices: [] })),
          iotService.getLatestPlantSensors('tomato-01').catch(() => ({ reading: null }))
        ]);

        setDevices(devRes?.devices || []);
        setLatestReading(readingRes?.reading || null);
      } catch (err) {
        console.warn('Error loading IoT summary:', err);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    loadData(true);
    const interval = setInterval(() => loadData(false), 5000);

    const handleCustomUpdate = (e) => {
      if (e.detail?.reading) {
        setLatestReading(e.detail.reading);
      }
    };
    window.addEventListener('iot-data-updated', handleCustomUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('iot-data-updated', handleCustomUpdate);
    };
  }, []);

  const totalDevices = devices.length || 1;
  const onlineCount = devices.filter(d => d.status === 'online').length || (latestReading ? 1 : 0);
  const offlineCount = Math.max(0, totalDevices - onlineCount);

  const needsAttention = latestReading && (latestReading.soilMoisture < 25 || latestReading.temperature > 38);

  return (
    <div className="iot-summary-widget">
      <div className="iot-summary-header">
        <div className="iot-summary-title">
          <div className="iot-summary-icon">
            <Cpu size={20} />
          </div>
          <div>
            <h3 className="iot-summary-heading">{t('iot.title')}</h3>
            <p className="iot-summary-subheading">{t('iot.telemetryMonitoring')}</p>
          </div>
        </div>

        <span className="iot-status-tag">
          <Activity size={12} className="iot-pulse" />
          {t('iot.active')}
        </span>
      </div>

      <div className="iot-summary-stats-row">
        <div className="iot-stat-box">
          <span className="iot-stat-label">{t('iot.totalDevices')}</span>
          <span className="iot-stat-val text-white">{totalDevices}</span>
        </div>
        <div className="iot-stat-box online">
          <span className="iot-stat-label">{t('iot.onlineDevices')}</span>
          <span className="iot-stat-val flex items-center justify-center gap-1">
            <Wifi size={16} /> {onlineCount}
          </span>
        </div>
        <div className="iot-stat-box offline">
          <span className="iot-stat-label">{t('iot.offlineDevices')}</span>
          <span className="iot-stat-val flex items-center justify-center gap-1">
            <WifiOff size={16} /> {offlineCount}
          </span>
        </div>
      </div>

      {latestReading && (
        <div className="iot-summary-sensor-preview">
          <div className="iot-preview-left">
            <div className={`iot-preview-icon ${latestReading.soilMoisture < 25 ? 'alert' : 'normal'}`}>
              <Droplets size={18} />
            </div>
            <div>
              <span className="iot-preview-device">ESP32-TOMATO-01 • Tomato</span>
              <span className="iot-preview-readings">
                {t('iot.soilMoisture')}: <strong className={latestReading.soilMoisture < 25 ? 'alert-text' : 'normal-text'}>{latestReading.soilMoisture}%</strong> • {t('iot.temperature')}: <strong className="temp-text">{latestReading.temperature}°C</strong>
              </span>
            </div>
          </div>

          {needsAttention ? (
            <span className="iot-attention-tag alert">
              <AlertTriangle size={12} /> {t('iot.attention')}
            </span>
          ) : (
            <span className="iot-attention-tag optimal">{t('iot.optimal')}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default IoTSummaryWidget;
