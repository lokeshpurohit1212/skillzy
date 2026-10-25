const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Community = require('../models/Community');
const Event = require('../models/Event');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { createUniqueRoomId } = require('../services/videoService');
const { awardXP } = require('../services/achievementService');

const router = express.Router();

/**
 * GET /api/communities
 * Lists communities with category filter
 */
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { isPrivate: false };

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const communities = await Community.find(query)
      .populate('founder', 'name profilePhoto')
      .sort({ createdAt: -1 });

    const withCounts = communities.map(c => ({
      ...c.toObject(),
      memberCount: c.members?.length || 0,
      discussionCount: c.discussions?.length || 0
    }));

    res.json(withCounts);
  } catch (err) {
    console.error('List communities error:', err);
    res.status(500).json({ message: 'Server error fetching communities' });
  }
});

/**
 * POST /api/communities
 * Create a new skill community
 */
router.post('/', auth, [
  body('name').trim().isLength({ min: 3, max: 100 }),
  body('description').trim().isLength({ min: 10, max: 1000 }),
  body('category').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, rules = [] } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Community.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return res.status(400).json({ message: 'A community with this name already exists' });
    }

    const community = await Community.create({
      name,
      slug,
      description,
      category,
      rules,
      founder: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    await awardXP(req.user._id, 40, 'Founded skill community');

    res.status(201).json({ success: true, community });
  } catch (err) {
    console.error('Create community error:', err);
    res.status(500).json({ message: 'Server error creating community' });
  }
});

/**
 * GET /api/communities/:id
 * Get community details with discussions
 */
router.get('/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('founder', 'name profilePhoto')
      .populate('members.user', 'name profilePhoto')
      .populate('discussions.author', 'name profilePhoto')
      .populate('discussions.replies.author', 'name profilePhoto');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json(community);
  } catch (err) {
    console.error('Get community error:', err);
    res.status(500).json({ message: 'Server error fetching community' });
  }
});

/**
 * POST /api/communities/:id/join
 * Join a community
 */
router.post('/:id/join', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const isMember = (community.members || []).some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this community' });
    }

    community.members.push({ user: req.user._id, role: 'member' });
    await community.save();

    await awardXP(req.user._id, 15, 'Joined skill community');

    AnalyticsEvent.create({
      eventType: 'community_joined',
      user: req.user._id,
      metadata: { communityId: community._id, name: community.name }
    }).catch(() => {});

    res.json({ success: true, message: 'Successfully joined community', community });
  } catch (err) {
    console.error('Join community error:', err);
    res.status(500).json({ message: 'Server error joining community' });
  }
});

/**
 * POST /api/communities/:id/discussions
 * Post a discussion topic
 */
router.post('/:id/discussions', auth, [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('content').trim().isLength({ min: 5, max: 2000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    community.discussions.unshift({
      author: req.user._id,
      title: req.body.title,
      content: req.body.content,
      replies: []
    });

    await community.save();
    await awardXP(req.user._id, 10, 'Started community discussion');

    res.status(201).json({ success: true, discussions: community.discussions });
  } catch (err) {
    console.error('Create discussion error:', err);
    res.status(500).json({ message: 'Server error posting discussion' });
  }
});

/**
 * GET /api/communities/:id/events
 * Get events for a community
 */
router.get('/:id/events', async (req, res) => {
  try {
    const events = await Event.find({ community: req.params.id })
      .populate('host', 'name profilePhoto')
      .sort({ scheduledAt: 1 });

    res.json(events);
  } catch (err) {
    console.error('Get community events error:', err);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

/**
 * POST /api/communities/:id/events
 * Create a workshop/event in the community
 */
router.post('/:id/events', auth, [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('skillTopic').trim().notEmpty(),
  body('scheduledAt').isISO8601(),
  body('maxAttendees').optional().isInt({ min: 2, max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const { title, description, skillTopic, scheduledAt, durationMinutes = 60, maxAttendees = 50 } = req.body;
    const roomId = createUniqueRoomId('workshop');

    const event = await Event.create({
      community: community._id,
      host: req.user._id,
      title,
      description,
      skillTopic,
      scheduledAt: new Date(scheduledAt),
      durationMinutes,
      maxAttendees,
      roomId,
      attendees: [{ user: req.user._id, attended: false }]
    });

    await awardXP(req.user._id, 25, 'Created community workshop');

    res.status(201).json({ success: true, event });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ message: 'Server error creating workshop event' });
  }
});

/**
 * POST /api/communities/events/:eventId/register
 * Register for a community event (capacity-enforced)
 */
router.post('/events/:eventId/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status === 'cancelled') {
      return res.status(400).json({ message: 'This event has been cancelled' });
    }

    const isRegistered = (event.attendees || []).some(
      a => a.user.toString() === req.user._id.toString()
    );

    if (isRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    if (event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event has reached maximum capacity' });
    }

    event.attendees.push({ user: req.user._id, registeredAt: new Date() });
    await event.save();

    await awardXP(req.user._id, 10, 'Registered for community event');

    AnalyticsEvent.create({
      eventType: 'event_registered',
      user: req.user._id,
      metadata: { eventId: event._id, title: event.title }
    }).catch(() => {});

    res.json({ success: true, message: 'Registered successfully', event });
  } catch (err) {
    console.error('Register for event error:', err);
    res.status(500).json({ message: 'Server error registering for event' });
  }
});

module.exports = router;
