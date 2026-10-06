const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
    },
    imageUrl: {
      type: String,
      required: true,
    },
    diseaseName: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    treatment: String,
    treatmentSteps: [String],
    cause: String,
    preventionTips: [String],
    description: String,
    shareId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    translations: {
      type: Map,
      of: Object,
      default: {},
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Diagnosis', DiagnosisSchema);