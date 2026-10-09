import api from './api';

export const WOKWI_SENSOR_URL = 'https://wokwi.com/projects/477224732988505089';

let lastOfflineLogTime = 0;
export const notifySensorOfflineInConsole = (customMessage) => {
  const now = Date.now();
  // Log once every 10 seconds to avoid console spamming on rapid polling
  if (now - lastOfflineLogTime > 10000) {
    lastOfflineLogTime = now;
    const msg = customMessage || `please on sensor on this link: ${WOKWI_SENSOR_URL}`;
    console.warn(
      `%c[IoT Sensor Offline]%c ${msg}`,
      'background: #e63946; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #e63946; font-weight: bold; margin-left: 6px;'
    );
    console.log(`please on sensor on this link: ${WOKWI_SENSOR_URL}`);
  }
};

export const iotService = {
  // Get devices accessible to user/admin
  getDevices: async () => {
    try {
      const res = await api.get('/iot/devices');
      return res.data;
    } catch (err) {
      notifySensorOfflineInConsole();
      throw err;
    }
  },

  // Get device details
  getDeviceById: async (deviceId) => {
    const res = await api.get(`/iot/devices/${deviceId}`);
    return res.data;
  },

  // Get latest plant sensor readings
  getLatestPlantSensors: async (plantId) => {
    try {
      const res = await api.get(`/iot/plants/${plantId}/latest`);
      if (res.data && (res.data.isOnline === false || !res.data.reading)) {
        notifySensorOfflineInConsole();
      }
      return res.data;
    } catch (err) {
      notifySensorOfflineInConsole();
      throw err;
    }
  },

  // Get sensor history (1h, 24h, 7d)
  getPlantSensorHistory: async (plantId, range = '24h') => {
    const res = await api.get(`/iot/plants/${plantId}/history?range=${range}`);
    return res.data;
  },

  // Get status summary for a plant
  getPlantIoTStatus: async (plantId) => {
    try {
      const res = await api.get(`/iot/plants/${plantId}/status`);
      if (res.data && (res.data.isOnline === false || !res.data.reading)) {
        notifySensorOfflineInConsole();
      }
      return res.data;
    } catch (err) {
      notifySensorOfflineInConsole();
      throw err;
    }
  },

  // Register or link device
  registerDevice: async (deviceData) => {
    const res = await api.post('/iot/devices', deviceData);
    return res.data;
  },

  // Admin scenario simulator trigger
  simulateScenario: async (scenario, deviceId = 'ESP32-TOMATO-01', plantId = 'tomato-01') => {
    const res = await api.post('/iot/simulate', { scenario, deviceId, plantId });
    return res.data;
  },

  // Trigger smart water pump actuator
  triggerPump: async (plantId = 'tomato-01', amountMl = 250, durationSec = 3) => {
    const res = await api.post(`/iot/plants/${plantId}/pump`, { amountMl, durationSec });
    return res.data;
  },

  // Get dynamic AI watering advice and 7-day schedule
  getAiAdvice: async (payload) => {
    const res = await api.post('/watering/ai-advice', payload);
    return res.data;
  },

  // Unlink/delete device
  deleteDevice: async (deviceId) => {
    const res = await api.delete(`/iot/devices/${deviceId}`);
    return res.data;
  },
};

export default iotService;
