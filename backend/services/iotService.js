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
  const noise = (Math.random() - 0.5) * 0.6;

  let temp = 25.0;
  let hum = 55.0;
  let soil = 58.0;
  let light = 750;

  switch (scenario.toUpperCase()) {
    case 'NORMAL':
      soil = Math.max(50, Math.min(68, Math.round((58.5 + noise * 4) * 10) / 10));
      temp = Math.max(22, Math.min(28, Math.round((25.2 + noise * 2) * 10) / 10));
      hum = Math.max(48, Math.min(65, Math.round((56.0 + noise * 4) * 10) / 10));
      light = Math.round(720 + noise * 60);
      break;

    case 'DRY_SOIL':
      soil = Math.max(15, Math.min(36, Math.round((28.5 + noise * 3) * 10) / 10));
      temp = Math.max(30, Math.min(36, Math.round((33.2 + noise * 2) * 10) / 10));
      hum = Math.max(22, Math.min(38, Math.round((30.0 + noise * 3) * 10) / 10));
      light = Math.round(1250 + noise * 60);
      break;

    case 'RAIN':
      soil = Math.max(75, Math.min(92, Math.round((82.5 + noise * 3) * 10) / 10));
      hum = Math.max(80, Math.min(96, Math.round((88.0 + noise * 3) * 10) / 10));
      temp = Math.max(18, Math.min(24, Math.round((21.0 + noise * 2) * 10) / 10));
      light = Math.round(280 + noise * 40);
      break;

    case 'HEAT_WAVE':
      temp = Math.max(37, Math.min(43, Math.round((38.8 + noise * 2) * 10) / 10));
      soil = Math.max(20, Math.min(38, Math.round((33.5 + noise * 3) * 10) / 10));
      hum = Math.max(15, Math.min(28, Math.round((22.0 + noise * 3) * 10) / 10));
      light = Math.round(1450 + noise * 50);
      break;

    default:
      soil = 55.0;
      temp = 25.0;
      hum = 55.0;
      light = 700;
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

  await IoTDevice.findOneAndUpdate(
    { deviceId },
    { activeScenario: scenario, status: 'online', lastSeen: new Date() },
    { upsert: true }
  );

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

/**
 * Trigger remote water pump actuator (increases soil moisture & creates reading)
 */
async function triggerPump(plantIdKey = 'tomato-01', amountMl = 250, durationSec = 3) {
  const { reading } = await getLatestReading(plantIdKey);
  const currentSoil = reading ? reading.soilMoisture : 35;
  const currentTemp = reading ? reading.temperature : 28.0;
  const currentHum = reading ? reading.humidity : 55.0;
  const currentLight = reading ? reading.light : 800;

  // Calculate moisture increase based on volume (e.g. 100ml -> +10%, 250ml -> +22%, 500ml -> +35%)
  const boost = Math.min(40, Math.max(8, Math.round((Number(amountMl) / 10) * 0.9)));
  const newSoil = Math.min(88, Math.max(10, Math.round((currentSoil + boost) * 10) / 10));
  const newTemp = Math.max(18, Math.round((currentTemp - 0.4) * 10) / 10);
  const newHum = Math.min(95, Math.round((currentHum + 5) * 10) / 10);

  const deviceId = 'ESP32-TOMATO-01';
  const plantId = String(plantIdKey || 'tomato-01');

  const payload = {
    deviceId,
    plantId,
    temperature: newTemp,
    humidity: newHum,
    soilMoisture: newSoil,
    light: currentLight,
    timestamp: new Date().toISOString(),
  };

  const newReading = await processSensorReading(payload);

  return {
    success: true,
    amountMl: Number(amountMl),
    durationSec: Number(durationSec),
    previousMoisture: currentSoil,
    newMoisture: newSoil,
    reading: newReading,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  processSensorReading,
  getLatestReading,
  getSensorHistory,
  generateSimulation,
  checkDeviceStatus,
  triggerPump,
};

