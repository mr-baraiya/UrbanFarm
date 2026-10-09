import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import {
  Droplets,
  Thermometer,
  Sun,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Check,
  X,
  Wind,
  CloudRain,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu
} from 'lucide-react';
import {
  RiDropLine,
  RiDropFill,
  RiLeafLine,
  RiPlantLine,
  RiSunLine,
  RiSunCloudyLine,
  RiShieldCheckLine,
  RiRainyLine,
  RiAlertLine,
  RiMoonLine
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import iotService from '../../services/iotService';
import { useNotification } from '../../hooks/useNotification';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import TomatoPlantSVG from './TomatoPlantSVG';
import './TomatoIoTHub.css';

const DAILY_MAX_SAFE_VOLUME_ML = 600; // Safe 24h over-watering limiter for tomato

const TomatoIoTHub = ({
  plant,
  weather,
  forecast,
  onScheduleUpdate,
  onWateringComplete
}) => {
  const { t, i18n } = useTranslation();
  const { addNotification } = useNotification();

  // Active language helper: supports 'gu', 'gu-IN', 'hi', 'hi-IN', 'en'
  const currentLang = useMemo(() => {
    const l = (i18n.language || 'gu').toLowerCase();
    if (l.startsWith('gu')) return 'gu';
    if (l.startsWith('hi')) return 'hi';
    return 'en';
  }, [i18n.language]);

  const L = useCallback((guText, hiText, enText) => {
    if (currentLang === 'gu') return guText;
    if (currentLang === 'hi') return hiText;
    return enText;
  }, [currentLang]);

  const formatLocalizedTime = useCallback((timeStr) => {
    if (!timeStr) return L('સાંજે 6:30', 'शाम 6:30', 'Evening 6:30 PM');
    const s = String(timeStr).toLowerCase();
    if (s.includes('evening') || s.includes('સાંજ') || s.includes('शाम') || s.includes('6:30')) {
      return L('સાંજે 6:30', 'शाम 6:30', 'Evening 6:30 PM');
    }
    if (s.includes('morning') || s.includes('સવાર') || s.includes('सुबह')) {
      return L('આજે સવારે', 'आज सुबह', 'This Morning');
    }
    if (s.includes('rain') || s.includes('વરસાદ') || s.includes('बारिश')) {
      return L('વરસાદની આગાહી', 'बारिश का अनुमान', 'Rain Expected');
    }
    if (s.includes('moisture') || s.includes('ભેજ') || s.includes('नमी')) {
      return L('ભેજ પૂરતો છે', 'नमी पर्याप्त है', 'Moisture Optimal');
    }
    return timeStr;
  }, [L]);

  // 1. Live ESP32 Sensor Telemetry State
  const [sensorData, setSensorData] = useState({
    soilMoisture: 40.6,
    temperature: 29.7,
    humidity: 46.4,
    light: 669,
    timestamp: new Date().toISOString()
  });
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);

  // 2. Actuator & Dose State
  const [selectedDose, setSelectedDose] = useState(250);
  const [customDose, setCustomDose] = useState('');
  const [isPumping, setIsPumping] = useState(false);
  const [pumpProgress, setPumpProgress] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDose, setPendingDose] = useState(250);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [autoDripEnabled, setAutoDripEnabled] = useState(true);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  const [historyTimeRange, setHistoryTimeRange] = useState('24h');

  // Water tracking state
  const [todayDispensedTotal, setTodayDispensedTotal] = useState(250);
  const [lastWateredLog, setLastWateredLog] = useState({
    time: '07:10 AM',
    date: 'Today',
    amount: 250,
    method: 'auto'
  });
  const [waterTankLevel, setWaterTankLevel] = useState(85);

  // 3. Dynamic Gemini AI Advice State
  const [aiAdviceData, setAiAdviceData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // 4. Dynamic Sensor History & Statistics State
  const [historyReadings, setHistoryReadings] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeHistoryMetric, setActiveHistoryMetric] = useState('soilMoisture');

  // 7-Day AI Schedule State
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [scheduleList, setScheduleList] = useState([]);

  // Hotspot click handler: Scroll to and GSAP highlight the sensor card
  const handleHotspotFocus = useCallback((key) => {
    const targetMap = {
      moisture: 'gauge-moisture',
      temperature: 'gauge-temperature',
      humidity: 'gauge-humidity',
      light: 'gauge-sunlight'
    };
    const targetId = targetMap[key];
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      gsap.fromTo(
        targetEl, 
        { 
          scale: 1.05, 
          boxShadow: '0 0 0 4px #2d6a4f, 0 12px 24px rgba(45, 106, 79, 0.25)', 
          borderColor: '#2d6a4f' 
        },
        { 
          scale: 1, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', 
          borderColor: 'rgba(107, 144, 128, 0.28)', 
          duration: 1.4, 
          ease: 'power2.out' 
        }
      );
    }
  }, []);

  // i18n localized labels for Interactive Botanical Tomato Plant
  const plantLabels = useMemo(() => ({
    soilMoisture: t('plant.moisture', L('જમીનનો ભેજ', 'मिट्टी की नमी', 'Soil Moisture')),
    temperature: t('plant.temperature', L('છોડનું તાપમાન', 'पत्ते का तापमान', 'Temperature')),
    humidity: t('plant.humidity', L('હવામાં ભેજ', 'हवा की नमी', 'Air Humidity')),
    light: t('plant.light', L('સૂર્યપ્રકાશ', 'सूर्य का प्रकाश', 'Light')),
    hintText: L('લાઇવ ટેલિમેટ્રી જોવા માટે સેન્સર પોઈન્ટ પર ટેપ કરો', 'लाइव टेलीमेट्री देखने के लिए सेंसर पॉइंट पर टैप करें', 'Tap a sensor point to view live telemetry'),
    healthy: L('શ્રેષ્ઠ ભેજ', 'इष्टतम नमी', 'Optimal Moisture'),
    dry: L('પાણીની જરૂર છે (ડ્રાય)', 'पानी की आवश्यकता है (सूखा)', 'Needs Water'),
    moderate: L('ડ્રિપ સૂચવેલ', 'ड्रिप अनुशंसित', 'Drip Recommended'),
    wet: L('વધુ ભેજવાળી માટી', 'अधिक नम मिट्टी', 'High Moisture'),
    watering: L('પાણી સિંચાઈ ચાલુ છે...', 'पानी सिंचाई चालू है...', 'Watering in Progress'),
    status: {
      good: t('plant.status.good', L('ઉત્તમ', 'उत्तम', 'Optimal')),
      warn: t('plant.status.warn', L('ધ્યાન આપો', 'ध्यान दें', 'Attention')),
      bad: t('plant.status.bad', L('તાત્કાલિક પગલું લો', 'तुरंत सिंचाई करें', 'Act now')),
      wet: t('plant.status.wet', L('વધુ પડતો ભેજ', 'अधिक गीला', 'Too wet'))
    },
    reset: t('plant.reset', L('દૃશ્ય રીસેટ કરો', 'व्यू रीसेट करें', 'Reset View')),
    healthyActive: t('plant.healthyActive', L('લાઇવ સ્થિતિ', 'लाइव स्थिति', 'Live Specimen'))
  }), [t, L]);

  const sensorDataRef = useRef(sensorData);
  useEffect(() => {
    sensorDataRef.current = sensorData;
  }, [sensorData]);

  // Telemetry Fetch (Only runs on mount or user refresh click)
  const fetchTelemetry = useCallback(async () => {
    try {
      setLoading(true);
      const plantId = plant?._id || 'tomato-01';
      const data = await iotService.getLatestPlantSensors(plantId);
      const r = data?.reading || data?.sensors;
      if (r) {
        const updated = {
          soilMoisture: Number(r.soilMoisture ?? 40.6),
          temperature: Number(r.temperature ?? 29.7),
          humidity: Number(r.humidity ?? 46.4),
          light: Number(r.light ?? 669),
          timestamp: r.timestamp || new Date().toISOString()
        };
        setSensorData(updated);
        setIsOnline(data.isOnline ?? true);
        return updated;
      }
    } catch {
      // Retain telemetry
    } finally {
      setLoading(false);
    }
    return sensorDataRef.current;
  }, [plant?._id]);

  // DYNAMIC GEMINI AI ADVICE FETCH
  const fetchAiAdviceFromBackend = useCallback(async (customSensors = null) => {
    try {
      setAiLoading(true);
      const targetSensors = customSensors || sensorDataRef.current;
      const adviceRes = await iotService.getAiAdvice({
        sensorData: {
          soilMoisture: targetSensors.soilMoisture,
          temperature: targetSensors.temperature,
          humidity: targetSensors.humidity,
          light: targetSensors.light,
          timestamp: targetSensors.timestamp
        },
        weather: weather || {
          main: { temp: 36, humidity: 23 },
          wind: { speed: 0.93 }
        },
        forecast: forecast || null,
        cropStage: 'Flowering & Fruit-Set',
        language: currentLang
      });

      if (adviceRes && adviceRes.headlineText) {
        setAiAdviceData({ ...adviceRes, language: currentLang });
      }
    } catch (err) {
      console.warn('Backend AI advice fetch fallback:', err.message);
    } finally {
      setAiLoading(false);
    }
  }, [weather, forecast, currentLang]);

  // Dynamic Sensor History Fetcher
  const fetchHistoryData = useCallback(async (range = historyTimeRange, customSensors = null) => {
    try {
      setHistoryLoading(true);
      const plantId = plant?._id || 'tomato-01';
      const res = await iotService.getPlantSensorHistory(plantId, range);
      if (res && res.readings && res.readings.length > 0) {
        setHistoryReadings(res.readings);
      } else {
        const mockCount = range === '24h' ? 12 : 7;
        const nowMs = Date.now();
        const stepMs = (range === '24h' ? 24 * 3600 * 1000 : 7 * 24 * 3600 * 1000) / mockCount;
        const target = customSensors || sensorDataRef.current;
        const baseM = target.soilMoisture;
        const baseT = target.temperature;
        const baseH = target.humidity;
        const generated = [];
        for (let i = 0; i < mockCount; i++) {
          const t = new Date(nowMs - (mockCount - 1 - i) * stepMs).toISOString();
          const wave = Math.sin(i / 1.5) * 4;
          generated.push({
            timestamp: t,
            soilMoisture: Number(Math.max(25, Math.min(65, baseM + (range === '7d' ? (i % 3 === 0 ? 8 : -3) : wave))).toFixed(1)),
            temperature: Number(Math.max(22, Math.min(38, baseT + Math.cos(i) * 3)).toFixed(1)),
            humidity: Number(Math.max(30, Math.min(75, baseH - wave * 0.8)).toFixed(1)),
            light: target.light
          });
        }
        setHistoryReadings(generated);
      }
    } catch (err) {
      console.warn('History fetch error:', err.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [plant?._id, historyTimeRange]);

  // Unified manual / navigation refresh handler (NO background interval polling)
  const refreshAllHubData = useCallback(async (isManual = false) => {
    try {
      const liveSensors = await fetchTelemetry();
      await Promise.allSettled([
        fetchAiAdviceFromBackend(liveSensors),
        fetchHistoryData(historyTimeRange, liveSensors)
      ]);
      if (isManual) {
        addNotification(
          L(
            'લાઇવ IoT સેન્સર અને Gemini AI એગ્રોનોમી શેડ્યૂલ અપડેટ થયું.',
            'लाइव IoT सेंसर और Gemini AI एग्रोनॉमी शेड्यूल अपडेट हुआ।',
            'Live IoT sensors & Gemini AI agronomy schedule updated.'
          ),
          'success'
        );
      }
    } catch (err) {
      console.warn('Refresh error:', err);
    }
  }, [fetchTelemetry, fetchAiAdviceFromBackend, fetchHistoryData, historyTimeRange, addNotification, L]);

  // Initial load on mount or plant change ONLY
  useEffect(() => {
    refreshAllHubData(false);
  }, [plant?._id]);

  // Custom IoT data update event listener
  useEffect(() => {
    const handleCustomUpdate = async (e) => {
      if (e.detail?.reading) {
        const r = e.detail.reading;
        const updated = {
          soilMoisture: Number(r.soilMoisture ?? 40.6),
          temperature: Number(r.temperature ?? 29.7),
          humidity: Number(r.humidity ?? 46.4),
          light: Number(r.light ?? 669),
          timestamp: r.timestamp || new Date().toISOString()
        };
        setSensorData(updated);
        setIsOnline(true);
      }
    };
    window.addEventListener('iot-data-updated', handleCustomUpdate);

    return () => {
      window.removeEventListener('iot-data-updated', handleCustomUpdate);
    };
  }, []);

  // Range change only fetches history
  useEffect(() => {
    fetchHistoryData(historyTimeRange);
  }, [historyTimeRange, fetchHistoryData]);

  // Language switch: instantly invalidate stale AI cache to prevent mixed language display
  useEffect(() => {
    setAiAdviceData(null);
  }, [currentLang]);

  const [chartHover, setChartHover] = useState(null);

  // Helper to generate a smooth Catmull-Rom cubic bezier curve for SVG
  const getSmoothSplinePath = (pts) => {
    if (!pts || pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
    if (pts.length === 2) return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`;

    let path = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    const tension = 0.22;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return path;
  };

  // Statistical aggregates (Min / Max / Avg) with noise filtering
  const historyStats = useMemo(() => {
    if (!historyReadings || historyReadings.length === 0) {
      return {
        soilMoisture: { current: Number(sensorData.soilMoisture.toFixed(1)), avg: Number(sensorData.soilMoisture.toFixed(1)), min: Number(sensorData.soilMoisture.toFixed(1)), max: Number(sensorData.soilMoisture.toFixed(1)) },
        temperature: { current: Number(sensorData.temperature.toFixed(1)), avg: Number(sensorData.temperature.toFixed(1)), min: Number(sensorData.temperature.toFixed(1)), max: Number(sensorData.temperature.toFixed(1)) },
        humidity: { current: Number(sensorData.humidity.toFixed(1)), avg: Number(sensorData.humidity.toFixed(1)), min: Number(sensorData.humidity.toFixed(1)), max: Number(sensorData.humidity.toFixed(1)) }
      };
    }
    const mList = historyReadings.map(r => Number(r.soilMoisture ?? 0)).filter(v => v > 0 && !isNaN(v));
    const tList = historyReadings.map(r => Number(r.temperature ?? 0)).filter(v => v > 0 && !isNaN(v));
    const hList = historyReadings.map(r => Number(r.humidity ?? 0)).filter(v => v > 0 && !isNaN(v));

    const avg = (arr, fallback) => arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : fallback;
    const min = (arr, fallback) => arr.length ? Number(Math.min(...arr).toFixed(1)) : fallback;
    const max = (arr, fallback) => arr.length ? Number(Math.max(...arr).toFixed(1)) : fallback;

    return {
      soilMoisture: {
        current: Number(sensorData.soilMoisture.toFixed(1)),
        avg: avg(mList, Number(sensorData.soilMoisture.toFixed(1))),
        min: min(mList, Number(sensorData.soilMoisture.toFixed(1))),
        max: max(mList, Number(sensorData.soilMoisture.toFixed(1)))
      },
      temperature: {
        current: Number(sensorData.temperature.toFixed(1)),
        avg: avg(tList, Number(sensorData.temperature.toFixed(1))),
        min: min(tList, Number(sensorData.temperature.toFixed(1))),
        max: max(tList, Number(sensorData.temperature.toFixed(1)))
      },
      humidity: {
        current: Number(sensorData.humidity.toFixed(1)),
        avg: avg(hList, Number(sensorData.humidity.toFixed(1))),
        min: min(hList, Number(sensorData.humidity.toFixed(1))),
        max: max(hList, Number(sensorData.humidity.toFixed(1)))
      }
    };
  }, [historyReadings, sensorData]);

  // Enhanced Interactive SVG Trend Area Chart Renderer
  const renderMiniSparkline = () => {
    if (!historyReadings || historyReadings.length < 2) return null;

    const width = 540;
    const height = 145;
    const pad = { top: 16, right: 18, bottom: 26, left: 42 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;

    const metricConfig = {
      soilMoisture: {
        unit: '%',
        color: '#0284c7',
        gradId: 'moistureAreaGrad',
        targetMin: 50,
        targetMax: 70,
        targetLabel: L('શ્રેષ્ઠ શ્રેણી (50–70%)', 'इष्टतम रेंज (50–70%)', 'Target (50–70%)'),
      },
      temperature: {
        unit: '°C',
        color: '#ea580c',
        gradId: 'tempAreaGrad',
        targetMin: 20,
        targetMax: 30,
        targetLabel: L('શ્રેષ્ઠ શ્રેણી (20–30°C)', 'इष्टतम रेंज (20–30°C)', 'Target (20–30°C)'),
      },
      humidity: {
        unit: '%',
        color: '#16a34a',
        gradId: 'humidityAreaGrad',
        targetMin: 45,
        targetMax: 70,
        targetLabel: L('શ્રેષ્ઠ શ્રેણી (45–70%)', 'इष्टतम रेंज (45–70%)', 'Target (45–70%)'),
      }
    };

    const cfg = metricConfig[activeHistoryMetric] || metricConfig.soilMoisture;

    // Sanitize readings (replace non-positive values with adjacent/current valid values)
    const rawValues = historyReadings.map(r => Number(r[activeHistoryMetric] ?? 0));
    const validValues = rawValues.filter(v => v > 0 && !isNaN(v));
    const fallbackVal = validValues.length ? validValues[validValues.length - 1] : 35;
    const cleanValues = rawValues.map(v => (v > 0 ? v : fallbackVal));

    const dataMin = Math.min(...cleanValues);
    const dataMax = Math.max(...cleanValues);

    const yMin = Math.max(0, Math.floor(Math.min(dataMin, cfg.targetMin) / 10) * 10);
    const yMax = Math.ceil(Math.max(dataMax, cfg.targetMax) / 10) * 10;
    const yRange = yMax === yMin ? 1 : yMax - yMin;

    const getY = (v) => pad.top + innerH - ((v - yMin) / yRange) * innerH;
    const getX = (i) => pad.left + (i / (cleanValues.length - 1)) * innerW;

    const pts = cleanValues.map((v, i) => ({
      x: getX(i),
      y: getY(v),
      val: v,
      timestamp: historyReadings[i]?.timestamp
    }));

    const splineLinePath = getSmoothSplinePath(pts);
    const splineAreaPath = `${splineLinePath} L ${pts[pts.length - 1].x.toFixed(1)},${pad.top + innerH} L ${pts[0].x.toFixed(1)},${pad.top + innerH} Z`;

    // Target zone coordinates
    const targetTopY = Math.max(pad.top, getY(cfg.targetMax));
    const targetBottomY = Math.min(pad.top + innerH, getY(cfg.targetMin));
    const targetBandH = Math.max(2, targetBottomY - targetTopY);

    const yMid = (yMax + yMin) / 2;

    const timelineLabels = historyTimeRange === '24h' 
      ? ['24h ago', '18h', '12h', '6h', 'Now']
      : ['6d ago', '4d', '2d', 'Today'];

    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const normalizedX = (clientX / rect.width) * width;
      const closestIdx = pts.reduce((bestIdx, p, idx) => {
        return Math.abs(p.x - normalizedX) < Math.abs(pts[bestIdx].x - normalizedX) ? idx : bestIdx;
      }, 0);
      setChartHover(pts[closestIdx]);
    };

    return (
      <div className="mini-sparkline-box">
        <div className="sparkline-metric-tabs">
          <button
            type="button"
            className={`spark-tab ${activeHistoryMetric === 'soilMoisture' ? 'active-moisture' : ''}`}
            onClick={() => { setActiveHistoryMetric('soilMoisture'); setChartHover(null); }}
          >
            <Droplets size={13} /> {L('જમીનનો ભેજ', 'मिट्टी की नमी', 'Soil Moisture')}
          </button>
          <button
            type="button"
            className={`spark-tab ${activeHistoryMetric === 'temperature' ? 'active-temp' : ''}`}
            onClick={() => { setActiveHistoryMetric('temperature'); setChartHover(null); }}
          >
            <Thermometer size={13} /> {L('તાપમાન', 'तापमान', 'Temperature')}
          </button>
          <button
            type="button"
            className={`spark-tab ${activeHistoryMetric === 'humidity' ? 'active-humidity' : ''}`}
            onClick={() => { setActiveHistoryMetric('humidity'); setChartHover(null); }}
          >
            <Wind size={13} /> {L('હવામાં ભેજ', 'हवा की नमी', 'Humidity')}
          </button>
        </div>

        <div className="sparkline-stats-row">
          <span className="stat-pill">{L('હાલનું', 'वर्तमान', 'Current')}: <strong>{historyStats[activeHistoryMetric]?.current}{cfg.unit}</strong></span>
          <span className="stat-pill">{L('સરેરાશ', 'औसत', 'Avg')}: <strong>{historyStats[activeHistoryMetric]?.avg}{cfg.unit}</strong></span>
          <span className="stat-pill">{L('લઘુત્તમ', 'न्यूनतम', 'Min')}: <strong>{historyStats[activeHistoryMetric]?.min}{cfg.unit}</strong></span>
          <span className="stat-pill">{L('મહત્તમ', 'अधिकतम', 'Max')}: <strong>{historyStats[activeHistoryMetric]?.max}{cfg.unit}</strong></span>
        </div>

        <div className="history-chart-wrapper">
          {chartHover && (
            <div
              className="chart-tooltip-box"
              style={{
                left: `${(chartHover.x / width) * 100}%`,
                top: `${(chartHover.y / height) * 100}%`
              }}
            >
              <span>{chartHover.val.toFixed(1)}{cfg.unit}</span>
              {chartHover.timestamp && (
                <span style={{ opacity: 0.8, marginLeft: '6px', fontSize: '0.72rem' }}>
                  • {new Date(chartHover.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="history-svg-chart"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setChartHover(null)}
          >
            <defs>
              <linearGradient id="moistureAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="humidityAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16a34a" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#16a34a" stopOpacity="0.02" />
              </linearGradient>
              <filter id="chartGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={cfg.color} floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Target Agronomic Zone Band */}
            <rect
              x={pad.left}
              y={targetTopY}
              width={innerW}
              height={targetBandH}
              fill="rgba(34, 197, 94, 0.08)"
              rx="4"
            />
            <line
              x1={pad.left}
              y1={targetTopY}
              x2={pad.left + innerW}
              y2={targetTopY}
              stroke="rgba(34, 197, 94, 0.35)"
              strokeDasharray="4 3"
              strokeWidth="1"
            />
            <text
              x={pad.left + innerW - 4}
              y={targetTopY + 11}
              textAnchor="end"
              className="chart-target-text"
            >
              {cfg.targetLabel}
            </text>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            <line x1={pad.left} y1={pad.top} x2={pad.left + innerW} y2={pad.top} stroke="rgba(107, 144, 128, 0.15)" strokeDasharray="3 3" />
            <text x={pad.left - 6} y={pad.top + 3.5} textAnchor="end" className="chart-axis-text">{yMax}{cfg.unit}</text>

            <line x1={pad.left} y1={pad.top + innerH / 2} x2={pad.left + innerW} y2={pad.top + innerH / 2} stroke="rgba(107, 144, 128, 0.15)" strokeDasharray="3 3" />
            <text x={pad.left - 6} y={pad.top + innerH / 2 + 3.5} textAnchor="end" className="chart-axis-text">{Math.round(yMid)}{cfg.unit}</text>

            <line x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH} stroke="rgba(107, 144, 128, 0.25)" />
            <text x={pad.left - 6} y={pad.top + innerH + 3.5} textAnchor="end" className="chart-axis-text">{yMin}{cfg.unit}</text>

            {/* Smooth Spline Area Fill */}
            <path d={splineAreaPath} fill={`url(#${cfg.gradId})`} />

            {/* Smooth Spline Curve Stroke */}
            <path
              d={splineLinePath}
              fill="none"
              stroke={cfg.color}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#chartGlow)"
            />

            {/* Interactive Hover Point & Cursor Line */}
            {chartHover && (
              <g>
                <line
                  x1={chartHover.x}
                  y1={pad.top}
                  x2={chartHover.x}
                  y2={pad.top + innerH}
                  stroke="#64748b"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={chartHover.x}
                  cy={chartHover.y}
                  r="5.5"
                  fill={cfg.color}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* X-Axis Timeline Labels */}
            {timelineLabels.map((lbl, idx) => {
              const xPos = pad.left + (idx / (timelineLabels.length - 1)) * innerW;
              const anchor = idx === 0 ? 'start' : idx === timelineLabels.length - 1 ? 'end' : 'middle';
              return (
                <text
                  key={`timeline-${idx}`}
                  x={xPos}
                  y={height - 6}
                  textAnchor={anchor}
                  className="chart-axis-text"
                >
                  {lbl}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // P0: SINGLE UNIFIED DECISION ENGINE
  // -------------------------------------------------------------
  const decision = useMemo(() => {
    if (aiAdviceData && aiAdviceData.language === currentLang && aiAdviceData.headlineText) {
      return {
        recommendationMl: Number(aiAdviceData.recommendation_ml ?? 250),
        timingLabel: aiAdviceData.best_time || L('આજે સાંજે 6:30 પછી', 'आज शाम 6:30 के बाद', 'This evening after 6:30 PM'),
        headlineText: aiAdviceData.headlineText,
        explanationText: aiAdviceData.explanation,
        tips: Array.isArray(aiAdviceData.tips) && aiAdviceData.tips.length > 0 ? aiAdviceData.tips : [
          L('કેલ્શિયમ સંતુલન (Blossom End Rot બચાવ): 50–70% સમાન ભેજ રાખો જેથી કેલ્શિયમ શોષાય અને ફળ સડતા અટકે.', 'कैल्शियम संतुलन: 50–70% एकसमान नमी बनाए रखने से टमाटर नीचे से सड़ने से बचते हैं।', 'Blossom End Rot Prevention: Steady 50–70% moisture ensures calcium uptake and prevents fruit rot.'),
          L('ગરમીથી રક્ષણ: તાપમાન 35°C થી વધતાં ફૂલ ખરી શકે છે. ગ્રીન શેડ નેટ વાપરો.', 'गर्मी से सुरक्षा: तापमान 35°C से ऊपर जाने पर फूल झड़ने लगते हैं। ग्रीन शेड नेट का उपयोग करें।', 'Heat Defense: Flowers drop above 35°C. Use green shade net and mulch.')
        ],
        weatherAlert: aiAdviceData.weatherAlert || L('તીવ્ર ગરમી (36°C) — બપોરે પાણી ન આપો. સાંજે 6:30 પછી આપો.', 'तेज गर्मी (36°C) — दोपहर में पानी न दें। शाम 6:30 के बाद दें।', 'Extreme Heat (36°C) — Avoid midday irrigation. Water in the evening after 6:30 PM.'),
        nextHours: Number(aiAdviceData.next_watering_hours ?? 1),
        heatStressLevel: aiAdviceData.stress?.heat || 'High',
        waterStressLevel: aiAdviceData.stress?.water || 'Medium',
        plantHealthScore: Number(aiAdviceData.plant_health_score ?? 82)
      };
    }

    const now = new Date();
    const currentHour = now.getHours();
    const moisture = sensorData.soilMoisture;
    const plantTemp = sensorData.temperature;
    const outsideTemp = Math.round(weather?.main?.temp || 36);
    const rainChance = Number(forecast?.list?.[0]?.pop ? forecast.list[0].pop * 100 : 10);
    const isExtremeHeat = outsideTemp >= 35 || plantTemp >= 35;

    const isMoistureOptimal = moisture >= 55 && moisture <= 70;
    const isMoistureWet = moisture > 70;
    const isRainHigh = rainChance >= 60;

    let recommendationMl = 0;
    let timingLabel = '';
    let headlineText = '';
    let explanationText = '';
    let nextHours = 0;
    let heatStressLevel = isExtremeHeat ? 'High' : outsideTemp > 30 ? 'Medium' : 'Low';
    let waterStressLevel = moisture < 35 ? 'High' : moisture < 48 ? 'Medium' : 'Low';

    if (isRainHigh) {
      recommendationMl = 0;
      timingLabel = L('વરસાદની આગાહી', 'बारिश का अनुमान', 'Rain Expected');
      headlineText = L('આજે પાણી આપવાની જરૂર નથી', 'आज पानी देने की आवश्यकता नहीं है', 'No Water Needed Today');
      explanationText = L(`આજે ${rainChance}% વરસાદની સંભાવના છે, તેથી સિંચાઈ મુલતવી રાખવામાં આવી છે.`, `आज ${rainChance}% बारिश की संभावना है, सिंचाई रोक दी गई है।`, `Rain chance is ${rainChance}%. Irrigation paused to save water.`);
      nextHours = 24;
    } else if (isMoistureOptimal || isMoistureWet) {
      recommendationMl = 0;
      timingLabel = L('ભેજ પૂરતો છે', 'नमी पर्याप्त है', 'Moisture is Optimal');
      headlineText = L('આજે પાણી આપવાની જરૂર નથી', 'आज पानी देने की आवश्यकता नहीं है', 'No Water Needed Today');
      explanationText = L(`જમીનમાં ભેજ ${moisture.toFixed(1)}% છે (ઉત્તમ સ્તર: 50%–70%). મૂળના શ્વસન માટે આજે આરામ આપો.`, `मिट्टी में नमी ${moisture.toFixed(1)}% है (उत्तम स्तर: 50%-70%)। आज पानी की आवश्यकता नहीं है।`, `Soil moisture is ${moisture.toFixed(1)}% (Optimal band: 50%–70%). Resting root zone for healthy respiration.`);
      nextHours = isMoistureOptimal ? 12 : 24;
    } else if (isExtremeHeat) {
      recommendationMl = 250;
      timingLabel = L('સાંજે 6:30 પછી', 'शाम 6:30 के बाद', 'Evening 6:30 PM');
      headlineText = L('250 મિ.લિ. સાંજે 6:30 પછી આપો', '250 मि.ली. शाम 6:30 के बाद दें', 'Dispense 250 ml in Evening');
      explanationText = L(`બપોરે ${outsideTemp}°C ગરમીમાં પાણી આપવાથી બાષ્પીભવન થશે અને મૂળ દાઝી શકે છે. સાંજે 6:30 પછી ડ્રિપ ચાલુ કરો.`, `दोपहर में ${outsideTemp}°C धूप में पानी न दें। शाम 6:30 के बाद ड्रिप चलाएं।`, `Extreme afternoon heat (${outsideTemp}°C) causes thermal stress. Irrigating at 6:30 PM prevents water scalding and maximizes absorption.`);
      nextHours = (currentHour >= 18 && currentHour <= 21) ? 0 : currentHour > 21 ? 10 : Math.max(1, 18 - currentHour);
    } else {
      recommendationMl = 250;
      timingLabel = currentHour < 12 ? L('આજે સવારે', 'आज सुबह', 'This Morning') : L('સાંજે 6:30', 'शाम 6:30', 'Evening 6:30 PM');
      headlineText = L('250 મિ.લિ. પાણી આપો', '250 मि.ली. पानी दें', 'Water now: 250 ml');
      explanationText = L(`જમીનનો ભેજ ${moisture.toFixed(1)}% છે, જે 50% ના લક્ષ્યાંકથી ઓછો છે. 250 મિ.લિ. ડ્રિપની ભલામણ છે.`, `मिट्टी की नमी ${moisture.toFixed(1)}% है। 250 मि.ली. ड्रिप की आवश्यकता है।`, `Soil moisture is ${moisture.toFixed(1)}%, below the 50% threshold. Recommend 250 ml root drip.`);
      nextHours = currentHour < 12 ? 0 : Math.max(1, 18 - currentHour);
    }

    return {
      recommendationMl,
      timingLabel,
      headlineText,
      explanationText,
      tips: [
        L('કેલ્શિયમ સંતુલન (Blossom End Rot બચાવ): 50–70% સમાન ભેજ રાખો જેથી ટામેટાના તળિયા કાળા ન પડે.', 'कैल्शियम संतुलन: 50–70% एकसमान नमी बनाए रखने से टमाटर नीचे से सड़ने से बचते हैं।', 'Blossom End Rot Prevention: Steady 50–70% moisture ensures calcium uptake and prevents fruit rot.'),
        L('ગરમીથી રક્ષણ: તાપમાન 35°C થી વધતાં ફૂલ ખરી શકે છે. ગ્રીન શેડ નેટ અને મલ્ચિંગ વાપરો.', 'गर्मी से सुरक्षा: तापमान 35°C से ऊपर जाने पर फूल झड़ने लगते हैं। ग्रीन शेड नेट और मल्चिंग का उपयोग करें।', 'Heat Defense: Flowers drop above 35°C. Use green shade net and mulch.')
      ],
      weatherAlert: L(`તીવ્ર ગરમી (${outsideTemp}°C) — બપોરે પાણી ન આપો. સાંજે 6:30 પછી આપો.`, `तेज गर्मी (${outsideTemp}°C) — दोपहर में पानी न दें। शाम 6:30 के बाद दें।`, `Extreme Heat (${outsideTemp}°C) — Avoid midday irrigation. Water in the evening after 6:30 PM.`),
      nextHours,
      heatStressLevel,
      waterStressLevel,
      plantHealthScore: isExtremeHeat && moisture < 40 ? 74 : moisture < 45 ? 82 : 92
    };
  }, [sensorData, weather, forecast, aiAdviceData, L]);

  // Synchronized 7-Day Plan
  useEffect(() => {
    if (aiAdviceData?.language === currentLang && aiAdviceData?.schedule && Array.isArray(aiAdviceData.schedule) && aiAdviceData.schedule.length >= 7) {
      setScheduleList(aiAdviceData.schedule);
      return;
    }

    const today = new Date();
    const days = [];
    const dayNamesGu = ['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'];
    const dayNamesHi = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dayIdx = d.getDay();
      const dateStr = d.toISOString().split('T')[0];
      const isLiveForecast = i < 3;

      let amount = '0 ml';
      let reason = '';
      let timeOfDay = L('સાંજે 6:30', 'शाम 6:30', 'Evening 6:30 PM');

      if (i === 0) {
        amount = `${decision.recommendationMl} ml`;
        reason = decision.explanationText;
      } else if (i === 1) {
        amount = '0 ml';
        reason = L('મૂળના શ્વસન અને ઓક્સિજન માટે આરામનો દિવસ. ભેજ સંગ્રહાયેલ છે.', 'जड़ों के श्वसन और आराम का दिन। नमी सुरक्षित है।', 'Rest day for root aeration. Soil moisture retained.');
      } else if (i === 2) {
        amount = '250 ml';
        reason = L('ફૂલ અને ફળ ધારણ માટે કેલ્શિયમ પોષણ ડ્રિપ.', 'फूल व फल लगने के लिए कैल्शियम पोषण ड्रिप।', 'Flowering & fruit-set calcium intake maintenance.');
      } else if (i === 3) {
        amount = '0 ml';
        reason = L('અંદાજિત શેડ્યૂલ: જમીનમાં પૂરતો ભેજ સંગ્રહાયેલ છે.', 'अनुमानित शेड्यूल: मिट्टी में पर्याप्त नमी उपलब्ध।', 'Estimated schedule: Soil moisture buffer optimal.');
      } else if (i === 4) {
        amount = '200 ml';
        reason = L('અંદાજિત શેડ્યૂલ: સામાન્ય જાળવણી માટે હળવું પાણી.', 'अनुमानित शेड्यूल: हल्की सिंचाई।', 'Estimated schedule: Light maintenance sip.');
      } else {
        amount = i % 2 === 0 ? '200 ml' : '0 ml';
        reason = L('અંદાજિત શેડ્યૂલ: સાપ્તાહિક ચક્ર.', 'अनुमानित शेड्यूल: साप्ताहिक चक्र।', 'Estimated schedule: Standard weekly cycle.');
      }

      const dayLabel = i === 0
        ? L('આજે', 'आज', 'Today')
        : (currentLang === 'gu' ? dayNamesGu[dayIdx] : currentLang === 'hi' ? dayNamesHi[dayIdx] : dayNamesEn[dayIdx]);

      days.push({
        dayIndex: i,
        date: dateStr,
        dayLabel,
        amount,
        timeOfDay,
        isLiveForecast,
        reason
      });
    }

    setScheduleList(days);
  }, [decision, currentLang, aiAdviceData, L]);

  // Calibrated Light Label
  const lightDisplay = useMemo(() => {
    const lux = sensorData.light;
    if (lux < 200) {
      return {
        tag: L('ઓછો પ્રકાશ / રાત્રિ', 'कम रोशनी / रात', 'Low Light / Night'),
        icon: <RiMoonLine className="gauge-status-svg" style={{ color: '#64748b' }} />
      };
    }
    if (lux < 2500) {
      return {
        tag: L('આછો છાંયો / સવારનો તડકો', 'छांव / सुबह की धूप', 'Partial Shade / Diffuse'),
        icon: <RiSunCloudyLine className="gauge-status-svg" style={{ color: '#f59e0b' }} />
      };
    }
    if (lux < 20000) {
      return {
        tag: L('સાધારણ સૂર્યપ્રકાશ', 'मध्यम धूप', 'Moderate Sun'),
        icon: <RiSunLine className="gauge-status-svg" style={{ color: '#eab308' }} />
      };
    }
    return {
      tag: L('સંપૂર્ણ તડકો (>20k lux)', 'पूर्ण धूप (>20k lux)', 'Full Sun (>20k lux)'),
      icon: <RiSunLine className="gauge-status-svg" style={{ color: '#f97316' }} />
    };
  }, [sensorData.light, L]);

  // Safe Actuation Trigger Flow
  const handleDispenseClick = (volume) => {
    const dose = Number(volume);
    if (!dose || dose <= 0) return;

    if (todayDispensedTotal + dose > DAILY_MAX_SAFE_VOLUME_ML) {
      alert(L(
        `ચેતવણી: દૈનિક સલામત મર્યાદા ${DAILY_MAX_SAFE_VOLUME_ML} મિ.લિ. છે. કૃપા કરીને વધુ પડતું પાણી ન આપો.`,
        `चेतावनी: दैनिक सुरक्षित सीमा ${DAILY_MAX_SAFE_VOLUME_ML} मि.ली. है। कृपया अधिक पानी न दें।`,
        `Safety Alert: Daily limit of ${DAILY_MAX_SAFE_VOLUME_ML} ml reached. Avoid over-watering.`
      ));
      return;
    }

    setPendingDose(dose);
    setShowConfirmModal(true);
  };

  const confirmAndDispense = async () => {
    setShowConfirmModal(false);
    await executeWatering(pendingDose);
  };

  const executeWatering = async (dose) => {
    try {
      setIsPumping(true);
      setPumpProgress(0);

      const plantId = plant?._id || 'tomato-01';
      await iotService.triggerPump(plantId, dose);

      const durationMs = 3000;
      const stepMs = 100;
      const stepInc = (100 / (durationMs / stepMs));

      const timer = setInterval(() => {
        setPumpProgress((prev) => {
          const nextVal = Math.round(prev + stepInc);
          if (nextVal >= 100) {
            clearInterval(timer);
            setIsPumping(false);
            setTodayDispensedTotal((tot) => tot + dose);
            setWaterTankLevel((prevL) => Math.max(0, prevL - Math.round(dose / 20)));
            setSensorData((prevS) => ({
              ...prevS,
              soilMoisture: Math.min(75, prevS.soilMoisture + Math.round(dose / 35))
            }));
            setLastWateredLog({
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: L('આજે', 'आज', 'Today'),
              amount: dose,
              method: 'manual'
            });
            setActionFeedback({
              type: 'success',
              text: L(
                `સફળતાપૂર્વક ${dose} મિ.લિ. પાણી આપ્યું!`,
                `सफलतापूर्वक ${dose} मि.ली. पानी दिया गया!`,
                `Successfully dispensed ${dose} ml water!`
              )
            });
            addNotification(
              L(
                `ટામેટાના છોડને ${dose} મિ.લિ. પાણી આપવામાં આવ્યું.`,
                `टमाटर के पौधे को ${dose} मि.ली. पानी दिया गया।`,
                `Dispensed ${dose} ml water to Tomato plant.`
              ),
              'success'
            );
            if (onWateringComplete) onWateringComplete(dose);
            return 100;
          }
          return Math.min(99, nextVal);
        });
      }, stepMs);
    } catch (err) {
      setIsPumping(false);
      setActionFeedback({
        type: 'error',
        text: L('પંપ ચાલુ કરવામાં ભૂલ આવી.', 'पंप चलाने में त्रुटि हुई।', 'Failed to trigger pump.')
      });
    }
  };

  const handleWateredByHand = () => {
    const dose = selectedDose;
    setTodayDispensedTotal((tot) => tot + dose);
    setSensorData((prevS) => ({
      ...prevS,
      soilMoisture: Math.min(75, prevS.soilMoisture + Math.round(dose / 35))
    }));
    setLastWateredLog({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: L('આજે', 'आज', 'Today'),
      amount: dose,
      method: 'manual'
    });
    setActionFeedback({
      type: 'success',
      text: L(
        `હાથેથી પાણી આપવાની નોંધ થઈ (${dose} મિ.લિ.).`,
        `हाथ से पानी देने का रिकॉर्ड दर्ज किया गया (${dose} मि.ली.)।`,
        `Logged manual watering of ${dose} ml.`
      )
    });
  };

  const handleSkipToday = () => {
    setActionFeedback({
      type: 'info',
      text: L('આજનું પાણી મુલતવી રાખવામાં આવ્યું.', 'आज का पानी छोड़ दिया गया।', 'Watering skipped for today.')
    });
  };

  const gardenTitle = plant?.gardenTitle || plant?.garden || "Priya's Balcony Farm";
  const plantName = plant?.name || 'Tomato (Balcony Garden)';
  const plantVariety = plant?.variety || 'Sweet 100 Cherry & Roma';
  const selectedDay = scheduleList[selectedDayIndex] || scheduleList[0];

  const lastWateredDateDisplay = lastWateredLog.date === 'Today' || lastWateredLog.date === 'આજે' || lastWateredLog.date === 'आज'
    ? L('આજે', 'आज', 'Today')
    : lastWateredLog.date;

  return (
    <div className="farmer-iot-hub">
      {/* Top Bar: Telemetry Refresh & Status */}
      <div className="hub-top-bar">
        <button
          type="button"
          onClick={() => refreshAllHubData(true)}
          disabled={loading || aiLoading}
          className="btn-hub-refresh"
        >
          <RefreshCw size={15} className={`refresh-icon-spin ${loading || aiLoading ? 'spinning' : ''}`} />
          <span>{loading || aiLoading ? L('રીફ્રેશ થઈ રહ્યું છે...', 'रिफ्रेश हो रहा है...', 'Syncing Telemetry...') : L('ડેટા રીફ્રેશ કરો', 'डेटा रिफ्रेश करें', 'Refresh Live Data')}</span>
        </button>

        <div className="single-status-line">
          <span style={{ color: isOnline ? '#15803d' : '#b91c1c', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOnline ? '#15803d' : '#b91c1c' }}></span>
            {isOnline ? L('ESP32 લાઇવ કનેક્ટેડ', 'ESP32 लाइव कनेक्टेड', 'ESP32 Live Connected') : L('કનેક્શન ઑફલાઇન', 'कनेक्शन ऑफलाइन', 'Connection Offline')}
          </span>
          <span style={{ color: '#64748b', marginLeft: '8px' }}>
            • {L('છેલ્લું અપડેટ', 'अंतिम अपडेट', 'Updated')} {new Date(sensorData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Two Column Dashboard Grid */}
      <div className="watering-hub-two-col-layout">
        {/* Left Column: 3D Plant Specimen, Decision Hero, 4 Gauges, AI Suggestion, ESP32 Hardware Details */}
        <div className="watering-hub-col-left">

          {/* TOP-MOST SPECIMEN CARD: 3D Procedural Tomato Twin */}
          <section className="plant-specimen-header-card">
            <div className="specimen-header-info">
              <div className="specimen-badge-row">
                <span className="garden-tag-pill">
                  <TbPlant2 size={14} /> {getLocalizedDynamicText(gardenTitle, currentLang)}
                </span>
                <span className="flowering-chip">
                  <RiLeafLine size={13} /> {L('ફૂલ અને ફળ બેસવાનો તબક્કો', 'फूल और फल लगने की अवस्था', 'Flowering & Fruit-Set Stage')}
                </span>
              </div>
              <h3 className="plant-title-text">{getLocalizedDynamicText(plantName, currentLang)}</h3>
              <p className="plant-variety-text">{getLocalizedDynamicText(plantVariety, currentLang)}</p>
            </div>

            {/* Interactive Botanical SVG Tomato Plant Specimen */}
            <TomatoPlantSVG
              sensors={{
                moisture: sensorData.soilMoisture,
                temperature: sensorData.temperature,
                humidity: sensorData.humidity,
                lux: sensorData.light
              }}
              watering={isPumping}
              labels={plantLabels}
            />
          </section>

          {/* SECTION 2: Big Decision Hero Banner */}
          <section className={`hub-decision-hero ${decision.recommendationMl > 0 ? 'hero-water-needed' : 'hero-optimal'}`}>
            <div className="decision-hero-main">
              <div className="decision-hero-icon">
                {decision.recommendationMl > 0 ? <RiDropFill size={26} /> : <CheckCircle2 size={26} />}
              </div>

              <div className="decision-hero-texts">
                <h3 className="decision-hero-title">
                  {decision.headlineText}
                </h3>
                <p className="decision-hero-subtitle">
                  {decision.recommendationMl > 0
                    ? `${L('શ્રેષ્ઠ સમય', 'उत्तम समय', 'Best Time')}: ${decision.timingLabel} • ${L('આગામી', 'अगली सिंचाई', 'Next in')} ~${decision.nextHours} ${L('કલાક', 'घंटे', 'hours')}`
                    : decision.explanationText}
                </p>
              </div>
            </div>

            <div className="decision-hero-actions">
              {decision.recommendationMl > 0 && (
                <button
                  type="button"
                  disabled={isPumping}
                  className="btn-hero-dispense"
                  onClick={() => handleDispenseClick(decision.recommendationMl)}
                >
                  <RiDropFill size={17} />
                  <span>{isPumping ? `${Math.round(pumpProgress)}%` : `${L('પાણી આપો', 'पानी दें', 'Dispense')} (${decision.recommendationMl} ml)`}</span>
                </button>
              )}
            </div>
          </section>

          {/* Feedback Banner on Actuation Result */}
          {actionFeedback && (
            <div className={`action-feedback-banner ${actionFeedback.type}`}>
              <div className="feedback-text-wrap">
                {actionFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                <span>{actionFeedback.text}</span>
              </div>
              <button type="button" onClick={() => setActionFeedback(null)} className="btn-close-feedback">
                <X size={16} />
              </button>
            </div>
          )}

          {/* SECTION 3: 4 Calibrated Sensor Gauges */}
          <div className="sensor-matrix-grid">

            {/* 1. Soil Moisture Gauge */}
            <div id="gauge-moisture" className={`gauge-box ${sensorData.soilMoisture < 45 ? 'status-amber' : sensorData.soilMoisture <= 70 ? 'status-green' : 'status-amber'}`}>
              <div className="gauge-icon-circle icon-moisture"><Droplets size={19} /></div>
              <span className="gauge-label">{L('જમીનનો ભેજ', 'मिट्टी की नमी', 'Soil Moisture')}</span>
              <div className="gauge-value-row">
                <strong className="gauge-big-num">{sensorData.soilMoisture.toFixed(1)}%</strong>
              </div>
              <div className="moisture-target-bar-wrap">
                <div className="target-optimal-zone" style={{ left: '50%', width: '20%' }} title={L('શ્રેષ્ઠ લક્ષ્ય વિસ્તાર: 50%-70%', 'उत्तम लक्ष्य दायरा: 50%-70%', 'Optimal target band: 50%-70%')}></div>
                <div className="moisture-current-marker" style={{ left: `${Math.min(100, Math.max(0, sensorData.soilMoisture))}%` }}></div>
              </div>
              <span className="gauge-sub-info">
                {sensorData.soilMoisture < 45 ? (
                  <span className="tag-warning"><AlertTriangle size={12} /> {L('ઓછો ભેજ (લક્ષ્ય: 50-70%)', 'कम नमी (लक्ष्य: 50-70%)', 'Low (<50%)')}</span>
                ) : (
                  <span className="tag-optimal"><CheckCircle2 size={12} /> {L('શ્રેષ્ઠ ભેજ (50-70%)', 'उत्तम नमी (50-70%)', 'Optimal (50-70%)')}</span>
                )}
              </span>
            </div>

            {/* 2. Temperature */}
            <div id="gauge-temperature" className={`gauge-box ${sensorData.temperature > 35 ? 'status-red' : sensorData.temperature >= 20 ? 'status-green' : 'status-amber'}`}>
              <div className="gauge-icon-circle icon-temp"><Thermometer size={19} /></div>
              <span className="gauge-label">{L('તાપમાન', 'तापमान', 'Temperature')}</span>
              <div className="gauge-value-row">
                <strong className="gauge-big-num">{sensorData.temperature.toFixed(1)}°C</strong>
              </div>
              <div className="gauge-sub-info">
                <div className="dual-location-stat">
                  <span className="loc-plant"><RiPlantLine size={13} /> {L('છોડ પાસે', 'पौधे पर', 'At plant')}: {sensorData.temperature.toFixed(1)}°C</span>
                  <span className="loc-outside"><RiSunLine size={13} /> {L('બહારનું', 'बाहर', 'Outside')}: {Math.round(weather?.main?.temp || 36)}°C</span>
                </div>
              </div>
            </div>

            {/* 3. Humidity */}
            <div id="gauge-humidity" className="gauge-box status-green">
              <div className="gauge-icon-circle icon-humidity"><Wind size={19} /></div>
              <span className="gauge-label">{L('હવામાં ભેજ', 'हवा की नमी', 'Humidity')}</span>
              <div className="gauge-value-row">
                <strong className="gauge-big-num">{sensorData.humidity.toFixed(1)}%</strong>
              </div>
              <div className="gauge-sub-info">
                <div className="dual-location-stat">
                  <span className="loc-plant"><RiPlantLine size={13} /> {L('છોડ પાસે', 'पौधे पर', 'At plant')}: {sensorData.humidity.toFixed(1)}%</span>
                  <span className="loc-outside"><RiSunLine size={13} /> {L('બહારનું', 'बाहर', 'Outside')}: {Math.round(weather?.main?.humidity || 23)}%</span>
                </div>
              </div>
            </div>

            {/* 4. Sunlight */}
            <div id="gauge-sunlight" className="gauge-box status-green">
              <div className="gauge-icon-circle icon-sun"><Sun size={19} /></div>
              <span className="gauge-label">{L('સૂર્યપ્રકાશ', 'सूर्य का प्रकाश', 'Sunlight')}</span>
              <div className="gauge-value-row">
                <strong className="gauge-big-num">{sensorData.light} lux</strong>
              </div>
              <div className="gauge-sub-info">
                <span className="light-status-tag">
                  {lightDisplay.icon} {lightDisplay.tag}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 5: AI Suggestion Card */}
          <section className="ai-suggestion-card">
            <div className="ai-card-heading">
              <div className="ai-header-left">
                <Sparkles className="sparkle-icon" size={18} />
                <h3>{L('AI સલાહ અને પાકની સ્થિતિ', 'AI सलाह और फसल की स्थिति', 'AI Suggestion & Crop Health')}</h3>
              </div>
              <span className="health-score-badge">
                {L('પાક સ્વાસ્થ્ય', 'पौधे का स्वास्थ्य', 'Plant Health')}: <strong>{decision.plantHealthScore}/100</strong>
              </span>
            </div>

            <p className="ai-explanation-paragraph">
              "{decision.explanationText}"
            </p>

            <div className="agronomy-tips-list">
              {decision.tips && decision.tips.map((tip, idx) => (
                <div key={idx} className="agronomy-tip-item">
                  <div className="tip-icon-bullet">
                    {idx === 0 ? <RiShieldCheckLine size={17} /> : <RiLeafLine size={17} />}
                  </div>
                  <div>{tip}</div>
                </div>
              ))}
            </div>
          </section>

          {/* MOVED TO LEFT COLUMN: ESP32 Hardware & Node Details Accordion */}
          <section className="device-info-card">
            <div
              className="device-info-accordion-header"
              onClick={() => setShowDeviceInfo(!showDeviceInfo)}
            >
              <div className="device-title-left">
                {isOnline ? <Wifi size={17} style={{ color: '#15803d' }} /> : <WifiOff size={17} style={{ color: '#b91c1c' }} />}
                <h4>{L('ESP32 હાર્ડવેર અને નોડ વિગતો', 'ESP32 हार्डवेयर और नोड विवरण', 'ESP32 Node & Hardware Details')}</h4>
                <span className="pulse-chip-iot">{isOnline ? L('ઑનલાઇન', 'ऑनलाइन', 'Online') : L('ઑફલાઇન', 'ऑफलाइन', 'Offline')}</span>
              </div>
              <button
                type="button"
                className="btn-toggle-info"
                aria-label="Toggle details"
              >
                {showDeviceInfo ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {showDeviceInfo && (
              <div className="device-details-body">
                <div className="info-row">
                  <span>{L('ડિવાઇસ મોડેલ', 'डिवाइस मॉडल', 'Device Model')}:</span>
                  <strong>ESP32-TOMATO-01</strong>
                </div>
                <div className="info-row">
                  <span>{L('કનેક્શન', 'कनेक्शन', 'Connection')}:</span>
                  <strong style={{ color: isOnline ? '#15803d' : '#b91c1c' }}>
                    {isOnline ? L('ઑનલાઇન (Wi-Fi 88% • -64 dBm)', 'ऑनलाइन (Wi-Fi 88% • -64 dBm)', 'Online (Wi-Fi 88% • -64 dBm)') : L('ઑફલાઇન', 'ऑफलाइन', 'Offline')}
                  </strong>
                </div>
                <div className="info-row">
                  <span>{L('પ્રોટોકોલ', 'प्रोटोकॉल', 'Protocol')}:</span>
                  <strong>MQTT TLS 8883 (Secure Encrypted)</strong>
                </div>
                <div className="info-row">
                  <span>{L('સેન્સર હાર્ડવેર', 'સંવેદક હાર્ડવેર', 'Sensor Hardware')}:</span>
                  <strong>Capacitive Soil v1.2 & DHT22</strong>
                </div>
                <div className="info-row">
                  <span>{L('પંપ / વાલ્વ', 'पंप / वाल्व', 'Valve Actuator')}:</span>
                  <strong>12V Solenoid Submersible Pump</strong>
                </div>
                <div className="info-row">
                  <span>{L('છેલ્લું સિંક', 'अंतिम सिंक', 'Last Telemetry Sync')}:</span>
                  <strong>{new Date(sensorData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
                </div>
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Weather 3-Day, Drip Controller, 7-Day Plan, Sensor Trends */}
        <div className="watering-hub-col-right">

          {/* SECTION 4: Weather & 3-Day Forecast Strip */}
          <section className="weather-forecast-strip-card">
            <div className="weather-strip-header">
              <div className="weather-strip-title">
                <RiSunCloudyLine size={20} className="weather-title-icon" />
                <h4>{L('હવામાન અને 3 દિવસની આગાહી', 'मौसम और 3 दिन का पूर्वानुमान', 'Outside Weather & 3-Day Forecast')}</h4>
              </div>

              <div className="weather-metric-chips">
                <span className="weather-chip">
                  <Wind size={14} /> {((weather?.wind?.speed || 0.93) * 3.6).toFixed(1)} {L('કિમી/કલાક', 'किमी/घंटा', 'km/h')}
                </span>
                <span className="weather-chip rain-chip">
                  <CloudRain size={14} /> {forecast?.list?.[0]?.pop ? Math.round(forecast.list[0].pop * 100) : 10}% {L('વરસાદ', 'बारिश', 'Rain')}
                </span>
              </div>
            </div>

            <div className="three-day-forecast-row">
              {(scheduleList.slice(0, 3)).map((item, idx) => {
                const dayTemp = idx === 0 ? Math.round(weather?.main?.temp || 36) : idx === 1 ? 35 : 32;
                return (
                  <div key={item.date || idx} className="forecast-mini-card">
                    <span className="forecast-day-name">{item.dayLabel}</span>
                    <span className="forecast-weather-icon-wrap">
                      {idx === 2 ? <RiRainyLine size={20} style={{ color: '#0284c7' }} /> : dayTemp > 34 ? <RiSunLine size={20} style={{ color: '#f59e0b' }} /> : <RiSunCloudyLine size={20} style={{ color: '#0284c7' }} />}
                    </span>
                    <strong className="forecast-temp-val">{dayTemp}°C</strong>
                    <span className="forecast-rain-prob">
                      {idx === 2 ? L('40% વરસાદ', '40% बारिश', '40% rain') : L('10% વરસાદ', '10% बारिश', '10% rain')}
                    </span>
                  </div>
                );
              })}
            </div>

            {Math.round(weather?.main?.temp || 36) > 34 && (
              <div className="weather-heat-alert-bar">
                <RiAlertLine size={16} />
                <span>{decision.weatherAlert}</span>
              </div>
            )}
          </section>

          {/* SECTION 6: Water Controls, Safety Limits, Tank Level & Auto-Drip */}
          <section className="water-actuator-control-card">
            <div className="actuator-top-row">
              <div className="actuator-title-box">
                <RiDropLine size={19} className="drop-icon" />
                <h3>{L('ડ્રિપ ઇરિગેશન કંટ્રોલર', 'ड्रिप सिंचाई नियंत्रक', 'Drip Irrigation Controller')}</h3>
              </div>

              <div className={`tank-level-chip ${waterTankLevel < 20 ? 'tank-low' : 'tank-good'}`}>
                <Droplets size={13} />
                <span>{L('પાણીની ટાંકી', 'पानी की टंकी', 'Water Tank')}: <strong>{waterTankLevel}% {L('ભરેલી', 'भरी हुई', 'Full')}</strong></span>
              </div>
            </div>

            <div className="daily-usage-tracker-bar">
              <div className="usage-text-row">
                <span>{L('આજનો કુલ વપરાશ', 'आज का कुल उपयोग', "Today's Total")}: <strong>{todayDispensedTotal} / {DAILY_MAX_SAFE_VOLUME_ML} ml</strong></span>
                <span>{L('છેલ્લી સિંચાઈ', 'अंतिम सिंचाई', 'Last Watered')}: {lastWateredDateDisplay} {lastWateredLog.time} ({lastWateredLog.amount} ml)</span>
              </div>
              <div className="usage-progress-track">
                <div
                  className="usage-progress-fill"
                  style={{ width: `${Math.min(100, (todayDispensedTotal / DAILY_MAX_SAFE_VOLUME_ML) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="touch-dose-grid">
              {[
                { ml: 100, label: L('હળવું પાણી (100 ml)', 'हल्की सिंचाई (100 ml)', 'Quick Sip (100ml)') },
                { ml: 250, label: L('સામાન્ય ડ્રિપ (250 ml)', 'मानक ड्रिप (250 ml)', 'Standard Drip (250ml)') },
                { ml: 500, label: L('ઊંડી સિંચાઈ (500 ml)', 'गहरी सिंचाई (500 ml)', 'Deep Soak (500ml)') }
              ].map((d) => (
                <button
                  key={d.ml}
                  type="button"
                  className={`dose-pill-btn ${selectedDose === d.ml ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedDose(d.ml);
                    setCustomDose('');
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="custom-dose-wrap">
              <input
                type="number"
                min="20"
                max={DAILY_MAX_SAFE_VOLUME_ML}
                placeholder={L('અન્ય માત્રા ml (દા.ત. 350)', 'अन्य मात्रा ml (उदा. 350)', 'Custom ml (e.g. 350)')}
                value={customDose}
                onChange={(e) => {
                  setCustomDose(e.target.value);
                  setSelectedDose(Number(e.target.value));
                }}
                className="custom-dose-input"
              />
            </div>

            <button
              type="button"
              disabled={isPumping}
              className="btn-main-dispense"
              onClick={() => handleDispenseClick(customDose ? Number(customDose) : selectedDose)}
            >
              <RiDropFill size={19} />
              <span>
                {isPumping
                  ? `${L('પાણી અપાઈ રહ્યું છે...', 'पानी दिया जा रहा है...', 'Dispensing...')} ${Math.round(pumpProgress)}%`
                  : `${L('હમણાં પાણી આપો', 'अभी पानी दें', 'Dispense Water Now')} (${customDose || selectedDose} ml)`}
              </span>
            </button>

            <div className="manual-actions-row">
              <button
                type="button"
                className="btn-manual-action"
                onClick={handleWateredByHand}
              >
                <CheckCircle2 size={15} />
                <span>{L('હાથેથી પાણી આપ્યું', 'हाथ से पानी दिया', 'I watered by hand')} (250ml)</span>
              </button>

              <button
                type="button"
                className="btn-manual-action btn-skip"
                onClick={handleSkipToday}
              >
                <X size={15} />
                <span>{L('આજે પાણી ન આપો', 'आज पानी छोड़ें', 'Skip Today')}</span>
              </button>
            </div>

            {/* Auto-Drip Schedule Toggle */}
            <div className="auto-drip-toggle-row">
              <div className="toggle-label-wrap">
                <span className="toggle-title">{L('AI ઓટો-ડ્રિપ મોડ', 'AI ऑटो-ड्रिप मोड', 'AI Auto-Drip Automation')}</span>
                <span className="toggle-desc">
                  {L('જમીનમાં ભેજ 50% થી ઘટતાં આપમેળે સાંજે પાણી આપશે', 'नमी 50% से कम होने पर शाम को स्वचालित सिंचाई', 'Triggers smart valve when root moisture drops below threshold')}
                </span>
              </div>
              <label className="ios-switch">
                <input
                  type="checkbox"
                  checked={autoDripEnabled}
                  onChange={(e) => setAutoDripEnabled(e.target.checked)}
                />
                <span className="ios-slider"></span>
              </label>
            </div>
          </section>

          {/* SECTION 7: Synchronized 7-Day Plan */}
          <section className="schedule-plan-card">
            <div className="schedule-card-header">
              <div className="schedule-card-title">
                <Clock className="cal-icon" size={18} />
                <h3>{L('7-દિવસીય સ્માર્ટ સિંચાઈ પ્લાન', '7-दिवसीय स्मार्ट सिंचाई योजना', '7-Day AI Irrigation Schedule')}</h3>
              </div>
            </div>

            {/* Interactive Day Tabs */}
            <div className="schedule-day-tabs-row">
              {scheduleList.map((item, index) => {
                const isSelected = selectedDayIndex === index;
                const isWaterDay = parseInt(item.amount, 10) > 0;
                return (
                  <button
                    key={item.date || index}
                    type="button"
                    className={`day-tab-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedDayIndex(index)}
                  >
                    <span className="tab-day-label">{item.dayLabel}</span>
                    <span className={`tab-amount-tag ${isWaterDay ? 'tab-water-needed' : 'tab-rest-day'}`}>
                      {item.amount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Detail Card */}
            {selectedDay && (
              <div className="selected-day-detail-panel">
                <div className="detail-header-row">
                  <div className="detail-date-title">
                    <strong>{selectedDay.dayLabel} ({selectedDay.date})</strong>
                    {selectedDay.isLiveForecast && (
                      <span className="forecast-verified-badge">
                        <CheckCircle2 size={13} /> {L('હવામાન આધારિત', 'मौसम आधारित', 'Forecast verified')}
                      </span>
                    )}
                  </div>
                  <span className={`detail-amount-chip ${parseInt(selectedDay.amount, 10) > 0 ? 'chip-water' : 'chip-rest'}`}>
                    {selectedDay.amount}
                  </span>
                </div>

                <div className="detail-grid">
                  <div className="detail-metric-col">
                    <span className="metric-tiny-label">{L('સમય', 'समय', 'Time of Day')}</span>
                    <strong className="metric-value-text">{formatLocalizedTime(selectedDay.timeOfDay)}</strong>
                  </div>
                  <div className="detail-metric-col">
                    <span className="metric-tiny-label">{L('ક્રિયા', 'क्रिया', 'Action')}</span>
                    <strong className="metric-value-text">
                      {parseInt(selectedDay.amount, 10) > 0 ? L('મૂળમાં ડ્રિપ', 'जड़ों में ड्रिप', 'Root-zone drip') : L('આરામ અને શ્વસન', 'आराम व श्वसन', 'Rest & Aeration')}
                    </strong>
                  </div>
                </div>

                <div className="detail-reason-box">
                  <span className="reason-bullet-icon">💡</span>
                  <p className="reason-text">{selectedDay.reason}</p>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 8: Dynamic Sensor History & Trends */}
          <section className="sensor-trends-card">
            <div className="trends-card-header">
              <div className="trends-title-wrap">
                <Activity size={18} />
                <h3>{L('સેન્સર ટ્રેન્ડ્સ અને ઇતિહાસ', 'सेंसर रुझान और इतिहास', 'Sensor Trends & History')}</h3>
              </div>

              <div className="trends-range-toggle">
                <button
                  type="button"
                  className={`btn-range-pill ${historyTimeRange === '24h' ? 'active' : ''}`}
                  onClick={() => setHistoryTimeRange('24h')}
                >
                  24h
                </button>
                <button
                  type="button"
                  className={`btn-range-pill ${historyTimeRange === '7d' ? 'active' : ''}`}
                  onClick={() => setHistoryTimeRange('7d')}
                >
                  7d
                </button>
              </div>
            </div>

            {historyLoading ? (
              <div className="history-loading-wrap">
                <RefreshCw size={18} className="spinning" />
                <span>{L('ઇતિહાસ લોડ થઈ રહ્યો છે...', 'इतिहास लोड हो रहा है...', 'Loading trend history...')}</span>
              </div>
            ) : (
              renderMiniSparkline()
            )}
          </section>

        </div>
      </div>

      {/* Confirmation Safety Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="confirm-modal-box">
            <h3>{L('સિંચાઈની પુષ્ટિ કરો', 'सिंचाई की पुष्टि करें', 'Confirm Watering')}</h3>
            <p className="confirm-modal-prompt">
              {L(
                `શું તમે ટામેટાના છોડ માટે ${pendingDose} મિ.લિ. પાણી આપવા માંગો છો?`,
                `क्या आप टमाटर के पौधे को ${pendingDose} मि.ली. पानी देना चाहते हैं?`,
                `Are you sure you want to dispense ${pendingDose} ml water to the Tomato root zone?`
              )}
            </p>
            <div className="confirm-btn-row">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                <X size={18} /> {L('રદ કરો', 'रद्द करें', 'Cancel')}
              </button>
              <button
                type="button"
                className="btn-modal-proceed"
                onClick={confirmAndDispense}
              >
                <Check size={18} /> {L('હા, પાણી આપો', 'हाँ, पानी दें', 'Yes, Dispense')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TomatoIoTHub;
