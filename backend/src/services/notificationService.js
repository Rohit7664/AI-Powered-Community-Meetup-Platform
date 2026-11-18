const Notification = require('../models/Notification');
const { getIO } = require('../sockets/chatSocket');
const logger = require('../utils/logger');

const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedGroupId = null,
  relatedInvitationId = null,
}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedGroupId,
      relatedInvitationId,
    });

    // Send real-time notification via Socket.IO if user is connected
    try {
      const io = getIO();
      if (io) {
        io.to(`user_${userId.toString()}`).emit('notification', {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          relatedGroupId: notification.relatedGroupId,
          relatedInvitationId: notification.relatedInvitationId,
          createdAt: notification.createdAt,
          isRead: false,
        });
      }
    } catch (socketErr) {
      // Socket might not be initialized in test environment
      logger.debug(`[NotificationService] Socket emission skipped: ${socketErr.message}`);
    }

    return notification;
  } catch (error) {
    logger.error(`[NotificationService] Error creating notification: ${error.message}`);
    throw error;
  }
};

const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId })
      .populate('relatedGroupId', 'name image status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ userId }),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
};

const markAllAsRead = async (userId) => {
  return Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
