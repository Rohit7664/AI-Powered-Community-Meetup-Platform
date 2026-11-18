const {
  getUserInvitations,
  acceptInvitation,
  rejectInvitation,
} = require('../services/invitationService');
const { successResponse } = require('../utils/apiResponse');

const getInvitations = async (req, res, next) => {
  try {
    const invitations = await getUserInvitations(req.user._id);
    return successResponse(res, 200, 'Invitations retrieved successfully', invitations);
  } catch (error) {
    next(error);
  }
};

const accept = async (req, res, next) => {
  try {
    const result = await acceptInvitation(req.params.id, req.user._id);
    return successResponse(res, 200, 'Invitation accepted! Welcome to the group.', result);
  } catch (error) {
    next(error);
  }
};

const reject = async (req, res, next) => {
  try {
    const result = await rejectInvitation(req.params.id, req.user._id);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvitations,
  accept,
  reject,
};
