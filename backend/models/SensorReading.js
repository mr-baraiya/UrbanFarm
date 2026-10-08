const mongoose = require('mongoose');

const SensorReadingSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    plantId: {
      type: String,
      required: true,
      index: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      required: true,
    },
    soilMoisture: {
      type: Number,
      required: true,
    },
    light: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast historical queries
SensorReadingSchema.index({ plantId: 1, timestamp: -1 });
SensorReadingSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorReading', SensorReadingSchema);
