const mongoose = require('mongoose');

const PlantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a plant name'],
      trim: true,
    },
    scientificName: String,
    variety: String,
    gardenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Garden',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plantingDate: Date,
    harvestDate: Date,
    status: {
      type: String,
      enum: ['seedling', 'growing', 'mature', 'harvested', 'dead'],
      default: 'seedling',
    },
    health: {
      type: String,
      enum: ['healthy', 'warning', 'unhealthy'],
      default: 'healthy',
    },
    imageUrl: String,
    notes: String,
    waterFrequency: {
      type: Number, // days between watering
      min: [0, 'Water frequency cannot be negative'],
      default: 3,
    },
    lastWatered: {
      type: Date,
      default: Date.now,
    },
    nextWateringDate: {
      type: Date,
    },
    wateringHistory: [
      {
        date: { type: Date, default: Date.now },
        notes: String,
      },
    ],
    sunlight: {
      type: String,
      enum: ['full', 'partial', 'shade'],
      default: 'full',
    },
    growthTimeline: [
      {
        date: Date,
        height: Number, // cm
        notes: String,
        imageUrl: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Plant', PlantSchema);