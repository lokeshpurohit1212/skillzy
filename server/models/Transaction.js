const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  type: {
    type: String,
    enum: ['earned', 'spent'],
    required: true
  },

  credits: {
    type: Number,
    required: true,
    min: 1
  },

  reason: {
    type: String,
    required: true,
    trim: true
  },

  swap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Swap'
  },

  balanceAfter: {
    type: Number,
    required: true,
    min: 0
  }

}, {
  timestamps: true
});

transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);