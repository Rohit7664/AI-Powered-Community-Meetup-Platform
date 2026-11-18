const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    ageRange: {
      type: String,
      default: '18-25',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    preferredLanguage: {
      type: String,
      default: 'English',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.2090, 28.6139], // Default Delhi coordinates
      },
      address: {
        type: String,
        default: '',
      },
    },
    preferredRadiusKm: {
      type: Number,
      default: 10,
    },
    interests: {
      type: [String],
      default: [],
      index: true,
    },
    customInterests: {
      type: [String],
      default: [],
    },
    preferences: {
      activityTypes: {
        type: [String],
        default: ['Outdoor activities', 'Weekend activities'],
      },
      indoorOutdoor: {
        type: String,
        enum: ['Indoor', 'Outdoor', 'Both'],
        default: 'Both',
      },
      allowOnline: {
        type: Boolean,
        default: true,
      },
    },
    embedding: {
      type: [Number],
      default: [],
    },
    embeddingModelVersion: {
      type: String,
      default: 'all-MiniLM-L6-v2',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for location
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
