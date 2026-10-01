const mongoose = require('mongoose');

const ContactLeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Please select or provide a subject'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please enter your message'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'resolved', 'archived'],
      default: 'new',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ContactLead', ContactLeadSchema);
