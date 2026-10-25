const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Swap = require('../models/Swap');
const Session = require('../models/Session');
const Roadmap = require('../models/Roadmap');
const Community = require('../models/Community');
const AnalyticsEvent = require('../models/AnalyticsEvent');

const router = express.Router();

/**
 * GET /api/analytics/overview
 * Platform usage telemetry overview
 */
router.get('/overview', auth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalSwaps,
      completedSwaps,
      totalSessions,
      totalRoadmaps,
      totalCommunities
    ] = await Promise.all([
      User.countDocuments({ isPublic: true }),
      Swap.countDocuments(),
      Swap.countDocuments({ status: 'completed' }),
      Session.countDocuments(),
      Roadmap.countDocuments(),
      Community.countDocuments()
    ]);

    res.json({
      totalUsers,
      totalSwaps,
      completedSwaps,
      totalSessions,
      totalRoadmaps,
      totalCommunities,
      completionRate: totalSwaps > 0 ? Math.round((completedSwaps / totalSwaps) * 100) : 0
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

/**
 * GET /api/analytics/user
 * Personalized learning journey telemetry
 */
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      user,
      swapsAsRequester,
      swapsAsRecipient,
      sessions,
      roadmaps
    ] = await Promise.all([
      User.findById(userId).select('xp level streak swapsCompleted timeCredits membership ratings'),
      Swap.countDocuments({ requester: userId, status: 'completed' }),
      Swap.countDocuments({ recipient: userId, status: 'completed' }),
      Session.countDocuments({ $or: [{ organizer: userId }, { participant: userId }], status: 'completed' }),
      Roadmap.find({ user: userId }).select('skillName progressPercentage status')
    ]);

    res.json({
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak?.count || 0,
      timeCredits: user.timeCredits || 0,
      membership: user.membership || 'free',
      swapsLearned: swapsAsRequester,
      swapsTaught: swapsAsRecipient,
      sessionsAttended: sessions,
      activeRoadmaps: roadmaps.length,
      roadmapsSummary: roadmaps
    });
  } catch (err) {
    console.error('User analytics error:', err);
    res.status(500).json({ message: 'Server error fetching user metrics' });
  }
});

/**
 * POST /api/analytics/event
 * Log non-sensitive telemetry event
 */
router.post('/event', auth, async (req, res) => {
  try {
    const { eventType, metadata } = req.body;
    if (!eventType) {
      return res.status(400).json({ message: 'Event type required' });
    }
    const event = await AnalyticsEvent.create({
      eventType,
      user: req.user._id,
      metadata: metadata || {}
    });
    res.status(201).json({ success: true, eventId: event._id });
  } catch (err) {
    console.error('Track event error:', err);
    res.status(500).json({ message: 'Server error tracking event' });
  }
});

module.exports = router;
