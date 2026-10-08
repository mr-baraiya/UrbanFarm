const mongoose = require('mongoose');

const IoTDeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      default: null,
      index: true,
    },
    plantCustomId: {
      type: String,
      default: 'tomato-01',
      index: true,
    },
    deviceName: {
      type: String,
      default: 'ESP32 Tomato Sensor',
      trim: true,
    },
    deviceType: {
      type: String,
      default: 'ESP32-Virtual',
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'warning', 'error'],
      default: 'offline',
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    batteryLevel: {
      type: Number,
      default: 100,
    },
    location: {
      type: String,
      default: 'Urban Garden Bed 1',
    },
    activeScenario: {
      type: String,
      enum: ['NORMAL', 'DRY_SOIL', 'RAIN', 'HEAT_WAVE', 'NONE'],
      default: 'NORMAL',
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('IoTDevice', IoTDeviceSchema);
