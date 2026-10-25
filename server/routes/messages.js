const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Swap = require('../models/Swap');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Get messages for a specific swap
router.get('/swap/:swapId', auth, async (req, res) => {
  try {
    const { swapId } = req.params;

    if (!swapId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid swap ID' });
    }

    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    const userIdStr = req.user._id.toString();
    const isParticipant =
      swap.requester.toString() === userIdStr ||
      swap.recipient.toString() === userIdStr;

    if (!isParticipant && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view messages for this swap' });
    }

    const messages = await Message.find({ swap: swapId })
      .populate('sender', 'name profilePhoto')
      .populate('recipient', 'name profilePhoto')
      .sort({ createdAt: 1 });

    // Mark messages addressed to current user as read
    await Message.updateMany(
      { swap: swapId, recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message within a swap
router.post('/', auth, [
  body('swapId').isMongoId().withMessage('Valid swap ID is required'),
  body('text').trim().notEmpty().withMessage('Message text is required').isLength({ max: 2000 }).withMessage('Message exceeds limit of 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { swapId, text } = req.body;
    const swap = await Swap.findById(swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    const userIdStr = req.user._id.toString();
    const isRequester = swap.requester.toString() === userIdStr;
    const isRecipient = swap.recipient.toString() === userIdStr;

    if (!isRequester && !isRecipient) {
      return res.status(403).json({ message: 'Not authorized to send messages for this swap' });
    }

    if (swap.status === 'rejected' || swap.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot message on a closed or rejected swap' });
    }

    const recipientId = isRequester ? swap.recipient : swap.requester;

    const message = new Message({
      swap: swap._id,
      sender: req.user._id,
      recipient: recipientId,
      text
    });

    await message.save();
    await message.populate('sender', 'name profilePhoto');
    await message.populate('recipient', 'name profilePhoto');

    // Create notification for recipient
    try {
      await Notification.create({
        user: recipientId,
        sender: req.user._id,
        type: 'new_message',
        title: `New message from ${req.user.name}`,
        message: text.length > 80 ? `${text.slice(0, 77)}...` : text,
        link: `/swaps/${swap._id}`,
        swap: swap._id
      });
    } catch (notifErr) {
      console.error('Failed to create notification for message:', notifErr.message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count for current user
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      read: false
    });
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
