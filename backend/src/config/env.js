const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env if available
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback

module.exports = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interesthub',
  JWT_SECRET: process.env.JWT_SECRET || 'interesthub_jwt_secret_dev_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MATCHING_WEIGHTS: {
    interest: 0.50,
    location: 0.20,
    activity: 0.15,
    preference: 0.15,
  },
  MATCHING_THRESHOLD: 70, // 70% threshold
  LOCAL_RADIUS_KM: 10, // 10 km default local matching radius
  GROUP_MIN_ACCEPTED: 3,
  GROUP_MAX_RESERVED: 10,
};
