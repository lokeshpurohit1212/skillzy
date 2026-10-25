const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  swapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Swap',
    default: null
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
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
    min: 15,
    max: 240,
    default: 60
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled',
    index: true
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  attendance: {
    organizerJoined: { type: Boolean, default: false },
    participantJoined: { type: Boolean, default: false },
    actualDuration: { type: Number, default: 0 }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  agenda: [{
    topic: String,
    duration: String,
    completed: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Compound index for detecting overlapping scheduled sessions
sessionSchema.index({ organizer: 1, scheduledAt: 1, status: 1 });
sessionSchema.index({ participant: 1, scheduledAt: 1, status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
