import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Droplets, Thermometer, Activity, Sun, RefreshCw } from 'lucide-react';
import iotService from '../../services/iotService';
import './IoTSensorHistoryModal.css';

const IoTSensorHistoryModal = ({ plantId, plantName, onClose }) => {
  const { t } = useTranslation();
  const [range, setRange] = useState('24h');
  const [metric, setMetric] = useState('soilMoisture');
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await iotService.getPlantSensorHistory(plantId, range);
      if (res && res.success) {
        setReadings(res.readings || []);
      }
    } catch (err) {
      console.warn('Failed to load sensor history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [plantId, range]);

  const metricsConfig = {
    soilMoisture: { label: t('iot.soilMoisture'), unit: '%', color: '#10b981', icon: Droplets, min: 0, max: 100 },
    temperature: { label: t('iot.temperature'), unit: '°C', color: '#f59e0b', icon: Thermometer, min: 10, max: 45 },
    humidity: { label: t('iot.humidity'), unit: '%', color: '#0284c7', icon: Activity, min: 0, max: 100 },
    light: { label: t('iot.light'), unit: 'lux', color: '#eab308', icon: Sun, min: 0, max: 1500 },
  };

  const currentConfig = metricsConfig[metric];

  const renderSVGChart = () => {
    if (!readings || readings.length === 0) {
      return (
        <div className="iot-chart-empty">
          {t('iot.noHistoryData')}
        </div>
      );
    }

    const width = 600;
    const height = 200;
    const padding = 30;

    const values = readings.map((r) => r[metric] ?? 0);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const valRange = maxVal === minVal ? 1 : maxVal - minVal;

    const points = readings.map((r, i) => {
      const x = padding + (i / Math.max(1, readings.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((r[metric] - minVal) / valRange) * (height - 2 * padding);
      return { x, y, value: r[metric], time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    });

    const pathD = points.reduce((acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div className="iot-svg-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="iot-svg-element">
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentConfig.color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={currentConfig.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeWidth="1" />

          {/* Area fill */}
          <path d={areaD} fill={`url(#grad-${metric})`} />

          {/* Trend Line */}
          <path d={pathD} fill="none" stroke={currentConfig.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="iot-chart-point-group">
              <circle cx={p.x} cy={p.y} r="4" fill={currentConfig.color} className="iot-chart-point" />
              <title>{`${p.time}: ${p.value}${currentConfig.unit}`}</title>
            </g>
          ))}
        </svg>

        <div className="iot-chart-time-labels">
          <span>{points[0]?.time}</span>
          <span>{points[Math.floor(points.length / 2)]?.time}</span>
          <span>{points[points.length - 1]?.time}</span>
        </div>
      </div>
    );
  };

  const values = readings.map((r) => r[metric] ?? 0);
  const minVal = readings.length > 0 ? Math.min(...values) : '--';
  const maxVal = readings.length > 0 ? Math.max(...values) : '--';
  const avgVal = readings.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '--';

  return (
    <div className="iot-modal-overlay">
      <div className="iot-modal-card">
        <button onClick={onClose} className="iot-modal-close-btn" aria-label="Close">
          <X size={20} />
        </button>

        <div className="iot-modal-header">
          <div className="iot-modal-icon">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="iot-modal-title">{plantName} – {t('iot.sensorHistory')}</h3>
            <p className="iot-modal-subtitle">ESP32-TOMATO-01 • Telemetry Analytics</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="iot-range-bar">
          <div className="iot-range-group">
            {[
              { id: '1h', label: t('iot.last1Hour') },
              { id: '24h', label: t('iot.last24Hours') },
              { id: '7d', label: t('iot.last7Days') },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setRange(btn.id)}
                className={`iot-range-btn ${range === btn.id ? 'active' : ''}`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button onClick={fetchHistory} className="iot-refresh-link">
            <RefreshCw size={14} className={loading ? 'iot-spin' : ''} />
            <span>{t('common.refresh', 'Refresh')}</span>
          </button>
        </div>

        {/* Metric Selector Tabs */}
        <div className="iot-tabs-grid">
          {Object.entries(metricsConfig).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isSelected = metric === key;
            return (
              <button
                key={key}
                onClick={() => setMetric(key)}
                className={`iot-tab-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="iot-tab-top">
                  <span>{cfg.label}</span>
                  <Icon size={14} style={{ color: cfg.color }} />
                </div>
                <div className="iot-tab-val">
                  {readings.length > 0 ? `${readings[readings.length - 1][key]} ${cfg.unit}` : '--'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Analytics Summary */}
        <div className="iot-summary-box">
          <div className="iot-sum-item">
            <span className="label">{t('iot.minimum')}</span>
            <span className="val">{minVal} {currentConfig.unit}</span>
          </div>
          <div className="iot-sum-item">
            <span className="label">{t('iot.average')}</span>
            <span className="val highlight">{avgVal} {currentConfig.unit}</span>
          </div>
          <div className="iot-sum-item">
            <span className="label">{t('iot.maximum')}</span>
            <span className="val">{maxVal} {currentConfig.unit}</span>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="iot-chart-box">
          {loading ? (
            <div className="iot-chart-loading">
              <RefreshCw className="iot-spin" size={16} /> {t('iot.loadingTelemetry')}
            </div>
          ) : (
            renderSVGChart()
          )}
        </div>
      </div>
    </div>
  );
};

export default IoTSensorHistoryModal;
