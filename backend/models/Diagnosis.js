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
    isPlant: {
      type: Boolean,
      default: true,
    },
    plantName: {
      type: String,
      default: '',
    },
    scientificName: {
      type: String,
      default: '',
    },
    isHealthy: {
      type: Boolean,
      default: false,
    },
    confidenceLevel: {
      type: String,
      enum: ['high', 'medium', 'low', ''],
      default: 'medium',
    },
    shortExplanation: String,
    description: String,
    observedSymptoms: [String],
    symptoms: [String],
    possibleCauses: [String],
    causes: [String],
    cause: String,
    severityLevel: {
      type: String,
      default: 'Moderate',
    },
    severityPercentage: {
      type: Number,
      default: 50,
    },
    severityDescription: String,
    immediateActions: [String],
    treatmentSteps: [String],
    modernSolutions: [String],
    medicalSolutions: [String],
    naturalSolutions: [String],
    desiSolutions: [String],
    treatment: String,
    recoveryTips: [String],
    preventionTips: [String],
    whenToContactExpert: String,
    whenToSeekExpertHelp: String,
    noteIfUnsure: String,
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