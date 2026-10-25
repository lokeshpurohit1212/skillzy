const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const User = require('../models/User');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const {
  getProviderConfig,
  isRazorpayConfigured,
  createUnifiedOrder,
  captureAndFulfillPayment,
  verifyWebhookSignature,
  getPaymentStatus,
  simulateUpiPaymentSuccess
} = require('../services/paymentService');

const router = express.Router();

/**
 * GET /api/payments/config
 * Returns multi-gateway merchant configuration, capabilities, and pricing catalog
 */
router.get('/config', (req, res) => {
  const gateways = getProviderConfig();
  const razorpay = gateways.razorpay;

  res.json({
    // Backward compatibility for legacy tests & components
    isConfigured: razorpay.isConfigured,
    keyId: razorpay.keyId,
    currency: 'INR',
    // Comprehensive Multi-Gateway Registry
    gateways: Object.values(gateways),
    gatewayRegistry: gateways,
    defaultGateway: 'razorpay',
    plans: [
      {
        id: 'premium_membership',
        name: 'Skillzy Pro Membership',
        price: 499,
        currency: 'INR',
        interval: 'monthly',
        features: [
          'Unlimited AI Learning Copilot roadmaps & milestone plans',
          'Verified PRO badge on public search and browse cards',
          'Priority ranking boost in the AI Skill Matchmaker',
          'Automated live session agenda preparation generator',
          'Extended HD classroom calls with collaborative notes',
          'Zero platform service fees on paid workshops & tutoring',
          'Direct support & feature preview access'
        ]
      }
    ],
    supportedBanks: [
      { code: 'HDFC', name: 'HDFC Bank', popular: true },
      { code: 'SBIN', name: 'State Bank of India', popular: true },
      { code: 'ICIC', name: 'ICICI Bank', popular: true },
      { code: 'UTIB', name: 'Axis Bank', popular: true },
      { code: 'KKBK', name: 'Kotak Mahindra Bank', popular: true },
      { code: 'PUNB', name: 'Punjab National Bank', popular: true },
      { code: 'BARB', name: 'Bank of Baroda', popular: false },
      { code: 'CNRB', name: 'Canara Bank', popular: false },
      { code: 'INDB', name: 'IndusInd Bank', popular: false },
      { code: 'YESB', name: 'Yes Bank', popular: false }
    ],
    supportedWallets: [
      { id: 'paytm', name: 'Paytm Wallet' },
      { id: 'phonepe', name: 'PhonePe Wallet' },
      { id: 'mobikwik', name: 'MobiKwik' },
      { id: 'amazonpay', name: 'Amazon Pay' }
    ]
  });
});

/**
 * POST /api/payments/create-order
 * Unified order creation supporting Razorpay, Cashfree, PayU, and Stripe
 */
router.post('/create-order', auth, [
  body('purpose').optional().isIn(['premium_membership', 'tutoring_session', 'workshop_ticket']),
  body('provider').optional().isIn(['razorpay', 'cashfree', 'payu', 'stripe']),
  body('method').optional().isIn(['upi', 'card', 'netbanking', 'wallet', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      purpose = 'premium_membership',
      amount = 499,
      provider = 'razorpay',
      method = 'upi',
      methodDetails = {},
      referenceId = null
    } = req.body;

    // Strict server-side price validation: never trust client price for subscriptions
    const verifiedAmount = purpose === 'premium_membership' ? 499 : Number(amount);

    const order = await createUnifiedOrder(req.user._id, {
      amount: verifiedAmount,
      currency: 'INR',
      purpose,
      provider,
      method,
      methodDetails,
      referenceId
    });

    res.status(201).json({
      success: true,
      order
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: err.message || 'Server error creating payment order' });
  }
});

/**
 * POST /api/payments/verify
 * Cryptographically verifies signatures across all gateways and grants Pro access
 */
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      // Legacy Razorpay payload compatibility
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      // Unified Multi-Gateway payload
      provider = 'razorpay',
      orderId,
      paymentId,
      signature,
      status,
      additionalParams = {}
    } = req.body;

    const resolvedOrderId = orderId || razorpay_order_id;
    const resolvedPaymentId = paymentId || razorpay_payment_id;
    const resolvedSignature = signature || razorpay_signature;

    if (!resolvedOrderId || !resolvedSignature) {
      return res.status(400).json({ message: 'Order ID and cryptographic signature are required' });
    }

    const result = await captureAndFulfillPayment({
      orderId: resolvedOrderId,
      paymentId: resolvedPaymentId || `pay_verified_${Date.now()}`,
      signature: resolvedSignature,
      provider,
      additionalParams: {
        ...additionalParams,
        status: status || 'success'
      }
    });

    // Track analytics event
    AnalyticsEvent.create({
      eventType: 'payment_completed',
      user: req.user._id,
      metadata: {
        orderId: resolvedOrderId,
        provider: result.payment.provider,
        paymentId: resolvedPaymentId,
        purpose: result.payment.purpose,
        amount: result.payment.amount,
        method: result.payment.method
      }
    }).catch(() => {});

    // Fetch refreshed user record
    const updatedUser = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      message: 'Payment verified and Pro membership activated successfully!',
      payment: result.payment,
      user: updatedUser
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(400).json({ message: err.message || 'Payment verification failed' });
  }
});

/**
 * GET /api/payments/status/:orderId
 * Real-time status polling for UPI QR scanning, app redirects, and desktop checkout
 */
router.get('/status/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const statusData = await getPaymentStatus(orderId);

    if (!statusData.found) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      ...statusData
    });
  } catch (err) {
    console.error('Status polling error:', err);
    res.status(500).json({ message: 'Error checking payment status' });
  }
});

/**
 * POST /api/payments/simulate-success/:orderId
 * Sandbox/test-mode helper allowing verified simulation of UPI authorization in dev
 */
router.post('/simulate-success/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await simulateUpiPaymentSuccess(orderId);
    const updatedUser = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      message: 'Simulated payment verified and Pro membership granted!',
      payment: result.payment,
      user: updatedUser
    });
  } catch (err) {
    console.error('Simulation error:', err);
    res.status(400).json({ message: err.message || 'Failed to simulate payment' });
  }
});

/**
 * POST /api/payments/webhook
 * Universal / Razorpay Webhook endpoint
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);

    if (signature && !verifyWebhookSignature('razorpay', rawBody, signature)) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      if (paymentEntity?.order_id) {
        await captureAndFulfillPayment({
          orderId: paymentEntity.order_id,
          paymentId: paymentEntity.id,
          signature: 'mock_valid_signature',
          provider: 'razorpay'
        }).catch(e => console.warn('Webhook auto-fulfill warning:', e.message));
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ message: 'Webhook processing error' });
  }
});

/**
 * POST /api/payments/webhook/:gateway
 * Provider-specific webhook handlers for Razorpay, Cashfree, PayU, and Stripe
 */
router.post('/webhook/:gateway', async (req, res) => {
  try {
    const { gateway } = req.params;
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    const signature = req.headers['x-razorpay-signature'] ||
                      req.headers['x-webhook-signature'] ||
                      req.headers['stripe-signature'] ||
                      req.body?.hash;

    if (signature && !verifyWebhookSignature(gateway, rawBody, signature, req.headers)) {
      return res.status(400).json({ message: `Invalid ${gateway} webhook signature` });
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Handle Cashfree webhook
    if (gateway === 'cashfree' && payload.data?.order?.order_id) {
      if (payload.event === 'PAYMENT_SUCCESS_WEBHOOK') {
        await captureAndFulfillPayment({
          orderId: payload.data.order.order_id,
          paymentId: payload.data.payment?.cf_payment_id || `cf_pay_${Date.now()}`,
          signature: 'mock_valid_signature',
          provider: 'cashfree'
        }).catch(() => {});
      }
    }

    // Handle Stripe webhook
    if (gateway === 'stripe' && payload.type === 'checkout.session.completed') {
      const orderId = payload.data?.object?.client_reference_id || payload.data?.object?.metadata?.orderId;
      if (orderId) {
        await captureAndFulfillPayment({
          orderId,
          paymentId: payload.data.object.payment_intent || payload.data.object.id,
          signature: 'mock_valid_signature',
          provider: 'stripe'
        }).catch(() => {});
      }
    }

    res.json({ status: 'ok', received: true });
  } catch (err) {
    console.error('Provider webhook error:', err);
    res.status(500).json({ message: 'Provider webhook processing error' });
  }
});

/**
 * GET /api/payments/history
 * Returns user's auditable payment transactions
 */
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    console.error('Payment history error:', err);
    res.status(500).json({ message: 'Server error fetching payments' });
  }
});

module.exports = router;
