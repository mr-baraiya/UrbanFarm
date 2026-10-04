const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      enum: ['user', 'garden', 'plant', 'post', 'diagnosis', 'contact_lead', 'system'],
      required: true,
    },
    targetId: mongoose.Schema.Types.ObjectId,
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AdminLog', AdminLogSchema);