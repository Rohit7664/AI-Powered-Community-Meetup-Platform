const Message = require('../models/Message');
const Group = require('../models/Group');
const { getIO } = require('../sockets/chatSocket');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getGroupMessages = async (req, res, next) => {
  try {
    const { id: groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const group = await Group.findById(groupId);
    if (!group) {
      return errorResponse(res, 404, 'Group not found');
    }

    // Verify user is an accepted member
    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString() && m.status === 'ACCEPTED'
    );
    if (!isMember) {
      return errorResponse(res, 403, 'Access denied. You must be an accepted member of this group.');
    }

    const skip = (page - 1) * limit;
    const messages = await Message.find({ groupId })
      .populate('senderId', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Return in chronological order
    return successResponse(res, 200, 'Messages retrieved', messages.reverse());
  } catch (error) {
    next(error);
  }
};

const sendGroupMessage = async (req, res, next) => {
  try {
    const { id: groupId } = req.params;
    const { content, messageType = 'TEXT', attachments = [] } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return errorResponse(res, 404, 'Group not found');
    }

    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString() && m.status === 'ACCEPTED'
    );
    if (!isMember) {
      return errorResponse(res, 403, 'Only accepted members can send messages.');
    }

    const message = await Message.create({
      groupId,
      senderId: req.user._id,
      content,
      messageType,
      attachments,
    });

    const populated = await Message.findById(message._id).populate('senderId', 'name profileImage');

    // Emit via Socket.IO
    try {
      const io = getIO();
      if (io) {
        io.to(`group_${groupId}`).emit('new_message', populated);
      }
    } catch (err) {
      // Non-critical socket error
    }

    return successResponse(res, 201, 'Message sent successfully', populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGroupMessages,
  sendGroupMessage,
};
