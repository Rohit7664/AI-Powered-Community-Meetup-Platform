const Activity = require('../models/Activity');
const Group = require('../models/Group');
const { calculateDistanceKm } = require('../utils/distance');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getGroupActivities = async (req, res, next) => {
  try {
    const { id: groupId } = req.params;
    const activities = await Activity.find({ groupId })
      .populate('createdBy', 'name profileImage')
      .populate('participants.user', 'name profileImage')
      .sort({ date: 1, time: 1 });

    return successResponse(res, 200, 'Group activities retrieved', activities);
  } catch (error) {
    next(error);
  }
};

const createActivity = async (req, res, next) => {
  try {
    const { id: groupId } = req.params;
    const { title, description, activityType, date, time, location, maxParticipants } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return errorResponse(res, 404, 'Group not found');
    }

    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString() && m.status === 'ACCEPTED'
    );
    if (!isMember) {
      return errorResponse(res, 403, 'Only accepted members can plan activities.');
    }

    const activity = await Activity.create({
      groupId,
      title,
      description,
      activityType: activityType || 'Meetup',
      date,
      time,
      location: location || { address: '', coordinates: [77.2090, 28.6139] },
      maxParticipants: maxParticipants || 10,
      participants: [{ user: req.user._id, joinedAt: new Date() }],
      createdBy: req.user._id,
    });

    const populated = await Activity.findById(activity._id)
      .populate('createdBy', 'name profileImage')
      .populate('participants.user', 'name profileImage');

    return successResponse(res, 201, 'Activity created successfully', populated);
  } catch (error) {
    next(error);
  }
};

const joinActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id);
    if (!activity) {
      return errorResponse(res, 404, 'Activity not found');
    }

    const alreadyJoined = activity.participants.some(
      (p) => p.user.toString() === req.user._id.toString()
    );
    if (alreadyJoined) {
      return errorResponse(res, 400, 'You have already joined this activity.');
    }

    if (activity.participants.length >= activity.maxParticipants) {
      return errorResponse(res, 400, 'This activity has reached maximum capacity.');
    }

    activity.participants.push({ user: req.user._id, joinedAt: new Date() });
    await activity.save();

    const populated = await Activity.findById(id)
      .populate('createdBy', 'name profileImage')
      .populate('participants.user', 'name profileImage');

    return successResponse(res, 200, 'Joined activity successfully', populated);
  } catch (error) {
    next(error);
  }
};

const leaveActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id);
    if (!activity) {
      return errorResponse(res, 404, 'Activity not found');
    }

    activity.participants = activity.participants.filter(
      (p) => p.user.toString() !== req.user._id.toString()
    );
    await activity.save();

    return successResponse(res, 200, 'Left activity successfully');
  } catch (error) {
    next(error);
  }
};

const getNearbyActivities = async (req, res, next) => {
  try {
    const user = req.user;
    const userCoords = user.location?.coordinates || [77.2090, 28.6139];
    const maxDistanceKm = req.query.radius ? parseFloat(req.query.radius) : 25;

    const activities = await Activity.find({ status: 'UPCOMING' })
      .populate('groupId', 'name image interests')
      .populate('createdBy', 'name profileImage')
      .populate('participants.user', 'name profileImage');

    const enriched = activities
      .map((act) => {
        const coords = act.location?.coordinates;
        let distanceKm = null;
        if (coords && coords.length === 2) {
          distanceKm = calculateDistanceKm(userCoords[1], userCoords[0], coords[1], coords[0]);
        }
        return {
          ...act.toObject(),
          distanceKm,
        };
      })
      .filter((act) => act.distanceKm === null || act.distanceKm <= maxDistanceKm)
      .sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));

    return successResponse(res, 200, 'Nearby activities retrieved', enriched);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGroupActivities,
  createActivity,
  joinActivity,
  leaveActivity,
  getNearbyActivities,
};
