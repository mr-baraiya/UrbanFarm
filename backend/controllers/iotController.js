const IoTDevice = require('../models/IoTDevice');
const SensorReading = require('../models/SensorReading');
const Plant = require('../models/Plant');
const iotService = require('../services/iotService');
const mqttService = require('../services/mqttService');

// Helper to check valid Mongo ObjectId
const isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

// @desc    Get IoT devices (User gets their devices, Admin gets all)
// @route   GET /api/iot/devices
exports.getDevices = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      const userPlants = await Plant.find({ userId: req.user.id }).select('_id');
      const plantIds = userPlants.map(p => p._id);
      query = {
        $or: [
          { userId: req.user.id },
          { plantId: { $in: plantIds } },
          { deviceId: 'ESP32-TOMATO-01' }
        ]
      };
    }

    const devices = await IoTDevice.find(query)
      .populate('plantId', 'name variety imageUrl')
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: devices.length, devices });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single device by deviceId
// @route   GET /api/iot/devices/:deviceId
exports.getDeviceById = async (req, res, next) => {
  try {
    const device = await IoTDevice.findOne({ deviceId: req.params.deviceId })
      .populate('plantId', 'name variety imageUrl')
      .populate('userId', 'name email');

    if (!device) {
      return res.status(404).json({ success: false, message: 'IoT Device not found' });
    }

    // Auth check for non-admin
    if (req.user.role !== 'admin' && String(device.userId) !== String(req.user.id)) {
      if (device.plantId && String(device.plantId.userId) !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this device' });
      }
    }

    res.status(200).json({ success: true, device });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest sensor data for a plant
// @route   GET /api/iot/plants/:plantId/latest
exports.getLatestPlantSensors = async (req, res, next) => {
  try {
    const { plantId } = req.params;

    if (req.user.role !== 'admin' && isValidObjectId(plantId)) {
      const plant = await Plant.findById(plantId);
      if (plant && String(plant.userId) !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Not authorized to access sensor data for this plant' });
      }
    }

    const result = await iotService.getLatestReading(plantId);
    const device = await IoTDevice.findOne({
      $or: [{ plantId: isValidObjectId(plantId) ? plantId : null }, { plantCustomId: 'tomato-01' }, { deviceId: 'ESP32-TOMATO-01' }]
    });

    res.status(200).json({
      success: true,
      reading: result.reading,
      isOnline: result.isOnline,
      lastSeen: result.lastSeen,
      device: device || null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sensor history for a plant (1h, 24h, 7d)
// @route   GET /api/iot/plants/:plantId/history
exports.getPlantSensorHistory = async (req, res, next) => {
  try {
    const { plantId } = req.params;
    const { range = '24h' } = req.query;

    if (req.user.role !== 'admin' && isValidObjectId(plantId)) {
      const plant = await Plant.findById(plantId);
      if (plant && String(plant.userId) !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Not authorized to access sensor history for this plant' });
      }
    }

    const readings = await iotService.getSensorHistory(plantId, range);
    res.status(200).json({ success: true, count: readings.length, range, readings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get IoT status summary for a plant
// @route   GET /api/iot/plants/:plantId/status
exports.getPlantIoTStatus = async (req, res, next) => {
  try {
    const { plantId } = req.params;
    const { reading, isOnline, lastSeen } = await iotService.getLatestReading(plantId);

    let healthStatus = 'Healthy';
    let alertLevel = 'green';
    let alerts = [];

    if (!reading || !isOnline) {
      healthStatus = 'Offline';
      alertLevel = 'yellow';
      alerts.push('Device is offline or not sending sensor updates.');
    } else {
      if (reading.soilMoisture < 20) {
        healthStatus = 'Critical';
        alertLevel = 'red';
        alerts.push('Soil moisture is critically low (<20%). Immediate watering needed.');
      } else if (reading.soilMoisture < 35) {
        healthStatus = 'Warning';
        alertLevel = 'yellow';
        alerts.push('Soil moisture is getting low (<35%).');
      }

      if (reading.temperature > 38) {
        healthStatus = 'Warning';
        alertLevel = 'yellow';
        alerts.push('High temperature detected (>38°C). Ensure shade.');
      }
    }

    res.status(200).json({
      success: true,
      plantId,
      isOnline,
      lastSeen,
      healthStatus,
      alertLevel,
      alerts,
      currentSensors: reading
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register or link an IoT device to a user/plant
// @route   POST /api/iot/devices
exports.registerDevice = async (req, res, next) => {
  try {
    const { deviceId, deviceName, plantId, plantCustomId } = req.body;

    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Please provide a deviceId' });
    }

    let plantObj = null;
    if (plantId && isValidObjectId(plantId)) {
      plantObj = await Plant.findOne({ _id: plantId, userId: req.user.id });
      if (!plantObj && req.user.role !== 'admin') {
        return res.status(404).json({ success: false, message: 'Plant not found or not owned by user' });
      }
    }

    let device = await IoTDevice.findOne({ deviceId });
    if (device) {
      device.deviceName = deviceName || device.deviceName;
      device.userId = req.user.id;
      if (plantObj) device.plantId = plantObj._id;
      if (plantCustomId) device.plantCustomId = plantCustomId;
      await device.save();
    } else {
      device = await IoTDevice.create({
        deviceId,
        deviceName: deviceName || `ESP32-${deviceId}`,
        userId: req.user.id,
        plantId: plantObj ? plantObj._id : null,
        plantCustomId: plantCustomId || 'tomato-01',
        status: 'online',
        lastSeen: new Date(),
      });
    }

    res.status(201).json({ success: true, message: 'Device registered successfully', device });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin IoT scenario simulator trigger
// @route   POST /api/iot/simulate
exports.simulateScenario = async (req, res, next) => {
  try {
    const { scenario = 'NORMAL', deviceId = 'ESP32-TOMATO-01', plantId = 'tomato-01' } = req.body;

    const newReading = await iotService.generateSimulation(scenario, deviceId, plantId);

    const topic = `urbanfarm/${plantId}/sensors`;
    mqttService.publishMessage(topic, newReading);

    res.status(200).json({
      success: true,
      message: `Scenario '${scenario}' simulated successfully for ${deviceId}`,
      reading: newReading
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Unlink IoT Device
// @route   DELETE /api/iot/devices/:deviceId
exports.deleteDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const query = req.user.role === 'admin' ? { deviceId } : { deviceId, userId: req.user.id };

    const device = await IoTDevice.findOneAndDelete(query);
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found or not authorized' });
    }

    res.status(200).json({ success: true, message: 'IoT device unlinked successfully' });
  } catch (error) {
    next(error);
  }
};
