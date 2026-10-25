/**
 * Skillzy 2.0 Gamification & Reputation Service
 * Manages XP awards, level progression, streaks, and anti-abuse badge grants.
 */

const User = require('../models/User');

const BADGES_CATALOG = {
  first_skill: {
    id: 'first_skill',
    name: 'First Skill Shared',
    icon: 'sparkles',
    description: 'Added your first teaching skill to your public profile.'
  },
  knowledge_explorer: {
    id: 'knowledge_explorer',
    name: 'Knowledge Explorer',
    icon: 'compass',
    description: 'Expanded your catalogue with 3 or more teaching/learning skills.'
  },
  first_swap: {
    id: 'first_swap',
    name: 'First Exchange Completed',
    icon: 'repeat',
    description: 'Successfully completed your first verified peer skill swap.'
  },
  five_swaps: {
    id: 'five_swaps',
    name: 'Five Star Swapper',
    icon: 'award',
    description: 'Completed 5 verified skill exchanges on Skillzy.'
  },
  consistent_mentor: {
    id: 'consistent_mentor',
    name: 'Consistent Mentor',
    icon: 'shield',
    description: 'Completed 3 exchanges as the teaching mentor.'
  },
  community_helper: {
    id: 'community_helper',
    name: 'Community Champion',
    icon: 'star',
    description: 'Received a 5-star review from a learning partner.'
  },
  milestone_master: {
    id: 'milestone_master',
    name: 'Milestone Master',
    icon: 'check-circle',
    description: 'Completed a milestone in a personalized learning roadmap.'
  }
};

/**
 * Calculates user level based on total XP
 * Quadratic progression: 100 XP -> Lv 2, 400 XP -> Lv 3, 900 XP -> Lv 4, etc.
 */
function calculateLevel(xp) {
  if (!xp || xp <= 0) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Trusted backend method to award XP and check for level ups & badges
 */
async function awardXP(userId, amount, reason = '') {
  if (!amount || amount <= 0) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const oldLevel = user.level || 1;
  const newXP = (user.xp || 0) + amount;
  const newLevel = calculateLevel(newXP);

  user.xp = newXP;
  user.level = newLevel;

  // Streak update logic
  const now = new Date();
  const lastActive = user.streak?.lastActive ? new Date(user.streak.lastActive) : null;

  if (!lastActive) {
    user.streak = { count: 1, lastActive: now };
  } else {
    const diffHours = (now - lastActive) / (1000 * 60 * 60);
    if (diffHours >= 20 && diffHours <= 48) {
      // Continued streak on next day
      user.streak.count = (user.streak.count || 0) + 1;
      user.streak.lastActive = now;
    } else if (diffHours > 48) {
      // Streak broken
      user.streak.count = 1;
      user.streak.lastActive = now;
    }
  }

  await user.save();

  return {
    xpAwarded: amount,
    totalXP: newXP,
    level: newLevel,
    leveledUp: newLevel > oldLevel,
    streak: user.streak?.count || 1
  };
}

/**
 * Check and award badges with deduplication
 */
async function awardBadge(userId, badgeId) {
  const badgeDef = BADGES_CATALOG[badgeId];
  if (!badgeDef) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const existingBadge = (user.badges || []).find(b => b.id === badgeId);
  if (existingBadge) return null; // Already awarded

  user.badges.push({
    id: badgeDef.id,
    name: badgeDef.name,
    icon: badgeDef.icon,
    description: badgeDef.description,
    awardedAt: new Date()
  });

  // Award bonus XP for badge unlock
  user.xp = (user.xp || 0) + 50;
  user.level = calculateLevel(user.xp);

  await user.save();

  return badgeDef;
}

/**
 * Get platform-wide gamification leaderboard
 */
async function getLeaderboard(limit = 20) {
  const topUsers = await User.find({ isPublic: true })
    .select('name profilePhoto xp level streak swapsCompleted ratings membership')
    .sort({ xp: -1, swapsCompleted: -1 })
    .limit(limit);

  return topUsers.map((u, index) => ({
    rank: index + 1,
    _id: u._id,
    name: u.name,
    profilePhoto: u.profilePhoto,
    xp: u.xp || 0,
    level: u.level || 1,
    streak: u.streak?.count || 0,
    swapsCompleted: u.swapsCompleted || 0,
    ratingAverage: u.ratingAverage || 0,
    membership: u.membership || 'free'
  }));
}

module.exports = {
  BADGES_CATALOG,
  calculateLevel,
  awardXP,
  awardBadge,
  getLeaderboard
};
