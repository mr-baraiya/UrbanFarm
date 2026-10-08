const SensorReading = require('../models/SensorReading');
const IoTDevice = require('../models/IoTDevice');
const Plant = require('../models/Plant');

const isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

/**
 * Process raw sensor data payload received from MQTT or simulator
 */
async function processSensorReading(payload) {
  try {
    const { deviceId, plantId, temperature, humidity, soilMoisture, light, timestamp } = payload;

    if (!deviceId || !plantId) {
      console.warn('⚠️ Invalid IoT payload: missing deviceId or plantId', payload);
      return null;
    }

    const tempVal = Number(temperature);
    const humVal = Number(humidity);
    const soilVal = Number(soilMoisture);
    const lightVal = Number(light);

    if (isNaN(tempVal) || isNaN(humVal) || isNaN(soilVal) || isNaN(lightVal)) {
      console.warn('⚠️ Invalid numeric values in IoT payload', payload);
      return null;
    }

    const readTimestamp = timestamp ? new Date(timestamp) : new Date();

    // 1. Create Sensor Reading
    const reading = await SensorReading.create({
      deviceId,
      plantId: String(plantId),
      temperature: Math.round(tempVal * 10) / 10,
      humidity: Math.round(humVal * 10) / 10,
      soilMoisture: Math.max(0, Math.min(100, Math.round(soilVal * 10) / 10)),
      light: Math.round(lightVal),
      timestamp: readTimestamp,
    });

    // 2. Upsert IoT Device status & lastSeen
    let device = await IoTDevice.findOne({ deviceId });
    
    let linkedPlant = null;
    if (plantId && isValidObjectId(plantId)) {
      linkedPlant = await Plant.findById(plantId);
    }
    if (!linkedPlant && plantId) {
      linkedPlant = await Plant.findOne({ name: new RegExp(plantId, 'i') });
    }

    let devStatus = 'online';
    if (soilVal < 20 || tempVal > 40) {
      devStatus = 'warning';
    }

    if (!device) {
      device = await IoTDevice.create({
        deviceId,
        deviceName: `ESP32 (${plantId})`,
        plantCustomId: String(plantId),
        plantId: linkedPlant ? linkedPlant._id : null,
        userId: linkedPlant ? linkedPlant.userId : null,
        status: devStatus,
        lastSeen: readTimestamp,
      });
    } else {
      device.lastSeen = readTimestamp;
      device.status = devStatus;
      device.plantCustomId = String(plantId);
      if (linkedPlant && !device.plantId) {
        device.plantId = linkedPlant._id;
        device.userId = linkedPlant.userId;
      }
      await device.save();
    }

    return reading;
  } catch (error) {
    console.error('❌ Error processing sensor reading:', error.message);
    return null;
  }
}

/**
 * Get latest sensor reading for a plant
 */
async function getLatestReading(plantIdKey) {
  try {
    const filterOr = [
      { plantId: String(plantIdKey) },
      { deviceId: String(plantIdKey) },
      { plantId: 'tomato-01' },
      { deviceId: 'ESP32-TOMATO-01' }
    ];

    if (isValidObjectId(plantIdKey)) {
      try {
        const plant = await Plant.findById(plantIdKey);
        if (plant && plant.name) {
          filterOr.push({ plantId: plant.name.toLowerCase() });
        }
      } catch (err) {}
    }

    const latest = await SensorReading.findOne({ $or: filterOr }).sort({ timestamp: -1 });
    
    let isOnline = false;
    let lastSeenTime = null;
    if (latest) {
      const diffMs = Date.now() - new Date(latest.timestamp).getTime();
      isOnline = diffMs < 600000; // 10 mins threshold for virtual node active window
      lastSeenTime = latest.timestamp;
    }

    return {
      reading: latest,
      isOnline,
      lastSeen: lastSeenTime,
    };
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    return { reading: null, isOnline: false, lastSeen: null };
  }
}

/**
 * Get sensor history range ('1h', '24h', '7d')
 */
async function getSensorHistory(plantIdKey, timeRange = '24h') {
  try {
    const now = new Date();
    let startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // default 24h

    if (timeRange === '1h') {
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
    } else if (timeRange === '7d') {
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    let plantFilter = [String(plantIdKey), 'tomato-01', 'ESP32-TOMATO-01'];
    if (isValidObjectId(plantIdKey)) {
      try {
        const plant = await Plant.findById(plantIdKey);
        if (plant && plant.name) {
          plantFilter.push(plant.name.toLowerCase());
        }
      } catch (err) {}
    }

    const query = {
      $or: [
        { plantId: { $in: plantFilter } },
        { deviceId: { $in: plantFilter } }
      ],
      timestamp: { $gte: startTime },
    };

    let readings = await SensorReading.find(query).sort({ timestamp: 1 });

    // Fallback: if no readings exist in the exact window, fetch the 30 most recent readings
    if (!readings || readings.length === 0) {
      readings = await SensorReading.find({
        $or: [
          { plantId: { $in: plantFilter } },
          { deviceId: { $in: plantFilter } }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(30);

      readings = readings.reverse();
    }

    return readings;
  } catch (error) {
    console.error('Error fetching sensor history:', error);
    return [];
  }
}

/**
 * Generate realistic simulated reading for Admin Simulator
 */
async function generateSimulation(scenario = 'NORMAL', deviceId = 'ESP32-TOMATO-01', plantId = 'tomato-01') {
  const latest = await SensorReading.findOne({ deviceId }).sort({ timestamp: -1 });

  let temp = latest ? latest.temperature : 28.0;
  let hum = latest ? latest.humidity : 60.0;
  let soil = latest ? latest.soilMoisture : 45.0;
  let light = latest ? latest.light : 800;

  const noise = (Math.random() - 0.5) * 0.4;

  switch (scenario.toUpperCase()) {
    case 'NORMAL':
      soil = Math.max(25, soil - (0.2 + noise));
      temp = Math.min(32, Math.max(22, temp + noise));
      hum = Math.min(75, Math.max(45, hum + noise));
      light = Math.min(1200, Math.max(400, light + Math.round(noise * 50)));
      break;

    case 'DRY_SOIL':
      soil = Math.max(10, soil - (2.5 + noise));
      temp = Math.min(36, temp + (0.5 + Math.abs(noise)));
      hum = Math.max(25, hum - (1.0 + Math.abs(noise)));
      light = Math.min(1400, light + 30);
      break;

    case 'RAIN':
      soil = Math.min(95, soil + (5.0 + Math.abs(noise)));
      hum = Math.min(92, hum + (3.0 + Math.abs(noise)));
      temp = Math.max(20, temp - (0.8 + Math.abs(noise)));
      light = Math.max(200, light - 100);
      break;

    case 'HEAT_WAVE':
      temp = Math.min(42, temp + (1.2 + Math.abs(noise)));
      temp = Math.min(42, temp + (1.2 + Math.abs(noise)));
      soil = Math.max(12, soil - (3.0 + Math.abs(noise)));
      hum = Math.max(20, hum - (2.5 + Math.abs(noise)));
      light = Math.min(1500, light + 150);
      break;

    default:
      break;
  }

  const payload = {
    deviceId,
    plantId,
    temperature: temp,
    humidity: hum,
    soilMoisture: soil,
    light: light,
    timestamp: new Date().toISOString(),
  };

  await IoTDevice.findOneAndUpdate({ deviceId }, { activeScenario: scenario });

  return await processSensorReading(payload);
}

/**
 * Check and mark stale devices as offline
 */
async function checkDeviceStatus() {
  try {
    const cutoff = new Date(Date.now() - 600000); // 10 minutes
    await IoTDevice.updateMany(
      { lastSeen: { $lt: cutoff }, status: { $ne: 'offline' } },
      { status: 'offline' }
    );
  } catch (err) {
    console.error('Error updating offline device statuses:', err.message);
  }
}

module.exports = {
  processSensorReading,
  getLatestReading,
  getSensorHistory,
  generateSimulation,
  checkDeviceStatus,
};
