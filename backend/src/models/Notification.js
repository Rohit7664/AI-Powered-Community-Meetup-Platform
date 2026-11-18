const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'NEW_INVITATION',
        'INVITATION_ACCEPTED',
        'INVITATION_REJECTED',
        'MEMBER_JOINED',
        'GROUP_CREATED',
        'GROUP_ACTIVATED',
        'NEW_MESSAGE',
        'NEW_ACTIVITY',
        'MEETUP_REMINDER',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
    },
    relatedInvitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invitation',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
