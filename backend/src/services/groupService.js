const Group = require('../models/Group');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const { calculateDistanceKm } = require('../utils/distance');

const getRecommendedGroups = async (user, limit = 10) => {
  const userInterests = user.interests || [];
  const userCoord = user.location && user.location.coordinates ? user.location.coordinates : null;

  // Find active or forming groups where user is not already accepted or invited
  const groups = await Group.find({
    status: { $in: ['ACTIVE', 'FORMING'] },
    'members.user': { $ne: user._id },
  }).limit(30);

  // Score each group
  const scored = groups.map((group) => {
    // Interest overlap count
    const shared = group.interests.filter((i) => userInterests.includes(i));
    const interestScore = userInterests.length > 0 ? (shared.length / Math.max(1, group.interests.length)) * 100 : 50;

    let distanceKm = null;
    let locationScore = 100;
    if (group.groupType === 'LOCAL' && userCoord && group.location && group.location.coordinates) {
      distanceKm = calculateDistanceKm(
        userCoord[1],
        userCoord[0],
        group.location.coordinates[1],
        group.location.coordinates[0]
      );
      locationScore = distanceKm <= 10 ? 100 - (distanceKm / 10) * 30 : Math.max(20, 70 - distanceKm * 2);
    }

    const overallScore = Math.round(interestScore * 0.7 + locationScore * 0.3);

    return {
      group,
      sharedInterests: shared,
      distanceKm,
      matchScore: overallScore,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit);
};

const getGroupDetails = async (groupId, userId) => {
  const group = await Group.findById(groupId).populate('members.user', 'name profileImage bio city interests');
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  const isMember = group.members.some(
    (m) => m.user && m.user._id.toString() === userId.toString() && m.status === 'ACCEPTED'
  );
  const isInvited = group.members.some(
    (m) => m.user && m.user._id.toString() === userId.toString() && m.status === 'INVITED'
  );

  return {
    group,
    isMember,
    isInvited,
    acceptedMembersCount: group.getAcceptedCount(),
    reservedCount: group.getReservedCount(),
  };
};

const leaveGroup = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  // Update status to LEFT
  let found = false;
  for (const m of group.members) {
    if (m.user.toString() === userId.toString()) {
      m.status = 'LEFT';
      found = true;
      break;
    }
  }

  if (found) {
    group.members = group.members.filter((m) => m.user.toString() !== userId.toString());
    // If accepted members fall below minMembers and group was active, handle status
    if (group.getAcceptedCount() < group.minMembers) {
      group.status = 'FORMING';
    }
    await group.save();
  }

  return { message: 'Left group successfully.' };
};

module.exports = {
  getRecommendedGroups,
  getGroupDetails,
  leaveGroup,
};
