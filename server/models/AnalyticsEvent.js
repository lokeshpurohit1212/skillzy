const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      'profile_completed',
      'skill_added',
      'match_viewed',
      'swap_requested',
      'swap_completed',
      'session_booked',
      'session_attended',
      'roadmap_generated',
      'milestone_completed',
      'community_joined',
      'event_registered',
      'payment_completed'
    ],
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// TTL index to automatically purge privacy-conscious analytics events after 180 days
analyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
