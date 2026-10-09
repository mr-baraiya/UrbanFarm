/**
 * plantStatus.js - Single Unified Agronomic Config & Thresholds
 * Centralized evaluation for Tomato (Solanum lycopersicum)
 */

export const TOMATO_THRESHOLDS = {
  // Soil moisture targets (Root zone capacitive sensor)
  moisture: {
    minSafe: 35,
    dryWarn: 50,
    optimalMin: 50,
    optimalMax: 70,
    wetWarn: 70,
    waterlogged: 85,
  },
  
  // Root and canopy temperature (°C)
  temperature: {
    frost: 10,
    chillyWarn: 18,
    optimalMin: 20,
    optimalMax: 30,
    heatStressWarn: 32, // leaf tip curling & stress
    flowerDropDanger: 35, // critical blossom abortion threshold ("Act now")
  },

  // Ambient humidity (%)
  humidity: {
    dryAir: 35,
    optimalMin: 45,
    optimalMax: 70,
    fungalRisk: 80,
  },

  // Calibrated Lux Thresholds (Photodiode sensor)
  // TODO: Refine once hardware manufacturer photometric calibration curve is finalized
  lightLux: {
    nightDark: 200,
    partialShade: 2500,
    moderateSun: 20000,
    fullDirectSun: 50000,
  },

  // Daily Maximum Irrigation Limits
  dailySafeMaxVolumeMl: 600,
  standardDripDoseMl: 250,
};

/**
 * Evaluates the plant's overall condition and returns localized status tags
 */
export const evaluatePlantStatus = (sensors = {}, isHealthyBenchmark = false) => {
  if (isHealthyBenchmark) {
    return {
      moisture: { status: 'good', labelKey: 'plant.status.good', val: 60, droopFactor: 0, soilDarkness: 0.5 },
      temperature: { status: 'good', labelKey: 'plant.status.good', val: 24, tipBrowning: 0 },
      humidity: { status: 'good', labelKey: 'plant.status.good', val: 55 },
      light: { status: 'good', labelKey: 'plant.status.good', val: 12000 },
      healthScore: 100,
      overallStatus: 'good',
    };
  }

  const m = Number(sensors.moisture ?? 55);
  const t = Number(sensors.temperature ?? 25);
  const h = Number(sensors.humidity ?? 50);
  const lux = Number(sensors.lux ?? 2000);

  // Moisture evaluation
  let moistureStatus = 'good';
  let moistureKey = 'plant.status.good';
  let droopFactor = 0; // 0 to 1
  let soilDarkness = 0.5;

  if (m < TOMATO_THRESHOLDS.moisture.dryWarn) {
    moistureStatus = 'warn';
    moistureKey = 'plant.status.warn';
    droopFactor = Math.min(1, (TOMATO_THRESHOLDS.moisture.dryWarn - m) / 30);
    soilDarkness = 0.2;
  } else if (m > TOMATO_THRESHOLDS.moisture.wetWarn) {
    moistureStatus = 'wet';
    moistureKey = 'plant.status.wet';
    droopFactor = 0;
    soilDarkness = 0.9;
  } else {
    moistureStatus = 'good';
    moistureKey = 'plant.status.good';
    droopFactor = 0;
    soilDarkness = 0.6;
  }

  // Temperature evaluation
  let tempStatus = 'good';
  let tempKey = 'plant.status.good';
  let tipBrowning = 0; // 0 to 1

  if (t >= TOMATO_THRESHOLDS.temperature.flowerDropDanger) {
    tempStatus = 'bad';
    tempKey = 'plant.status.bad';
    tipBrowning = 0.9;
  } else if (t >= TOMATO_THRESHOLDS.temperature.heatStressWarn) {
    tempStatus = 'warn';
    tempKey = 'plant.status.warn';
    tipBrowning = 0.45;
  } else if (t < TOMATO_THRESHOLDS.temperature.chillyWarn) {
    tempStatus = 'warn';
    tempKey = 'plant.status.warn';
    tipBrowning = 0.1;
  }

  // Humidity evaluation
  let humidityStatus = 'good';
  let humidityKey = 'plant.status.good';
  if (h < TOMATO_THRESHOLDS.humidity.dryAir || h > TOMATO_THRESHOLDS.humidity.fungalRisk) {
    humidityStatus = 'warn';
    humidityKey = 'plant.status.warn';
  }

  // Light evaluation
  let lightStatus = 'good';
  let lightKey = 'plant.status.good';
  if (lux < TOMATO_THRESHOLDS.lightLux.nightDark) {
    lightStatus = 'warn';
    lightKey = 'plant.status.warn';
  }

  // Combined score (0-100)
  let healthScore = 100;
  if (moistureStatus !== 'good') healthScore -= 20;
  if (tempStatus === 'bad') healthScore -= 30;
  else if (tempStatus === 'warn') healthScore -= 15;
  if (humidityStatus !== 'good') healthScore -= 10;
  healthScore = Math.max(25, Math.min(100, healthScore));

  return {
    moisture: { status: moistureStatus, labelKey: moistureKey, val: m, droopFactor, soilDarkness },
    temperature: { status: tempStatus, labelKey: tempKey, val: t, tipBrowning },
    humidity: { status: humidityStatus, labelKey: humidityKey, val: h },
    light: { status: lightStatus, labelKey: lightKey, val: lux },
    healthScore,
    overallStatus: tempStatus === 'bad' ? 'bad' : moistureStatus !== 'good' || tempStatus !== 'good' ? 'warn' : 'good',
  };
};
