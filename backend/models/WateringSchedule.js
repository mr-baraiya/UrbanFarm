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
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,
        skipped: {
          type: Boolean,
          default: false,
        },
        customEdited: {
          type: Boolean,
          default: false,
        },
        adjustmentReason: String,
      },
    ],
    weatherAdjusted: {
      type: Boolean,
      default: false,
    },
    skipReason: String,
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isMissed: {
      type: Boolean,
      default: false,
    },
    isSkipped: {
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
    strict: false,
  }
);

module.exports = mongoose.model('WateringSchedule', WateringScheduleSchema);