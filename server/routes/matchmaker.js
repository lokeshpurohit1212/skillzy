const express = require('express');
const auth = require('../middleware/auth');
const { getRankedRecommendations } = require('../services/matchmakerService');
const AnalyticsEvent = require('../models/AnalyticsEvent');

const router = express.Router();

/**
 * GET /api/matchmaker/recommendations
 * Generates ranked partner recommendations with multi-factor compatibility scores and explainable breakdown
 */
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { minScore, skillFilter, sortBy, limit } = req.query;

    const recommendations = await getRankedRecommendations(req.user._id, {
      minScore: minScore ? parseInt(minScore, 10) : 10,
      skillFilter: skillFilter || null,
      sortBy: sortBy || 'score',
      limit: limit ? parseInt(limit, 10) : 25
    });

    // Asynchronously log analytics event without delaying response
    AnalyticsEvent.create({
      eventType: 'match_viewed',
      user: req.user._id,
      metadata: { count: recommendations.length, filter: skillFilter || 'none' }
    }).catch(() => {});

    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (err) {
    console.error('Matchmaker recommendations error:', err);
    res.status(500).json({ message: err.message || 'Server error generating recommendations' });
  }
});

module.exports = router;
