const mongoose = require('mongoose');

const memberSubSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['INVITED', 'ACCEPTED', 'DECLINED', 'LEFT'],
      default: 'INVITED',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
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
    members: [memberSubSchema],
    minMembers: {
      type: Number,
      default: 3,
    },
    maxMembers: {
      type: Number,
      default: 10,
    },
    groupType: {
      type: String,
      enum: ['LOCAL', 'ONLINE'],
      default: 'LOCAL',
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [77.2090, 28.6139],
      },
      city: {
        type: String,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['FORMING', 'ACTIVE', 'INACTIVE'],
      default: 'FORMING',
      index: true,
    },
    createdByAI: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
groupSchema.index({ location: '2dsphere' });
groupSchema.index({ status: 1, interests: 1 });

// Helper methods on group instance
groupSchema.methods.getAcceptedCount = function () {
  return this.members.filter((m) => m.status === 'ACCEPTED').length;
};

groupSchema.methods.getReservedCount = function () {
  // Accepted + Invited members count towards capacity limit of 10
  return this.members.filter((m) => m.status === 'ACCEPTED' || m.status === 'INVITED').length;
};

groupSchema.methods.hasAvailableSeat = function () {
  return this.getReservedCount() < this.maxMembers;
};

module.exports = mongoose.model('Group', groupSchema);
