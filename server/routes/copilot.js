const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Roadmap = require('../models/Roadmap');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { generateRoadmap, generateSessionPreparation } = require('../services/aiService');
const { awardXP, awardBadge } = require('../services/achievementService');

const router = express.Router();

/**
 * POST /api/copilot/roadmap
 * Generates an editable, personalized learning roadmap
 */
router.post('/roadmap', auth, [
  body('skillName').trim().notEmpty().withMessage('Skill name is required'),
  body('currentProficiency').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('targetProficiency').optional().isIn(['Intermediate', 'Advanced', 'Expert']),
  body('weeklyCommitmentHours').optional().isInt({ min: 1, max: 40 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      skillName,
      currentProficiency = 'Beginner',
      targetProficiency = 'Advanced',
      weeklyCommitmentHours = 5,
      targetDate = null,
      learningStyle = 'hands-on'
    } = req.body;

    const roadmapData = await generateRoadmap({
      skillName,
      currentProficiency,
      targetProficiency,
      weeklyCommitmentHours,
      targetDate,
      learningStyle
    });

    const savedRoadmap = await Roadmap.create({
      user: req.user._id,
      ...roadmapData
    });

    // Award XP for creating learning plan
    await awardXP(req.user._id, 20, 'Created learning roadmap');

    AnalyticsEvent.create({
      eventType: 'roadmap_generated',
      user: req.user._id,
      metadata: { skillName, milestonesCount: savedRoadmap.milestones.length }
    }).catch(() => {});

    res.status(201).json({
      success: true,
      roadmap: savedRoadmap
    });
  } catch (err) {
    console.error('Roadmap creation error:', err);
    res.status(500).json({ message: 'Server error generating roadmap' });
  }
});

/**
 * GET /api/copilot/roadmaps
 * Get authenticated user's roadmaps
 */
router.get('/roadmaps', auth, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(roadmaps);
  } catch (err) {
    console.error('Get roadmaps error:', err);
    res.status(500).json({ message: 'Server error fetching roadmaps' });
  }
});

/**
 * GET /api/copilot/roadmaps/:id
 * Get single roadmap
 */
router.get('/roadmaps/:id', auth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    res.json(roadmap);
  } catch (err) {
    console.error('Get roadmap error:', err);
    res.status(500).json({ message: 'Server error fetching roadmap' });
  }
});

/**
 * PUT /api/copilot/roadmaps/:id/milestone/:milestoneId
 * Toggle or mark a milestone completed
 */
router.put('/roadmaps/:id/milestone/:milestoneId', auth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    const milestone = roadmap.milestones.find(m => m.id === req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    const wasCompleted = milestone.completed;
    milestone.completed = req.body.completed !== undefined ? req.body.completed : !milestone.completed;
    milestone.completedAt = milestone.completed ? new Date() : null;

    // Recalculate progress percentage
    const completedCount = roadmap.milestones.filter(m => m.completed).length;
    roadmap.progressPercentage = Math.round((completedCount / roadmap.milestones.length) * 100);

    if (roadmap.progressPercentage === 100) {
      roadmap.status = 'completed';
    } else {
      roadmap.status = 'active';
    }

    await roadmap.save();

    // If milestone was newly completed, award XP and check badges
    let xpResult = null;
    let badgeResult = null;
    if (!wasCompleted && milestone.completed) {
      xpResult = await awardXP(req.user._id, 35, 'Completed roadmap milestone');
      badgeResult = await awardBadge(req.user._id, 'milestone_master');

      AnalyticsEvent.create({
        eventType: 'milestone_completed',
        user: req.user._id,
        metadata: { roadmapId: roadmap._id, milestoneId: milestone.id }
      }).catch(() => {});
    }

    res.json({
      success: true,
      roadmap,
      progressPercentage: roadmap.progressPercentage,
      xpResult,
      badgeResult
    });
  } catch (err) {
    console.error('Milestone update error:', err);
    res.status(500).json({ message: 'Server error updating milestone' });
  }
});

/**
 * POST /api/copilot/session-prep
 * Generates an agenda, questions, and practice tasks for a live session
 */
router.post('/session-prep', auth, [
  body('skillTopic').trim().notEmpty().withMessage('Skill topic is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skillTopic, durationMinutes = 60, learnerLevel = 'Beginner', learningGoal = '' } = req.body;

    const prep = await generateSessionPreparation({
      skillTopic,
      durationMinutes,
      learnerLevel,
      learningGoal
    });

    res.json({
      success: true,
      ...prep
    });
  } catch (err) {
    console.error('Session prep error:', err);
    res.status(500).json({ message: 'Server error generating session preparation' });
  }
});

module.exports = router;
