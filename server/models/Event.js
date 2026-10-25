const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  skillTopic: {
    type: String,
    required: true,
    trim: true
  },
  scheduledAt: {
    type: Date,
    required: true,
    index: true
  },
  durationMinutes: {
    type: Number,
    required: true,
    default: 60,
    min: 15,
    max: 300
  },
  maxAttendees: {
    type: Number,
    required: true,
    default: 50,
    min: 2,
    max: 500
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    }
  }],
  roomId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
