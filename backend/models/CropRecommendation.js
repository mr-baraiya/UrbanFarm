const mongoose = require('mongoose');

const CropRecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inputData: {
      soilType: String,
      ph: Number,
      temperature: Number,
      humidity: Number,
      rainfall: Number,
      season: String,
      region: String,
    },
    recommendations: [
      {
        cropName: String,
        confidence: Number,
        reason: String,
        plantingTips: String,
        expectedYield: String,
      },
    ],
    saved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CropRecommendation', CropRecommendationSchema);