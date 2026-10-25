const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  provider: {
    type: String,
    enum: ['razorpay', 'cashfree', 'payu', 'stripe'],
    default: 'razorpay',
    required: true,
    index: true
  },
  providerOrderId: {
    type: String,
    sparse: true,
    index: true
  },
  providerPaymentId: {
    type: String,
    sparse: true,
    index: true
  },
  paymentSessionId: {
    type: String,
    sparse: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  amountPaise: {
    type: Number,
    default: function() {
      return Math.round(this.amount * 100);
    }
  },
  currency: {
    type: String,
    default: 'INR'
  },
  method: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'wallet', 'other'],
    default: 'upi',
    index: true
  },
  methodDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['created', 'pending', 'authorized', 'captured', 'failed', 'cancelled', 'refunded'],
    default: 'created',
    index: true
  },
  purpose: {
    type: String,
    enum: ['premium_membership', 'tutoring_session', 'workshop_ticket'],
    default: 'premium_membership',
    required: true
  },
  referenceId: {
    type: String,
    trim: true
  },
  signatureVerified: {
    type: Boolean,
    default: false
  },
  receipt: {
    type: String,
    required: true
  },
  upiData: {
    qrString: { type: String },
    upiIntentUrl: { type: String },
    gpayIntent: { type: String },
    phonepeIntent: { type: String },
    paytmIntent: { type: String },
    bhimIntent: { type: String },
    vpa: { type: String }
  },
  webhookEvents: [{
    eventId: { type: String },
    eventType: { type: String },
    receivedAt: { type: Date, default: Date.now }
  }],
  errorDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  notes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
