const mongoose = require('mongoose');

const matchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: false,
      index: true,
    },
    matchedUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    interestScore: {
      type: Number,
      default: 0,
    },
    locationScore: {
      type: Number,
      default: 0,
    },
    activityScore: {
      type: Number,
      default: 0,
    },
    preferenceScore: {
      type: Number,
      default: 0,
    },
    overallScore: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: 'PROCESSED',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MatchHistory', matchHistorySchema);
