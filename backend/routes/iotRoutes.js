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
} = require('../controllers/iotController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect); // All IoT routes require authentication

router.route('/devices')
  .get(getDevices)
  .post(registerDevice);

router.route('/devices/:deviceId')
  .get(getDeviceById)
  .delete(deleteDevice);

router.get('/plants/:plantId/latest', getLatestPlantSensors);
router.get('/plants/:plantId/history', getPlantSensorHistory);
router.get('/plants/:plantId/status', getPlantIoTStatus);

// Admin-only simulator endpoint
router.post('/simulate', admin, simulateScenario);

module.exports = router;
