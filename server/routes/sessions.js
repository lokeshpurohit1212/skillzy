const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Session = require('../models/Session');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { createUniqueRoomId, generateRoomToken, isLiveKitConfigured } = require('../services/videoService');
const { awardXP } = require('../services/achievementService');

const router = express.Router();

// Helper to safely send notification
async function notify(data) {
  try {
    const payload = {
      ...data,
      user: data.user || data.recipient
    };
    await Notification.create(payload);
  } catch (e) {
    console.error('Notification creation error:', e.message);
  }
}

/**
 * POST /api/sessions/book
 * Books a scheduled live session with overlap conflict prevention
 */
router.post('/book', auth, [
  body('participantId').isMongoId().withMessage('Valid participant ID is required'),
  body('skillTopic').trim().notEmpty().withMessage('Skill topic is required'),
  body('scheduledAt').isISO8601().withMessage('Valid scheduled date/time is required'),
  body('durationMinutes').optional().isInt({ min: 15, max: 240 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { participantId, skillTopic, scheduledAt, durationMinutes = 60, swapId, notes } = req.body;
    const organizerId = req.user._id;

    if (organizerId.toString() === participantId) {
      return res.status(400).json({ message: 'Cannot schedule a session with yourself' });
    }

    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    const startTime = new Date(scheduledAt);
    if (startTime <= new Date()) {
      return res.status(400).json({ message: 'Session start time must be in the future' });
    }

    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    // Conflict Prevention: Check overlapping sessions for organizer
    const organizerConflict = await Session.findOne({
      $or: [{ organizer: organizerId }, { participant: organizerId }],
      status: { $in: ['scheduled', 'in_progress', 'rescheduled'] },
      scheduledAt: {
        $lt: endTime,
        $gt: new Date(startTime.getTime() - 240 * 60 * 1000)
      }
    });

    if (organizerConflict) {
      const conflictEnd = new Date(organizerConflict.scheduledAt.getTime() + organizerConflict.durationMinutes * 60 * 1000);
      if (startTime < conflictEnd && endTime > organizerConflict.scheduledAt) {
        return res.status(409).json({ message: 'You have a conflicting confirmed session at this time' });
      }
    }

    // Conflict Prevention: Check overlapping sessions for participant
    const participantConflict = await Session.findOne({
      $or: [{ organizer: participantId }, { participant: participantId }],
      status: { $in: ['scheduled', 'in_progress', 'rescheduled'] },
      scheduledAt: {
        $lt: endTime,
        $gt: new Date(startTime.getTime() - 240 * 60 * 1000)
      }
    });

    if (participantConflict) {
      const conflictEnd = new Date(participantConflict.scheduledAt.getTime() + participantConflict.durationMinutes * 60 * 1000);
      if (startTime < conflictEnd && endTime > participantConflict.scheduledAt) {
        return res.status(409).json({ message: 'The partner has another scheduled session at this time' });
      }
    }

    const roomId = createUniqueRoomId('classroom');

    const session = await Session.create({
      swapId: swapId || null,
      organizer: organizerId,
      participant: participantId,
      skillTopic,
      scheduledAt: startTime,
      durationMinutes,
      status: 'scheduled',
      roomId,
      notes: notes || ''
    });

    // Notify participant
    await notify({
      recipient: participantId,
      sender: organizerId,
      type: 'session_scheduled',
      title: 'New Live Session Scheduled',
      message: `${req.user.name} scheduled a "${skillTopic}" session with you for ${startTime.toLocaleString()}`,
      metadata: { sessionId: session._id, roomId }
    });

    // Log analytics
    AnalyticsEvent.create({
      eventType: 'session_booked',
      user: organizerId,
      metadata: { sessionId: session._id, durationMinutes, skillTopic }
    }).catch(() => {});

    res.status(201).json({
      success: true,
      session
    });
  } catch (err) {
    console.error('Book session error:', err);
    res.status(500).json({ message: 'Server error scheduling session' });
  }
});

/**
 * GET /api/sessions
 * Returns user's sessions (upcoming and past)
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const sessions = await Session.find({
      $or: [{ organizer: userId }, { participant: userId }]
    })
      .populate('organizer', 'name profilePhoto email location')
      .populate('participant', 'name profilePhoto email location')
      .sort({ scheduledAt: 1 });

    res.json(sessions);
  } catch (err) {
    console.error('Get sessions error:', err);
    res.status(500).json({ message: 'Server error fetching sessions' });
  }
});

/**
 * GET /api/sessions/:id
 * Get single session details
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('organizer', 'name profilePhoto email location')
      .populate('participant', 'name profilePhoto email location');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const isMember = session.organizer._id.toString() === req.user._id.toString() ||
                     session.participant._id.toString() === req.user._id.toString();

    if (!isMember && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to view this session' });
    }

    res.json(session);
  } catch (err) {
    console.error('Get session details error:', err);
    res.status(500).json({ message: 'Server error fetching session' });
  }
});

/**
 * POST /api/sessions/:id/token
 * Issues cryptographically signed room access token for virtual classroom entry
 */
router.post('/:id/token', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const tokenData = generateRoomToken(req.user, session);

    // Update attendance record
    if (session.organizer.toString() === req.user._id.toString()) {
      session.attendance.organizerJoined = true;
    } else {
      session.attendance.participantJoined = true;
    }
    if (session.status === 'scheduled') {
      session.status = 'in_progress';
    }
    await session.save();

    res.json({
      success: true,
      ...tokenData,
      liveKitConfigured: isLiveKitConfigured()
    });
  } catch (err) {
    console.error('Generate room token error:', err);
    res.status(403).json({ message: err.message || 'Failed to generate room token' });
  }
});

/**
 * PUT /api/sessions/:id/cancel
 * Cancels a scheduled session
 */
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const isMember = session.organizer.toString() === req.user._id.toString() ||
                     session.participant.toString() === req.user._id.toString();

    if (!isMember) {
      return res.status(403).json({ message: 'Unauthorized to cancel this session' });
    }

    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({ message: `Session is already ${session.status}` });
    }

    const reason = req.body.reason || 'Cancelled by participant';
    session.status = 'cancelled';
    session.cancellationReason = reason;
    await session.save();

    const otherUser = session.organizer.toString() === req.user._id.toString()
      ? session.participant
      : session.organizer;

    await notify({
      recipient: otherUser,
      sender: req.user._id,
      type: 'session_cancelled',
      title: 'Session Cancelled',
      message: `${req.user.name} cancelled the scheduled session for "${session.skillTopic}". Reason: ${reason}`
    });

    res.json({ success: true, message: 'Session cancelled successfully', session });
  } catch (err) {
    console.error('Cancel session error:', err);
    res.status(500).json({ message: 'Server error cancelling session' });
  }
});

/**
 * PUT /api/sessions/:id/complete
 * Marks a session as completed and awards XP
 */
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const isMember = session.organizer.toString() === req.user._id.toString() ||
                     session.participant.toString() === req.user._id.toString();

    if (!isMember) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    session.status = 'completed';
    session.attendance.actualDuration = req.body.actualDuration || session.durationMinutes;
    await session.save();

    // Award XP to both participants for live learning engagement
    await awardXP(session.organizer, 30, 'Hosted live session');
    await awardXP(session.participant, 30, 'Attended live session');

    res.json({ success: true, message: 'Session marked completed', session });
  } catch (err) {
    console.error('Complete session error:', err);
    res.status(500).json({ message: 'Server error completing session' });
  }
});

module.exports = router;
