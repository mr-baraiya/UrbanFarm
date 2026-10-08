import api from './api';

export const iotService = {
  // Get devices accessible to user/admin
  getDevices: async () => {
    const res = await api.get('/iot/devices');
    return res.data;
  },

  // Get device details
  getDeviceById: async (deviceId) => {
    const res = await api.get(`/iot/devices/${deviceId}`);
    return res.data;
  },

  // Get latest plant sensor readings
  getLatestPlantSensors: async (plantId) => {
    const res = await api.get(`/iot/plants/${plantId}/latest`);
    return res.data;
  },

  // Get sensor history (1h, 24h, 7d)
  getPlantSensorHistory: async (plantId, range = '24h') => {
    const res = await api.get(`/iot/plants/${plantId}/history?range=${range}`);
    return res.data;
  },

  // Get status summary for a plant
  getPlantIoTStatus: async (plantId) => {
    const res = await api.get(`/iot/plants/${plantId}/status`);
    return res.data;
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

  // Unlink/delete device
  deleteDevice: async (deviceId) => {
    const res = await api.delete(`/iot/devices/${deviceId}`);
    return res.data;
  },
};

export default iotService;
