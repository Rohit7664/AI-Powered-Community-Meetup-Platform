const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
      default: 'PENDING',
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiration
      index: { expires: 0 }, // TTL index
    },
  },
  { timestamps: true }
);

// Compound unique index: A user cannot receive duplicate invitations for the same group
invitationSchema.index({ groupId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Invitation', invitationSchema);
