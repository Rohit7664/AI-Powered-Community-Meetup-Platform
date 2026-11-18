const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const interestRoutes = require('./interestRoutes');
const groupRoutes = require('./groupRoutes');
const invitationRoutes = require('./invitationRoutes');
const messageRoutes = require('./messageRoutes');
const activityRoutes = require('./activityRoutes');
const notificationRoutes = require('./notificationRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/interests', interestRoutes);
router.use('/groups', groupRoutes);
router.use('/invitations', invitationRoutes);
router.use('/groups', messageRoutes); // /groups/:id/messages
router.use('/activities', activityRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'InterestHub API',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
