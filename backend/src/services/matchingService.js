const User = require('../models/User');
const Group = require('../models/Group');
const Invitation = require('../models/Invitation');
const PendingMatch = require('../models/PendingMatch');
const MatchHistory = require('../models/MatchHistory');
const config = require('../config/env');
const logger = require('../utils/logger');
const { calculateLocationScore } = require('../utils/distance');
const { calculateCosineSimilarity } = require('./embeddingService');
const { createNotification } = require('./notificationService');

/**
 * Calculate Activity Compatibility Score (0 to 100)
 */
function calculateActivityScore(prefA = {}, prefB = {}) {
  const actA = prefA.activityTypes || [];
  const actB = prefB.activityTypes || [];
  if (actA.length === 0 || actB.length === 0) return 60; // neutral default

  const shared = actA.filter((a) => actB.includes(a));
  const union = new Set([...actA, ...actB]);
  const jaccard = shared.length / union.size;
  return Math.round(jaccard * 100);
}

/**
 * Calculate Preference Compatibility Score (0 to 100)
 * (Indoor/Outdoor match, Online match)
 */
function calculatePreferenceScore(prefA = {}, prefB = {}) {
  let score = 70;
  if (prefA.indoorOutdoor && prefB.indoorOutdoor) {
    if (prefA.indoorOutdoor === prefB.indoorOutdoor || prefA.indoorOutdoor === 'Both' || prefB.indoorOutdoor === 'Both') {
      score += 20;
    } else {
      score -= 30;
    }
  }
  if (prefA.allowOnline !== undefined && prefB.allowOnline !== undefined) {
    if (prefA.allowOnline && prefB.allowOnline) {
      score += 10;
    }
  }
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Overall Matching Score using the weighted formula:
 * Interest Similarity * 0.50 + Location Compatibility * 0.20 + Activity Compatibility * 0.15 + Preference Compatibility * 0.15
 */
function calculateOverallScore({ interestSim, locationScore, activityScore, preferenceScore }) {
  const w = config.MATCHING_WEIGHTS;
  const rawInterestScore = interestSim * 100; // convert 0-1 to 0-100

  const overall =
    rawInterestScore * w.interest +
    locationScore * w.location +
    activityScore * w.activity +
    preferenceScore * w.preference;

  return Math.round(Math.max(0, Math.min(100, overall)));
}

/**
 * Generate a smart group name and description based on shared interests
 */
function generateGroupNameAndDescription(interests = [], city = '') {
  const topInterests = interests.slice(0, 3);
  let name = '';
  if (topInterests.length === 1) {
    name = `${topInterests[0]} Enthusiasts`;
  } else if (topInterests.length === 2) {
    name = `${topInterests[0]} & ${topInterests[1]} Hub`;
  } else if (topInterests.length >= 3) {
    name = `${topInterests[0]}, ${topInterests[1]} & ${topInterests[2]} Circle`;
  } else {
    name = city ? `${city} Passion Connect` : 'Community Explorers';
  }

  // Prepend city if local and space permits
  if (city && Math.random() > 0.4) {
    name = `${city} ${name}`;
  }

  const interestText = topInterests.join(', ');
  const description = `An AI-curated community bringing together passionate people around ${interestText || 'shared interests'}. Connect, share ideas, organize meetups and make real connections!`;

  return { name, description };
}

/**
 * Main matching pipeline for a user
 */
const runMatchingForUser = async (userId) => {
  logger.info(`[MatchingService] Starting matching evaluation for user ${userId}`);
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    logger.warn(`[MatchingService] User ${userId} not active or not found.`);
    return null;
  }

  const userInterests = user.interests || [];
  const userEmbedding = user.embedding || [];
  const userLocation = user.location && user.location.coordinates ? user.location.coordinates : [77.2090, 28.6139];
  const userRadius = user.preferredRadiusKm || config.LOCAL_RADIUS_KM;

  // 1. Search existing groups first
  // Retrieve FORMING and ACTIVE groups that have capacity (reservedCount < 10)
  const candidateGroups = await Group.find({
    status: { $in: ['FORMING', 'ACTIVE'] },
    'members.user': { $ne: user._id }, // user not already in group
  });

  let bestGroupMatch = null;
  let highestGroupScore = 0;

  for (const group of candidateGroups) {
    // Check reserved seats capacity (must have available seat < 10)
    if (!group.hasAvailableSeat()) {
      continue;
    }

    // Semantic interest similarity with group embedding
    const interestSim = calculateCosineSimilarity(userEmbedding, group.embedding);

    // Location score
    const groupCoord = group.location && group.location.coordinates ? group.location.coordinates : null;
    const isOnline = group.groupType === 'ONLINE';
    const locScore = calculateLocationScore(userLocation, groupCoord, userRadius, isOnline);

    // Activity & preference
    const actScore = 75; // default compatibility with community
    const prefScore = 80;

    const overallScore = calculateOverallScore({
      interestSim,
      locationScore: locScore,
      activityScore: actScore,
      preferenceScore: prefScore,
    });

    if (overallScore >= config.MATCHING_THRESHOLD && overallScore > highestGroupScore) {
      highestGroupScore = overallScore;
      bestGroupMatch = {
        group,
        overallScore,
        interestSim,
        locationScore: locScore,
      };
    }
  }

  // If a suitable existing group is found:
  if (bestGroupMatch) {
    const { group, overallScore, interestSim, locationScore } = bestGroupMatch;
    logger.info(`[MatchingService] Found matching existing group "${group.name}" with score ${overallScore}% for user ${user.name}`);

    // Check duplicate invitation protection
    const existingInvitation = await Invitation.findOne({
      groupId: group._id,
      userId: user._id,
    });

    if (!existingInvitation) {
      // Add member reservation to group
      group.members.push({
        user: user._id,
        role: 'member',
        status: 'INVITED',
        joinedAt: new Date(),
      });
      await group.save();

      // Create invitation
      const invitation = await Invitation.create({
        groupId: group._id,
        userId: user._id,
        matchScore: overallScore,
        status: 'PENDING',
      });

      // Create notification
      await createNotification({
        userId: user._id,
        type: 'NEW_INVITATION',
        title: 'New Community Invitation!',
        message: `You were invited to join "${group.name}" based on your shared interests! (Match: ${overallScore}%)`,
        relatedGroupId: group._id,
        relatedInvitationId: invitation._id,
      });

      // Record match history
      await MatchHistory.create({
        userId: user._id,
        groupId: group._id,
        interestScore: Math.round(interestSim * 100),
        locationScore,
        activityScore: 75,
        preferenceScore: 80,
        overallScore,
        status: 'INVITATION_SENT',
      });

      // Update pending match status
      await PendingMatch.findOneAndUpdate(
        { userId: user._id },
        { status: 'MATCHED', lastMatchedAt: new Date() }
      );

      return {
        action: 'INVITED_TO_EXISTING_GROUP',
        groupId: group._id,
        groupName: group.name,
        score: overallScore,
      };
    }
  }

  // 2. If no suitable existing group, search PendingMatch pool
  logger.info(`[MatchingService] No suitable existing group found. Searching pending pool for user ${user.name}...`);

  // Ensure current user is in pending matches
  await PendingMatch.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      interests: userInterests,
      embedding: userEmbedding,
      location: user.location,
      preferredRadiusKm: userRadius,
      preferences: user.preferences,
      status: 'PENDING',
      lastMatchedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  // Retrieve other pending unmatched users
  const pendingCandidates = await PendingMatch.find({
    userId: { $ne: user._id },
    status: 'PENDING',
  }).populate('userId');

  const compatibleCandidates = [];

  for (const candidate of pendingCandidates) {
    if (!candidate.userId || !candidate.userId.isActive) continue;

    // Semantic interest similarity
    const interestSim = calculateCosineSimilarity(userEmbedding, candidate.embedding);

    // Location compatibility
    const candCoord = candidate.location && candidate.location.coordinates ? candidate.location.coordinates : null;
    const isOnline = user.preferences?.allowOnline && candidate.preferences?.allowOnline;
    const locScore = calculateLocationScore(userLocation, candCoord, userRadius, isOnline);

    // Activity compatibility
    const actScore = calculateActivityScore(user.preferences, candidate.preferences);

    // Preference compatibility
    const prefScore = calculatePreferenceScore(user.preferences, candidate.preferences);

    const overallScore = calculateOverallScore({
      interestSim,
      locationScore: locScore,
      activityScore: actScore,
      preferenceScore: prefScore,
    });

    if (overallScore >= config.MATCHING_THRESHOLD) {
      compatibleCandidates.push({
        candidate,
        user: candidate.userId,
        overallScore,
        interestSim,
        locationScore: locScore,
      });
    }
  }

  // Sort candidates by match score descending
  compatibleCandidates.sort((a, b) => b.overallScore - a.overallScore);

  // Requirement: Minimum 3 compatible users (current user + at least 2 candidates) to form a new group
  if (compatibleCandidates.length >= 2) {
    // Select top candidates up to max 9 other candidates (max 10 reserved members total)
    const selectedMatches = compatibleCandidates.slice(0, 9);
    const allUsers = [user, ...selectedMatches.map((m) => m.user)];

    // Consolidate shared interests
    const interestCounts = {};
    for (const u of allUsers) {
      for (const interest of u.interests || []) {
        interestCounts[interest] = (interestCounts[interest] || 0) + 1;
      }
    }
    const sharedInterests = Object.keys(interestCounts).sort((a, b) => interestCounts[b] - interestCounts[a]);

    // Group naming & description
    const { name: groupName, description: groupDesc } = generateGroupNameAndDescription(
      sharedInterests,
      user.city || ''
    );

    logger.info(`[MatchingService] Creating new AI community "${groupName}" for ${allUsers.length} compatible users!`);

    // Create the group in FORMING status
    const newGroup = await Group.create({
      name: groupName,
      description: groupDesc,
      interests: sharedInterests.slice(0, 5),
      embedding: userEmbedding, // Group embedding seeded from initial members
      groupType: user.preferences?.allowOnline ? 'LOCAL' : 'LOCAL',
      location: user.location,
      status: 'FORMING',
      createdByAI: true,
      minMembers: config.GROUP_MIN_ACCEPTED, // 3
      maxMembers: config.GROUP_MAX_RESERVED, // 10
      members: allUsers.map((u) => ({
        user: u._id,
        role: 'member',
        status: 'INVITED',
        joinedAt: new Date(),
      })),
    });

    // Send invitations & notifications to all selected users
    for (const u of allUsers) {
      const matchScore = u._id.toString() === user._id.toString()
        ? 100
        : (compatibleCandidates.find((c) => c.user._id.toString() === u._id.toString())?.overallScore || 85);

      const inv = await Invitation.create({
        groupId: newGroup._id,
        userId: u._id,
        matchScore,
        status: 'PENDING',
      });

      await createNotification({
        userId: u._id,
        type: 'NEW_INVITATION',
        title: 'New AI Community Formed!',
        message: `A new community "${newGroup.name}" was formed for your interests! Accept to join and activate it.`,
        relatedGroupId: newGroup._id,
        relatedInvitationId: inv._id,
      });

      // Update pending match status
      await PendingMatch.findOneAndUpdate(
        { userId: u._id },
        { status: 'MATCHED', lastMatchedAt: new Date() }
      );
    }

    return {
      action: 'CREATED_NEW_GROUP',
      groupId: newGroup._id,
      groupName: newGroup.name,
      usersInvitedCount: allUsers.length,
    };
  } else {
    logger.info(
      `[MatchingService] User ${user.name} placed in pending pool (${compatibleCandidates.length} compatible users found, requires 2 more).`
    );
    return {
      action: 'WAITING_IN_PENDING_POOL',
      pendingCandidatesFound: compatibleCandidates.length,
    };
  }
};

module.exports = {
  runMatchingForUser,
  calculateOverallScore,
  calculateActivityScore,
  calculatePreferenceScore,
  generateGroupNameAndDescription,
};
