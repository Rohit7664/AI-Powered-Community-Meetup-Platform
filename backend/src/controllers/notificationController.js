const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} = require('../services/notificationService');
const { successResponse } = require('../utils/apiResponse');

const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await getUserNotifications(req.user._id, page, limit);
    return successResponse(res, 200, 'Notifications retrieved', result);
  } catch (error) {
    next(error);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await markAsRead(id, req.user._id);
    return successResponse(res, 200, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await markAllAsRead(req.user._id);
    return successResponse(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
