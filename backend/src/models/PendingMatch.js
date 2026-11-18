const mongoose = require('mongoose');

const pendingMatchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One entry per user in pending matches pool
      index: true,
    },
    interests: {
      type: [String],
      default: [],
      index: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [77.2090, 28.6139],
      },
    },
    preferredRadiusKm: {
      type: Number,
      default: 10,
    },
    preferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['PENDING', 'MATCHED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    lastMatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

pendingMatchSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('PendingMatch', pendingMatchSchema);
