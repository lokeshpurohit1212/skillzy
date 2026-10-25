const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { BADGES_CATALOG, calculateLevel, getLeaderboard } = require('../services/achievementService');

const router = express.Router();

/**
 * GET /api/gamification/me
 * User's gamification stats, XP, level, badges, and streaks
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('name xp level streak badges swapsCompleted membership');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    const nextLevelXP = Math.pow(currentLevel, 2) * 100;
    const prevLevelXP = Math.pow(currentLevel - 1, 2) * 100;
    const progressInLevel = Math.max(0, currentXP - prevLevelXP);
    const neededForLevel = Math.max(1, nextLevelXP - prevLevelXP);
    const progressPercent = Math.min(100, Math.round((progressInLevel / neededForLevel) * 100));

    res.json({
      xp: currentXP,
      level: currentLevel,
      streak: user.streak?.count || 0,
      lastActive: user.streak?.lastActive,
      nextLevelXP,
      progressPercent,
      badges: user.badges || [],
      swapsCompleted: user.swapsCompleted || 0,
      membership: user.membership || 'free'
    });
  } catch (err) {
    console.error('Get gamification stats error:', err);
    res.status(500).json({ message: 'Server error fetching gamification stats' });
  }
});

/**
 * GET /api/gamification/leaderboard
 * Platform-wide reputation and XP leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 25 } = req.query;
    const leaderboard = await getLeaderboard(parseInt(limit, 10));
    res.json(leaderboard);
  } catch (err) {
    console.error('Get leaderboard error:', err);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

/**
 * GET /api/gamification/badges
 * Catalog of all badges and user's unlocked status
 */
router.get('/badges', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('badges');
    const userBadgeIds = new Set((user?.badges || []).map(b => b.id));

    const catalogWithStatus = Object.values(BADGES_CATALOG).map(badge => ({
      ...badge,
      unlocked: userBadgeIds.has(badge.id),
      unlockedAt: (user?.badges || []).find(b => b.id === badge.id)?.awardedAt || null
    }));

    res.json(catalogWithStatus);
  } catch (err) {
    console.error('Get badges catalog error:', err);
    res.status(500).json({ message: 'Server error fetching badges' });
  }
});

module.exports = router;
