import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Cpu, Wifi, WifiOff, Sun, CloudRain, Flame, Activity, RefreshCw, CheckCircle2 } from 'lucide-react';
import iotService from '../../services/iotService';
import { getPlants } from '../../services/plantService';
import { toast } from 'react-toastify';
import './AdminIoTSimulator.css';

const AdminIoTSimulator = () => {
  const { t } = useTranslation();
  const [devices, setDevices] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('ESP32-TOMATO-01');
  const [selectedPlant, setSelectedPlant] = useState('tomato-01');
  const [activeScenario, setActiveScenario] = useState('NORMAL');
  const [latestReading, setLatestReading] = useState(null);

  const loadIoTData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const [devRes, sensorRes, plantList] = await Promise.all([
        iotService.getDevices().catch(() => ({ devices: [] })),
        iotService.getLatestPlantSensors(selectedPlant).catch(() => ({ reading: null })),
        getPlants().catch(() => [])
      ]);

      const devList = devRes?.devices || [];
      setDevices(devList);
      setPlants(plantList || []);
      setLatestReading(sensorRes?.reading || null);

      const targetDev = devList.find(d => d.deviceId === selectedDevice) || sensorRes?.device;
      if (targetDev && targetDev.activeScenario) {
        setActiveScenario(targetDev.activeScenario);
      }
    } catch (err) {
      console.warn('Error loading admin IoT management:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleDeviceChange = (devId) => {
    setSelectedDevice(devId);
    const targetDev = devices.find(d => d.deviceId === devId);
    if (targetDev) {
      if (targetDev.plantCustomId) {
        setSelectedPlant(targetDev.plantCustomId);
      } else if (targetDev.plantId?._id) {
        setSelectedPlant(targetDev.plantId._id);
      } else if (typeof targetDev.plantId === 'string') {
        setSelectedPlant(targetDev.plantId);
      }
      if (targetDev.activeScenario) {
        setActiveScenario(targetDev.activeScenario);
      }
    }
  };

  useEffect(() => {
    loadIoTData(true);
    const interval = setInterval(() => loadIoTData(false), 5000);

    const handleCustomUpdate = (e) => {
      if (e.detail?.reading) {
        setLatestReading(e.detail.reading);
      }
      if (e.detail?.scenario) {
        setActiveScenario(e.detail.scenario);
      }
    };
    window.addEventListener('iot-data-updated', handleCustomUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('iot-data-updated', handleCustomUpdate);
    };
  }, [selectedPlant, selectedDevice]);

  const handleSimulate = async (scenarioName) => {
    try {
      setSimulating(true);
      setActiveScenario(scenarioName);
      const res = await iotService.simulateScenario(scenarioName, selectedDevice, selectedPlant);
      if (res && res.success) {
        setLatestReading(res.reading);
        toast.success(`IoT Scenario '${scenarioName}' published to MQTT & MongoDB!`);
        window.dispatchEvent(new CustomEvent('iot-data-updated', { detail: { reading: res.reading, scenario: scenarioName } }));
      }
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Failed to trigger simulation scenario.');
    } finally {
      setSimulating(false);
    }
  };

  const totalDevices = Math.max(1, devices.length);
  const onlineCount = devices.filter((d) => d.status === 'online').length || (latestReading ? 1 : 0);
  const offlineCount = Math.max(0, totalDevices - onlineCount);

  const scenarios = [
    { id: 'NORMAL', label: t('iot.normal'), icon: Activity, themeClass: 'normal', desc: t('iot.descNormal') },
    { id: 'DRY_SOIL', label: t('iot.drySoil'), icon: Sun, themeClass: 'dry', desc: t('iot.descDrySoil') },
    { id: 'RAIN', label: t('iot.rain'), icon: CloudRain, themeClass: 'rain', desc: t('iot.descRain') },
    { id: 'HEAT_WAVE', label: t('iot.heatWave'), icon: Flame, themeClass: 'heat', desc: t('iot.descHeatWave') },
  ];

  return (
    <div className="admin-iot-container">
      {/* Metrics Row */}
      <div className="admin-iot-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-icon emerald">
            <Cpu size={22} />
          </div>
          <div>
            <span className="admin-metric-label">{t('iot.totalDevices')}</span>
            <span className="admin-metric-val">{totalDevices}</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon emerald">
            <Wifi size={22} />
          </div>
          <div>
            <span className="admin-metric-label">{t('iot.onlineDevices')}</span>
            <span className="admin-metric-val text-emerald">{onlineCount}</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon rose">
            <WifiOff size={22} />
          </div>
          <div>
            <span className="admin-metric-label">{t('iot.offlineDevices')}</span>
            <span className="admin-metric-val">{offlineCount}</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon sky">
            <Activity size={22} />
          </div>
          <div>
            <span className="admin-metric-label">{t('iot.deviceStatus')}</span>
            <span className="admin-status-text">{t('iot.allSystemsNormal')}</span>
          </div>
        </div>
      </div>

      {/* Admin Simulator Control Section */}
      <div className="admin-simulator-card">
        <div className="admin-simulator-header">
          <div>
            <h3 className="admin-simulator-title">
              <Cpu className="text-emerald" size={20} />
              {t('iot.simulator')} (Wokwi Virtual ESP32 Control)
            </h3>
            <p className="admin-simulator-desc">
              {t('iot.simulatorSubtitle')}
            </p>
          </div>

          <button
            onClick={loadIoTData}
            className="admin-refresh-btn"
          >
            <RefreshCw size={16} className={loading ? 'admin-spin' : ''} />
          </button>
        </div>

        {/* Target Device & Plant selector */}
        <div className="admin-selector-grid">
          <div>
            <label className="admin-field-label">{t('iot.targetVirtualDevice')}</label>
            <select
              value={selectedDevice}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="admin-field-select"
            >
              {devices.length > 0 ? (
                devices.map((d) => {
                  const devLabel = d.deviceName || d.deviceType || 'Virtual Node';
                  const statusLabel = d.status ? ` • ${d.status.toUpperCase()}` : '';
                  return (
                    <option key={d._id || d.deviceId} value={d.deviceId}>
                      {d.deviceId} ({devLabel}{statusLabel})
                    </option>
                  );
                })
              ) : (
                <option value="ESP32-TOMATO-01">ESP32-TOMATO-01 (Wokwi Virtual Node)</option>
              )}
            </select>
          </div>

          <div>
            <label className="admin-field-label">{t('iot.targetPlantId')}</label>
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="admin-field-select"
            >
              <option value="tomato-01">tomato-01 (Tomato Plant)</option>
              {plants
                .filter((p) => p._id !== 'tomato-01')
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} {p.variety ? `(${p.variety})` : ''}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Preset Scenario Buttons */}
        <div>
          <label className="admin-field-label mb-2">{t('iot.simulateScenario')}</label>
          <div className="admin-scenarios-grid">
            {scenarios.map((sc) => {
              const Icon = sc.icon;
              const isActive = activeScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  disabled={simulating}
                  onClick={() => handleSimulate(sc.id)}
                  className={`admin-scenario-btn ${sc.themeClass} ${isActive ? 'active' : ''}`}
                >
                  <div className="admin-scenario-top">
                    <span className="admin-scenario-name">{sc.label}</span>
                    <Icon size={18} />
                  </div>
                  <p className="admin-scenario-desc">{sc.desc}</p>
                  <div className="admin-scenario-footer">
                    [ {t('iot.simulateButton')} ] {isActive && <CheckCircle2 size={12} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Simulation Feedback */}
        {latestReading && (
          <div className="admin-live-telemetry-box">
            <span className="admin-telemetry-title">
              <CheckCircle2 size={14} /> {t('iot.liveTelemetryOutput')}
            </span>
            <div className="admin-telemetry-grid">
              <div>
                <span className="admin-telemetry-label">{t('iot.soilMoisture')}</span>
                <span className="admin-telemetry-val text-emerald">{latestReading.soilMoisture}%</span>
              </div>
              <div>
                <span className="admin-telemetry-label">{t('iot.temperature')}</span>
                <span className="admin-telemetry-val text-amber">{latestReading.temperature}°C</span>
              </div>
              <div>
                <span className="admin-telemetry-label">{t('iot.humidity')}</span>
                <span className="admin-telemetry-val text-sky">{latestReading.humidity}%</span>
              </div>
              <div>
                <span className="admin-telemetry-label">{t('iot.light')}</span>
                <span className="admin-telemetry-val text-yellow">{latestReading.light} lux</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminIoTSimulator;
