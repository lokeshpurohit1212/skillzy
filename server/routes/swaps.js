const express = require('express');
const { body, validationResult } = require('express-validator');
const Swap = require('../models/Swap');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const requireAdmin = auth.requireAdmin;
const { awardXP, awardBadge } = require('../services/achievementService');

const router = express.Router();

// Helper to safely create notification without throwing
async function sendNotification(data) {
  try {
    await Notification.create(data);
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
}

// Create a new swap request
router.post('/', auth, [
  body('recipientId').isMongoId().withMessage('Valid recipient ID is required'),
  body('requestedSkill.name').trim().notEmpty().withMessage('Requested skill name is required'),
  body('offeredSkill.name').trim().notEmpty().withMessage('Offered skill name is required'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 hour'),
  body('message').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      recipientId,
      requestedSkill,
      offeredSkill,
      message,
      scheduledDate,
      duration
    } = req.body;

    // Prevent swapping with oneself
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot request a skill swap with yourself' });
    }

    // Check if recipient exists and is public
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    if (!recipient.isPublic) {
      return res.status(403).json({ message: 'Cannot send request to private profile' });
    }

    // Check if recipient has the requested skill
    const hasRequestedSkill = recipient.skillsOffered.some(skill => 
      skill.name.toLowerCase() === requestedSkill.name.toLowerCase()
    );

    if (!hasRequestedSkill) {
      return res.status(400).json({ message: 'Recipient does not offer this skill' });
    }

    // Check if requester has the offered skill
    const requester = await User.findById(req.user._id);

    if (requester.timeCredits < duration) {
      return res.status(400).json({
        message: `You need ${duration} time credit(s) for this exchange. You currently have ${requester.timeCredits}.`
      });
    }

    const hasOfferedSkill = requester.skillsOffered.some(skill =>
      skill.name.toLowerCase() === offeredSkill.name.toLowerCase()
    );

    if (!hasOfferedSkill) {
      return res.status(400).json({ message: 'You do not offer this skill' });
    }

    // Check if there's already an active swap between these users
    const existingSwap = await Swap.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id }
      ],
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingSwap) {
      return res.status(400).json({ message: 'An active swap request already exists between you and this user' });
    }

    // Create the swap
    const swap = new Swap({
      requester: req.user._id,
      recipient: recipientId,
      requestedSkill,
      offeredSkill,
      message,
      duration,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null
    });

    await swap.save();

    // Populate user details for response
    await swap.populate('requester', 'name profilePhoto');
    await swap.populate('recipient', 'name profilePhoto');

    // Notify recipient
    await sendNotification({
      user: recipient._id,
      sender: req.user._id,
      type: 'swap_request',
      title: 'New Skill Swap Request',
      message: `${requester.name} wants to learn "${requestedSkill.name}" and teach "${offeredSkill.name}" (${duration} hr).`,
      link: `/swaps/${swap._id}`,
      swap: swap._id
    });

    res.status(201).json(swap);
  } catch (error) {
    console.error('Create swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's swaps (as requester and recipient)
router.get('/my-swaps', auth, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ]
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    const swaps = await Swap.find(query)
      .populate('requester', 'name profilePhoto')
      .populate('recipient', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.json(swaps);
  } catch (error) {
    console.error('Get my swaps error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all swaps
router.get('/admin/all', auth, requireAdmin, async (req, res) => {
  try {
    const swaps = await Swap.find()
      .populate('requester', 'name email profilePhoto')
      .populate('recipient', 'name email profilePhoto')
      .sort({ createdAt: -1 });

    res.json(swaps);
  } catch (error) {
    console.error('Admin get swaps error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get swap by ID
router.get('/:id', auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid swap ID' });
    }

    const swap = await Swap.findById(req.params.id)
      .populate('requester', 'name profilePhoto email')
      .populate('recipient', 'name profilePhoto email');

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Check if user is authorized to view this swap
    const userIdStr = req.user._id.toString();
    const isParticipant =
      swap.requester._id.toString() === userIdStr ||
      swap.recipient._id.toString() === userIdStr;

    if (!isParticipant && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this swap' });
    }

    res.json(swap);
  } catch (error) {
    console.error('Get swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept swap request
router.put('/:id/accept', auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid swap ID' });
    }

    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Only recipient can accept
    if (swap.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the recipient can accept a swap' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap is not in pending status' });
    }

    swap.status = 'accepted';
    await swap.save();

    await swap.populate('requester', 'name profilePhoto');
    await swap.populate('recipient', 'name profilePhoto');

    // Notify requester
    await sendNotification({
      user: swap.requester._id,
      sender: req.user._id,
      type: 'swap_accepted',
      title: 'Swap Request Accepted!',
      message: `${req.user.name} accepted your swap request for "${swap.requestedSkill.name}".`,
      link: `/swaps/${swap._id}`,
      swap: swap._id
    });

    res.json(swap);
  } catch (error) {
    console.error('Accept swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject swap request
router.put('/:id/reject', auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid swap ID' });
    }

    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Only recipient can reject
    if (swap.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the recipient can reject a swap' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap is not in pending status' });
    }

    swap.status = 'rejected';
    await swap.save();

    await swap.populate('requester', 'name profilePhoto');
    await swap.populate('recipient', 'name profilePhoto');

    // Notify requester
    await sendNotification({
      user: swap.requester._id,
      sender: req.user._id,
      type: 'swap_rejected',
      title: 'Swap Request Declined',
      message: `${req.user.name} declined your swap request for "${swap.requestedSkill.name}".`,
      link: `/swaps/${swap._id}`,
      swap: swap._id
    });

    res.json(swap);
  } catch (error) {
    console.error('Reject swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel / Withdraw swap request
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid swap ID' });
    }

    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    const userIdStr = req.user._id.toString();
    const isRequester = swap.requester.toString() === userIdStr;
    const isRecipient = swap.recipient.toString() === userIdStr;

    if (!isRequester && !isRecipient && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this swap' });
    }

    if (swap.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel an already completed swap' });
    }

    if (swap.status === 'cancelled') {
      return res.status(400).json({ message: 'Swap is already cancelled' });
    }

    if (swap.status === 'rejected') {
      return res.status(400).json({ message: 'Swap has already been rejected' });
    }

    // Only requester can withdraw a pending swap
    if (swap.status === 'pending' && !isRequester && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Only the requester can cancel a pending swap (recipient may reject)' });
    }

    swap.status = 'cancelled';
    await swap.save();

    await swap.populate('requester', 'name profilePhoto');
    await swap.populate('recipient', 'name profilePhoto');

    // Notify the other party
    const targetUserId = isRequester ? swap.recipient._id : swap.requester._id;
    await sendNotification({
      user: targetUserId,
      sender: req.user._id,
      type: 'swap_cancelled',
      title: 'Swap Request Cancelled',
      message: `${req.user.name} cancelled the swap exchange for "${swap.requestedSkill.name}".`,
      link: `/swaps/${swap._id}`,
      swap: swap._id
    });

    res.json(swap);
  } catch (error) {
    console.error('Cancel swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete swap and transfer time credits
router.put('/:id/complete', auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid swap ID' });
    }

    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    const userIdStr = req.user._id.toString();
    const isRequester = swap.requester.toString() === userIdStr;
    const isRecipient = swap.recipient.toString() === userIdStr;

    if (!isRequester && !isRecipient && !req.user.isAdmin) {
      return res.status(403).json({
        message: 'Not authorized to complete this swap'
      });
    }

    if (swap.status !== 'accepted') {
      return res.status(400).json({
        message: 'Swap must be in accepted status before completion'
      });
    }

    const duration = swap.duration;
    if (!duration || duration < 1) {
      return res.status(400).json({
        message: 'Invalid exchange duration'
      });
    }

    // Get both users
    const requester = await User.findById(swap.requester);
    const recipient = await User.findById(swap.recipient);

    if (!requester || !recipient) {
      return res.status(404).json({
        message: 'One or both users not found'
      });
    }

    // Check requester balance
    if (requester.timeCredits < duration) {
      return res.status(400).json({
        message: `Insufficient time credits. Requester needs ${duration} credit(s), but only has ${requester.timeCredits}.`
      });
    }

    // Atomic update of swap status to prevent double-completion
    const updatedSwap = await Swap.findOneAndUpdate(
      { _id: swap._id, status: 'accepted' },
      { $set: { status: 'completed', completedDate: new Date() } },
      { new: true }
    );

    if (!updatedSwap) {
      return res.status(400).json({
        message: 'Swap has already been completed or is no longer accepted'
      });
    }

    // Atomic credit updates
    const updatedRequester = await User.findByIdAndUpdate(
      requester._id,
      { $inc: { timeCredits: -duration, swapsCompleted: 1 } },
      { new: true }
    );

    const updatedRecipient = await User.findByIdAndUpdate(
      recipient._id,
      { $inc: { timeCredits: duration, swapsCompleted: 1 } },
      { new: true }
    );

    // Record transactions
    await Transaction.create({
      user: requester._id,
      type: 'spent',
      credits: duration,
      reason: `Learned ${swap.requestedSkill.name}`,
      swap: swap._id,
      balanceAfter: updatedRequester.timeCredits
    });

    await Transaction.create({
      user: recipient._id,
      type: 'earned',
      credits: duration,
      reason: `Taught ${swap.requestedSkill.name}`,
      swap: swap._id,
      balanceAfter: updatedRecipient.timeCredits
    });

    // Skillzy 2.0: Award XP and badges to both participants
    await awardXP(requester._id, 50, 'Completed skill exchange');
    await awardXP(recipient._id, 50, 'Completed skill exchange');
    await awardBadge(requester._id, 'first_swap');
    await awardBadge(recipient._id, 'first_swap');
    if (updatedRecipient.swapsCompleted >= 3) await awardBadge(recipient._id, 'consistent_mentor');
    if (updatedRequester.swapsCompleted >= 5) await awardBadge(requester._id, 'five_swaps');
    if (updatedRecipient.swapsCompleted >= 5) await awardBadge(recipient._id, 'five_swaps');

    await updatedSwap.populate('requester', 'name profilePhoto');
    await updatedSwap.populate('recipient', 'name profilePhoto');

    // Notify both users
    await sendNotification({
      user: requester._id,
      sender: recipient._id,
      type: 'swap_completed',
      title: 'Swap Completed!',
      message: `Your exchange for "${swap.requestedSkill.name}" has been completed. You spent ${duration} time credit(s). Don't forget to leave a review!`,
      link: `/swaps/${swap._id}`,
      swap: swap._id
    });

    await sendNotification({
      user: recipient._id,
      sender: requester._id,
      type: 'swap_completed',
      title: 'Swap Completed!',
      message: `Your exchange for "${swap.requestedSkill.name}" has been completed. You earned ${duration} time credit(s). Don't forget to leave a review!`,
      link: `/swaps/${swap._id}`,
      swap: swap._id
    });

    res.json({
      message: 'Exchange completed successfully. Time credits transferred.',
      swap: updatedSwap,
      credits: {
        spentByRequester: duration,
        earnedByRecipient: duration
      }
    });

  } catch (error) {
    console.error('Complete swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave rating / review for a completed swap
router.post('/:id/rate', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must not exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid swap ID' });
    }

    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    if (swap.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review a completed exchange' });
    }

    const { rating, comment } = req.body;
    const userIdStr = req.user._id.toString();
    const isRequester = swap.requester.toString() === userIdStr;
    const isRecipient = swap.recipient.toString() === userIdStr;

    if (!isRequester && !isRecipient) {
      return res.status(403).json({ message: 'Not authorized to review this swap' });
    }

    let targetUserId;
    if (isRequester) {
      if (swap.requesterRating && swap.requesterRating.rating) {
        return res.status(400).json({ message: 'You have already reviewed this swap' });
      }
      swap.requesterRating = {
        rating,
        comment: comment || '',
        date: new Date()
      };
      targetUserId = swap.recipient;
    } else {
      if (swap.recipientRating && swap.recipientRating.rating) {
        return res.status(400).json({ message: 'You have already reviewed this swap' });
      }
      swap.recipientRating = {
        rating,
        comment: comment || '',
        date: new Date()
      };
      targetUserId = swap.requester;
    }

    await swap.save();

    // Add review to recipient user's ratings array
    const targetUser = await User.findById(targetUserId);
    if (targetUser) {
      // Check if review from this reviewer for this swap already exists in target user's ratings
      const alreadyReviewed = targetUser.ratings.some(
        r => r.swap && r.swap.toString() === swap._id.toString() && r.reviewer.toString() === req.user._id.toString()
      );

      if (!alreadyReviewed) {
        targetUser.ratings.push({
          reviewer: req.user._id,
          swap: swap._id,
          rating,
          comment: comment || '',
          date: new Date()
        });
        await targetUser.save();
        if (rating === 5) {
          await awardBadge(targetUser._id, 'community_helper');
          await awardXP(targetUser._id, 25, 'Received 5-star review');
        }
      }

      // Notify target user
      await sendNotification({
        user: targetUser._id,
        sender: req.user._id,
        type: 'new_review',
        title: 'New Review Received',
        message: `${req.user.name} rated your skill exchange ${rating} / 5 stars${comment ? `: "${comment}"` : '.'}`,
        link: `/user/${targetUser._id}`,
        swap: swap._id
      });
    }

    await swap.populate('requester', 'name profilePhoto');
    await swap.populate('recipient', 'name profilePhoto');

    res.json({
      message: 'Rating submitted successfully',
      swap
    });
  } catch (error) {
    console.error('Rate swap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;