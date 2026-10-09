const express = require('express');
const router = express.Router();
const {
  getDevices,
  getDeviceById,
  getLatestPlantSensors,
  getPlantSensorHistory,
  getPlantIoTStatus,
  registerDevice,
  simulateScenario,
  deleteDevice,
  triggerPump,
  ingestSensorReading,
} = require('../controllers/iotController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public Telemetry Ingestion from Wokwi ESP32 / Hardware & Live read
router.post('/reading', ingestSensorReading);
router.post('/sensors', ingestSensorReading);
router.post('/ingest', ingestSensorReading);
router.get('/plants/:plantId/latest-public', getLatestPlantSensors);

router.use(protect); // Below routes require authentication

router.route('/devices')
  .get(getDevices)
  .post(registerDevice);

router.route('/devices/:deviceId')
  .get(getDeviceById)
  .delete(deleteDevice);

router.get('/plants/:plantId/latest', getLatestPlantSensors);
router.get('/plants/:plantId/history', getPlantSensorHistory);
router.get('/plants/:plantId/status', getPlantIoTStatus);

// Remote IoT Pump / Valve Actuation
router.post('/plants/:plantId/pump', triggerPump);
router.post('/pump', triggerPump);

// Admin-only simulator endpoint
router.post('/simulate', admin, simulateScenario);

module.exports = router;

