const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markNotificationAsRead);
router.put('/read-all', notificationController.markAllNotificationsAsRead);

module.exports = router;
