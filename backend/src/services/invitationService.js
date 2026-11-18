const Invitation = require('../models/Invitation');
const Group = require('../models/Group');
const User = require('../models/User');
const { createNotification } = require('./notificationService');
const { calculateDistanceKm } = require('../utils/distance');
const logger = require('../utils/logger');

const getUserInvitations = async (userId) => {
  const user = await User.findById(userId);
  const invitations = await Invitation.find({
    userId,
    status: 'PENDING',
  })
    .populate('groupId')
    .sort({ createdAt: -1 });

  // Enrich with approximate distance and group info
  return invitations
    .filter((inv) => inv.groupId && inv.groupId.status !== 'INACTIVE')
    .map((inv) => {
      const group = inv.groupId;
      let approxDistanceKm = null;
      if (
        user &&
        user.location &&
        user.location.coordinates &&
        group.location &&
        group.location.coordinates &&
        group.groupType === 'LOCAL'
      ) {
        approxDistanceKm = calculateDistanceKm(
          user.location.coordinates[1],
          user.location.coordinates[0],
          group.location.coordinates[1],
          group.location.coordinates[0]
        );
      }

      return {
        _id: inv._id,
        groupId: group._id,
        groupName: group.name,
        groupDescription: group.description,
        groupImage: group.image,
        groupType: group.groupType,
        interests: group.interests,
        matchScore: inv.matchScore,
        status: inv.status,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
        approxDistanceKm,
        acceptedMembersCount: group.getAcceptedCount ? group.getAcceptedCount() : 0,
        groupStatus: group.status,
      };
    });
};

const acceptInvitation = async (invitationId, userId) => {
  const invitation = await Invitation.findOne({
    _id: invitationId,
    userId,
    status: 'PENDING',
  });

  if (!invitation) {
    const error = new Error('Invitation not found or already processed.');
    error.statusCode = 404;
    throw error;
  }

  const group = await Group.findById(invitation.groupId);
  if (!group) {
    const error = new Error('Associated group no longer exists.');
    error.statusCode = 404;
    throw error;
  }

  // Update invitation status
  invitation.status = 'ACCEPTED';
  await invitation.save();

  // Update member status in group
  let memberFound = false;
  for (const member of group.members) {
    if (member.user.toString() === userId.toString()) {
      member.status = 'ACCEPTED';
      member.joinedAt = new Date();
      memberFound = true;
      break;
    }
  }

  // If not found in members array (defensive)
  if (!memberFound) {
    group.members.push({
      user: userId,
      role: 'member',
      status: 'ACCEPTED',
      joinedAt: new Date(),
    });
  }

  const acceptedCount = group.getAcceptedCount();
  let groupJustActivated = false;

  // Rule: When at least 3 members accept, group status becomes ACTIVE
  if (acceptedCount >= group.minMembers && group.status === 'FORMING') {
    group.status = 'ACTIVE';
    groupJustActivated = true;
    logger.info(`[Group] Group "${group.name}" (${group._id}) is now ACTIVE with ${acceptedCount} accepted members!`);
  }

  await group.save();

  // Notify group members
  const acceptingUser = await User.findById(userId);
  for (const member of group.members) {
    if (member.status === 'ACCEPTED' && member.user.toString() !== userId.toString()) {
      await createNotification({
        userId: member.user,
        type: groupJustActivated ? 'GROUP_ACTIVATED' : 'MEMBER_JOINED',
        title: groupJustActivated ? 'Community Activated!' : 'New Member Joined!',
        message: groupJustActivated
          ? `Your community "${group.name}" is now ACTIVE with ${acceptedCount} members!`
          : `${acceptingUser ? acceptingUser.name : 'A new member'} accepted their invitation to "${group.name}".`,
        relatedGroupId: group._id,
      });
    }
  }

  return {
    invitation,
    group: {
      id: group._id,
      name: group.name,
      status: group.status,
      acceptedMembersCount: acceptedCount,
    },
  };
};

const rejectInvitation = async (invitationId, userId) => {
  const invitation = await Invitation.findOne({
    _id: invitationId,
    userId,
    status: 'PENDING',
  });

  if (!invitation) {
    const error = new Error('Invitation not found or already processed.');
    error.statusCode = 404;
    throw error;
  }

  invitation.status = 'REJECTED';
  await invitation.save();

  // Update member status in group to DECLINED or remove
  const group = await Group.findById(invitation.groupId);
  if (group) {
    group.members = group.members.filter((m) => m.user.toString() !== userId.toString());
    await group.save();
    logger.info(`[Group] Member ${userId} declined invitation for group "${group.name}". Seat released.`);
  }

  return { message: 'Invitation declined successfully.' };
};

module.exports = {
  getUserInvitations,
  acceptInvitation,
  rejectInvitation,
};
