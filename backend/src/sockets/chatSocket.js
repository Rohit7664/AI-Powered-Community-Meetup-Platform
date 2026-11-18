const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const Group = require('../models/Group');
const Message = require('../models/Message');
const User = require('../models/User');
const logger = require('../utils/logger');

let io = null;
const onlineUsers = new Map(); // userId -> Set of socket ids

const initSocketIO = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [config.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name profileImage');
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    logger.info(`[Socket] User connected: ${socket.user.name} (${userId})`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal user notification room
    socket.join(`user_${userId}`);

    // Broadcast online status to user's communities
    io.emit('user_status', { userId, status: 'online' });

    // Join group room
    socket.on('join_group', async ({ groupId }) => {
      try {
        const group = await Group.findById(groupId);
        if (!group) return;

        // Verify membership (accepted member)
        const isMember = group.members.some(
          (m) => m.user.toString() === userId && m.status === 'ACCEPTED'
        );

        if (isMember) {
          socket.join(`group_${groupId}`);
          logger.info(`[Socket] User ${socket.user.name} joined room group_${groupId}`);
        } else {
          socket.emit('error', { message: 'Unauthorized to join this group room' });
        }
      } catch (err) {
        logger.error(`[Socket] Join group error: ${err.message}`);
      }
    });

    // Leave group room
    socket.on('leave_group', ({ groupId }) => {
      socket.leave(`group_${groupId}`);
    });

    // Send group message
    socket.on('send_message', async ({ groupId, content, messageType = 'TEXT', attachments = [] }) => {
      try {
        const group = await Group.findById(groupId);
        if (!group) return;

        const isMember = group.members.some(
          (m) => m.user.toString() === userId && m.status === 'ACCEPTED'
        );

        if (!isMember) {
          return socket.emit('error', { message: 'Only active members can send messages.' });
        }

        const message = await Message.create({
          groupId,
          senderId: userId,
          content,
          messageType,
          attachments,
        });

        const populatedMessage = await Message.findById(message._id).populate(
          'senderId',
          'name profileImage'
        );

        // Emit message to everyone in the group room
        io.to(`group_${groupId}`).emit('new_message', populatedMessage);
      } catch (err) {
        logger.error(`[Socket] Send message error: ${err.message}`);
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ groupId }) => {
      socket.to(`group_${groupId}`).emit('user_typing', {
        groupId,
        userId,
        userName: socket.user.name,
        isTyping: true,
      });
    });

    socket.on('typing_stop', ({ groupId }) => {
      socket.to(`group_${groupId}`).emit('user_typing', {
        groupId,
        userId,
        userName: socket.user.name,
        isTyping: false,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`[Socket] User disconnected: ${socket.user.name}`);
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('user_status', { userId, status: 'offline' });
        }
      }
    });
  });

  return io;
};

const getIO = () => io;

const isUserOnline = (userId) => {
  return onlineUsers.has(userId.toString()) && onlineUsers.get(userId.toString()).size > 0;
};

module.exports = {
  initSocketIO,
  getIO,
  isUserOnline,
};
