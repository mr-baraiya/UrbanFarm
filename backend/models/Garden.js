const mongoose = require('mongoose');

const GardenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a garden name'],
      trim: true,
    },
    description: String,
    location: {
      type: String,
      trim: true,
    },
    size: {
      type: Number, // in square meters
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plant',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Garden', GardenSchema);