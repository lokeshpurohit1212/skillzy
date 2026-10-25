const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Get current user's transaction history
router.get('/my-transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id
    })
      .populate('swap', 'requestedSkill offeredSkill duration status')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;