const mongoose = require('mongoose');

const WateringScheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      required: true,
    },
    schedule: [
      {
        date: Date,
        amount: String, // e.g., "500ml", "1L"
        timeOfDay: String, // e.g., "morning", "evening"
        notes: String,
      },
    ],
    weatherAdjusted: {
      type: Boolean,
      default: false,
    },
    nextWateringDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WateringSchedule', WateringScheduleSchema);