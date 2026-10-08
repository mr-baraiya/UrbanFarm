import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, CloudRain, Sun, Thermometer, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import iotService from '../../services/iotService';
import './SmartWateringBanner.css';

const SmartWateringBanner = ({ plant, weather }) => {
  const { t } = useTranslation();
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIoT = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const data = await iotService.getLatestPlantSensors(plant?._id || 'tomato-01');
        if (data && data.success) {
          setSensorData(data.reading);
        }
      } catch (err) {
        console.warn('Failed to load IoT for SmartWatering:', err);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchIoT(true);
    const interval = setInterval(() => fetchIoT(false), 5000);

    const handleCustomUpdate = (e) => {
      if (e.detail?.reading) {
        setSensorData(e.detail.reading);
      }
    };
    window.addEventListener('iot-data-updated', handleCustomUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('iot-data-updated', handleCustomUpdate);
    };
  }, [plant]);

  const calculateRecommendation = () => {
    const soil = sensorData?.soilMoisture ?? 40;
    const temp = sensorData?.temperature ?? (weather?.main?.temp ?? 28);
    const humidity = sensorData?.humidity ?? (weather?.main?.humidity ?? 55);

    const weatherCondition = (weather?.weather?.[0]?.main || '').toLowerCase();
    const weatherDesc = (weather?.weather?.[0]?.description || '').toLowerCase();
    const isRainExpected = weatherCondition.includes('rain') || weatherDesc.includes('rain') || weatherCondition.includes('drizzle') || weatherCondition.includes('thunderstorm');

    let status = 'recommended';
    let title = t('iot.wateringRecommended');
    let themeClass = 'recommended';
    let icon = CheckCircle2;
    let reason = `Soil Moisture is at ${soil}%. Temperature is ${temp}°C. Weather is clear with no heavy rain expected.`;

    if (isRainExpected) {
      status = 'delayed_rain';
      title = t('iot.delayedRainExpected');
      themeClass = 'delayed';
      icon = CloudRain;
      reason = `Significant rain expected in forecast (${weatherDesc || 'Rain'}). Irrigation delayed to avoid waterlogging and conserve water.`;
    } else if (soil > 55) {
      status = 'not_needed';
      title = t('iot.wateringNotNeeded');
      themeClass = 'not-needed';
      icon = Sun;
      reason = `Soil moisture level is optimal (${soil}%). Current moisture is sufficient for healthy root growth.`;
    } else if (soil < 20) {
      status = 'critical';
      title = t('iot.urgentWateringRequired');
      themeClass = 'critical';
      icon = ShieldAlert;
      reason = `Soil moisture is critically dry (${soil}%) and temperature is ${temp}°C. Irrigate immediately to prevent root wilting.`;
    }

    return { status, title, themeClass, icon, reason, soil, temp, humidity, isRainExpected };
  };

  const rec = calculateRecommendation();
  const IconComponent = rec.icon;

  return (
    <div className={`smart-watering-banner ${rec.themeClass}`}>
      <div className="smart-banner-header">
        <div className="smart-header-left">
          <div className="smart-icon-badge">
            <Cpu size={20} />
          </div>
          <div>
            <span className="smart-header-subtitle">{t('iot.aiRecommendation')}</span>
            <h4 className="smart-header-title">
              <IconComponent size={20} /> {rec.title}
            </h4>
          </div>
        </div>

        <span className="smart-pill-tag">
          {t('iot.liveTelemetryWeatherAI')}
        </span>
      </div>

      <div className="smart-metrics-grid">
        <div className="smart-metric-card">
          <span className="smart-metric-label">{t('iot.soilMoisture')}</span>
          <span className="smart-metric-value">
            <Droplets size={16} /> {rec.soil}%
          </span>
        </div>

        <div className="smart-metric-card">
          <span className="smart-metric-label">{t('iot.temperature')}</span>
          <span className="smart-metric-value">
            <Thermometer size={16} /> {rec.temp}°C
          </span>
        </div>

        <div className="smart-metric-card">
          <span className="smart-metric-label">{t('iot.humidity')}</span>
          <span className="smart-metric-value">
            {rec.humidity}%
          </span>
        </div>

        <div className="smart-metric-card">
          <span className="smart-metric-label">{t('iot.rainForecast')}</span>
          <span className="smart-metric-value text-sm">
            {rec.isRainExpected ? `🌧️ ${t('iot.expected')}` : `☀️ ${t('iot.clear')}`}
          </span>
        </div>
      </div>

      <div className="smart-reason-box">
        💡 <span>{rec.reason}</span>
      </div>
    </div>
  );
};

export default SmartWateringBanner;
