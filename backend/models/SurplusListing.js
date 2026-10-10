const mongoose = require('mongoose');

const SurplusListingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerName: {
      type: String,
      default: 'Urban Farmer',
    },
    sellerAvatar: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: [true, 'Please add a title for your surplus item'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['fruits', 'vegetables', 'flowers', 'herbs', 'seeds', 'compost', 'tools'],
      default: 'vegetables',
    },
    quantity: {
      type: String,
      required: [true, 'Please specify quantity (e.g. 2 kg, 3 bunches)'],
    },
    priceType: {
      type: String,
      enum: ['free', 'fixed', 'negotiable', 'swap'],
      default: 'fixed',
    },
    price: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: 'kg',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    location: {
      state: { type: String, default: '' },
      district: { type: String, default: '' },
      neighborhood: { type: String, default: 'Sector 4' },
      city: { type: String, default: 'Urban City' },
      distanceKm: { type: Number, default: 1.2 },
    },
    status: {
      type: String,
      enum: ['available', 'requested', 'reserved', 'sold'],
      default: 'available',
    },
    pendingRequests: [
      {
        dealId: { type: String },
        listingId: { type: String },
        listingTitle: { type: String },
        listingImage: { type: String },
        sellerName: { type: String },
        sellerId: { type: String },
        buyerName: { type: String },
        buyerId: { type: String },
        quantity: { type: String },
        price: { type: String },
        paymentMethod: { type: String },
        pickupTime: { type: String },
        notes: { type: String },
        neighborhood: { type: String },
        createdAt: { type: Date, default: Date.now },
        status: { type: String, default: 'pending_approval' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SurplusListing', SurplusListingSchema);
