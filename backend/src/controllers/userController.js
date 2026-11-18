const User = require('../models/User');
const MatchHistory = require('../models/MatchHistory');
const PendingMatch = require('../models/PendingMatch');
const { generateEmbeddings } = require('../services/embeddingService');
const { addMatchingJob } = require('../queues/matchingQueue');
const { successResponse } = require('../utils/apiResponse');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const pendingMatch = await PendingMatch.findOne({ userId: req.user._id });
    return successResponse(res, 200, 'User profile retrieved', {
      user,
      pendingMatchStatus: pendingMatch ? pendingMatch.status : null,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'ageRange',
      'bio',
      'city',
      'preferredLanguage',
      'profileImage',
      'preferences',
      'onboardingCompleted',
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

const updateInterests = async (req, res, next) => {
  try {
    const { interests, customInterests = [], customDescription = '' } = req.body;

    const user = await User.findById(req.user._id);
    user.interests = interests;
    user.customInterests = customInterests;

    // Generate semantic interest text for Sentence Transformers
    const interestText = [
      ...interests,
      ...customInterests,
      customDescription,
      user.bio || '',
    ]
      .filter(Boolean)
      .join('. ');

    // Generate 384-d semantic embedding
    const embedding = await generateEmbeddings(interestText);
    user.embedding = embedding;
    user.embeddingModelVersion = 'all-MiniLM-L6-v2';

    await user.save();

    // Trigger BullMQ background matching job
    await addMatchingJob(user._id);

    return successResponse(
      res,
      200,
      "Interests updated. We're finding people and communities that share your passion!",
      {
        interests: user.interests,
        customInterests: user.customInterests,
        embeddingLength: embedding.length,
      }
    );
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const { city, coordinates, address, preferredRadiusKm } = req.body;

    const user = await User.findById(req.user._id);
    if (city) user.city = city;
    if (coordinates) {
      user.location = {
        type: 'Point',
        coordinates,
        address: address || user.location?.address || '',
      };
    }
    if (preferredRadiusKm) user.preferredRadiusKm = preferredRadiusKm;

    await user.save();

    // Trigger matching re-evaluation for location update
    if (user.interests && user.interests.length > 0) {
      await addMatchingJob(user._id);
    }

    return successResponse(res, 200, 'Location updated successfully', {
      city: user.city,
      location: user.location,
      preferredRadiusKm: user.preferredRadiusKm,
    });
  } catch (error) {
    next(error);
  }
};

const getMatches = async (req, res, next) => {
  try {
    const matchHistory = await MatchHistory.find({ userId: req.user._id })
      .populate('groupId', 'name image status interests')
      .populate('matchedUserIds', 'name profileImage city interests')
      .sort({ createdAt: -1 })
      .limit(20);

    const pending = await PendingMatch.findOne({ userId: req.user._id });

    return successResponse(res, 200, 'User matches retrieved', {
      pendingStatus: pending ? pending.status : 'NONE',
      history: matchHistory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateInterests,
  updateLocation,
  getMatches,
};
