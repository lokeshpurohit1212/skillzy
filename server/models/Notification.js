const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'swap_request',
      'swap_accepted',
      'swap_rejected',
      'swap_cancelled',
      'swap_completed',
      'new_message',
      'new_review',
      'session_scheduled',
      'session_cancelled',
      'session_reminder',
      'roadmap_milestone',
      'community_event',
      'achievement_unlocked'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  swap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Swap'
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
