const Group = require('../models/Group');
const { getRecommendedGroups, getGroupDetails, leaveGroup } = require('../services/groupService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getAllGroups = async (req, res, next) => {
  try {
    const { category, type, search, status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['ACTIVE', 'FORMING'] };
    }

    if (type) {
      query.groupType = type.toUpperCase();
    }

    if (category) {
      query.interests = { $in: [category] };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { interests: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const groups = await Group.find(query)
      .populate('members.user', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(50);

    const formatted = groups.map((g) => ({
      ...g.toObject(),
      acceptedCount: g.getAcceptedCount(),
      reservedCount: g.getReservedCount(),
    }));

    return successResponse(res, 200, 'Groups retrieved successfully', formatted);
  } catch (error) {
    next(error);
  }
};

const getMyGroups = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({
      'members.user': userId,
      'members.status': 'ACCEPTED',
    })
      .populate('members.user', 'name profileImage')
      .sort({ updatedAt: -1 });

    const formatted = groups.map((g) => ({
      ...g.toObject(),
      acceptedCount: g.getAcceptedCount(),
      reservedCount: g.getReservedCount(),
    }));

    return successResponse(res, 200, 'User communities retrieved', formatted);
  } catch (error) {
    next(error);
  }
};

const getRecommended = async (req, res, next) => {
  try {
    const recommended = await getRecommendedGroups(req.user);
    return successResponse(res, 200, 'Recommended communities retrieved', recommended);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const details = await getGroupDetails(req.params.id, req.user._id);
    return successResponse(res, 200, 'Group details retrieved', details);
  } catch (error) {
    next(error);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).populate(
      'members.user',
      'name email profileImage bio city interests'
    );
    if (!group) {
      return errorResponse(res, 404, 'Group not found');
    }
    return successResponse(res, 200, 'Group members retrieved', group.members);
  } catch (error) {
    next(error);
  }
};

const leave = async (req, res, next) => {
  try {
    const result = await leaveGroup(req.params.id, req.user._id);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllGroups,
  getMyGroups,
  getRecommended,
  getById,
  getMembers,
  leave,
};
