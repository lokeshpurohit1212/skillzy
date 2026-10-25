const express = require('express');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Swap = require('../models/Swap');
const Session = require('../models/Session');
const Community = require('../models/Community');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const { isLiveKitConfigured } = require('../services/videoService');
const { isRazorpayConfigured } = require('../services/paymentService');

const router = express.Router();

/**
 * GET /api/admin/overview
 * Platform usage statistics and provider health indicators
 */
router.get('/overview', auth, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalSwaps,
      completedSwaps,
      totalSessions,
      totalCommunities,
      totalPayments
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isPublic: true }),
      Swap.countDocuments(),
      Swap.countDocuments({ status: 'completed' }),
      Session.countDocuments(),
      Community.countDocuments(),
      Payment.countDocuments({ status: 'captured' })
    ]);

    const providerHealth = {
      database: 'connected',
      geminiAi: Boolean(process.env.GEMINI_API_KEY) ? 'configured' : 'fallback_deterministic',
      liveKitVideo: isLiveKitConfigured() ? 'configured' : 'fallback_native_webrtc',
      razorpayPayments: isRazorpayConfigured() ? 'configured' : 'test_mode_active'
    };

    res.json({
      metrics: {
        totalUsers,
        activeUsers,
        totalSwaps,
        completedSwaps,
        totalSessions,
        totalCommunities,
        totalPayments
      },
      providerHealth
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ message: 'Server error fetching admin overview' });
  }
});

/**
 * GET /api/admin/users
 * Paginated user moderation directory
 */
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
      .limit(parseInt(limit, 10));

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10))
    });
  } catch (err) {
    console.error('Admin users list error:', err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

/**
 * PUT /api/admin/users/:id/ban
 * Safe user suspension / ban toggle with audit log
 */
router.put('/users/:id/ban', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newPublicStatus = !user.isPublic;
    user.isPublic = newPublicStatus;
    await user.save();

    // Record privileged action audit log
    await AuditLog.create({
      admin: req.user._id === 'admin' ? null : req.user._id,
      adminEmail: req.user.email || 'admin@skillzy.com',
      action: newPublicStatus ? 'user_unrestricted' : 'user_restricted',
      targetType: 'user',
      targetId: user._id.toString(),
      details: {
        reason: req.body.reason || 'Admin moderation action',
        isPublic: newPublicStatus
      }
    });

    res.json({
      success: true,
      message: `User profile is now ${newPublicStatus ? 'active' : 'restricted'}`,
      user: user.getPublicProfile()
    });
  } catch (err) {
    console.error('Admin ban user error:', err);
    res.status(500).json({ message: 'Server error toggling user status' });
  }
});

/**
 * GET /api/admin/audit-logs
 * Privileged actions audit trail
 */
router.get('/audit-logs', auth, requireAdmin, async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (err) {
    console.error('Admin audit logs error:', err);
    res.status(500).json({ message: 'Server error fetching audit logs' });
  }
});

module.exports = router;
