const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Sports', 'Travel', 'Technology', 'Creative', 'Lifestyle', 'Social', 'Custom'],
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    relatedInterests: {
      type: [String],
      default: [],
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interest', interestSchema);
