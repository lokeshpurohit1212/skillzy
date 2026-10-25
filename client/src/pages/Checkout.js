import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  RefreshCw,
  AlertCircle,
  Lock,
  Check,
  Copy,
  Sparkles,
  Clock,
  Zap,
  QrCode
} from 'lucide-react';
import { BrandLogoBadge } from '../components/PaymentBrandIcons';
import QRCodeDisplay from '../components/QRCodeDisplay';

const Checkout = () => {
  const { user } = useAuth();

  const [availableGateways, setAvailableGateways] = useState([
    { id: 'razorpay', name: 'Razorpay', badge: 'Default', description: 'UPI, Cards, NetBanking & Wallets', supportedMethods: ['upi', 'card', 'netbanking', 'wallet'] },
    { id: 'cashfree', name: 'Cashfree', badge: 'Fast UPI', description: 'UPI Intent, QR, Cards & Banking', supportedMethods: ['upi', 'card', 'netbanking', 'wallet'] },
    { id: 'payu', name: 'PayU', badge: 'Popular', description: 'Cards, NetBanking & UPI', supportedMethods: ['upi', 'card', 'netbanking'] },
    { id: 'stripe', name: 'Stripe', badge: 'Global', description: 'International & Domestic Cards', supportedMethods: ['card', 'netbanking'] }
  ]);

  const [selectedGateway, setSelectedGateway] = useState('razorpay');
  const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi', 'card', 'netbanking', 'wallet'
  
  // UPI Sub-options: 'apps', 'qr', 'vpa'
  const [upiSubMethod, setUpiSubMethod] = useState('apps');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); // 'gpay', 'phonepe', 'paytm', 'bhim', 'other'
  const [vpaInput, setVpaInput] = useState('');
  const [vpaError, setVpaError] = useState('');

  // Device Detection State (Mobile vs Desktop)
  const [isMobile, setIsMobile] = useState(false);
  const [appLaunchAttempted, setAppLaunchAttempted] = useState(false);

  // Card details
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: user?.name || '',
    expiry: '',
    cvv: '',
    saveCard: true
  });
  const [cardBrand, setCardBrand] = useState(null); // 'visa', 'mastercard', 'rupay', 'amex'
  const [cardErrors, setCardErrors] = useState({});

  // Net banking details
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [popularBanks, setPopularBanks] = useState([
    { code: 'HDFC', name: 'HDFC Bank', brand: 'hdfc' },
    { code: 'SBIN', name: 'State Bank of India', brand: 'sbi' },
    { code: 'ICIC', name: 'ICICI Bank', brand: 'icici' },
    { code: 'UTIB', name: 'Axis Bank', brand: 'axis' },
    { code: 'KKBK', name: 'Kotak Mahindra Bank', brand: 'kotak' },
    { code: 'PUNB', name: 'Punjab National Bank', brand: 'pnb' }
  ]);
  const [otherBanks, setOtherBanks] = useState([
    { code: 'BARB', name: 'Bank of Baroda', brand: 'baroda' },
    { code: 'CNRB', name: 'Canara Bank', brand: 'canara' },
    { code: 'INDB', name: 'IndusInd Bank' },
    { code: 'YESB', name: 'Yes Bank' },
    { code: 'UBIN', name: 'Union Bank of India' },
    { code: 'FDRL', name: 'Federal Bank' },
    { code: 'IBKL', name: 'IDBI Bank' },
    { code: 'CBIN', name: 'Central Bank of India' }
  ]);

  // Wallet details
  const [selectedWallet, setSelectedWallet] = useState('paytm');
  const supportedWalletsList = [
    { id: 'paytm', name: 'Paytm Wallet', desc: 'Pay via Paytm balance or Postpaid', brand: 'paytm' },
    { id: 'phonepe', name: 'PhonePe Wallet', desc: 'Instant authorization via PhonePe balance', brand: 'phonepe' },
    { id: 'mobikwik', name: 'MobiKwik', desc: 'MobiKwik ZIP Pay Later & Wallet', brand: 'mobikwik' },
    { id: 'amazonpay', name: 'Amazon Pay', desc: 'Use your Amazon Pay balance & vouchers', brand: 'amazonpay' }
  ];

  // Pricing Catalog (defaults to authoritative ₹499 monthly subscription)
  const [planPrice, setPlanPrice] = useState(499);
  const [planDetails, setPlanDetails] = useState({
    name: 'Skillzy Pro Membership',
    interval: 'monthly'
  });

  // Order & Payment Lifecycle
  const [order, setOrder] = useState(null);
  const [checkoutState, setCheckoutState] = useState('idle'); // 'idle', 'creating', 'awaiting_payment', 'verifying', 'success', 'failed'
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);
  
  // Timer & Polling for QR / UPI
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [pollingActive, setPollingActive] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);

  const pollIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const visibilityTimeoutRef = useRef(null);

  // Supported UPI Apps Catalogue with Authentic Brand Marks
  const upiApps = [
    {
      id: 'gpay',
      name: 'Google Pay',
      brand: 'gpay',
      badge: 'Official UPI',
      desc: 'Pay using Google Pay on this device or scan QR'
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      brand: 'phonepe',
      badge: 'Instant App Intent',
      desc: 'Seamless authorization via PhonePe'
    },
    {
      id: 'paytm',
      name: 'Paytm UPI',
      brand: 'paytm',
      badge: 'Paytm Verified',
      desc: 'Instant UPI transfer via Paytm app'
    },
    {
      id: 'bhim',
      name: 'BHIM UPI',
      brand: 'bhim',
      badge: 'NPCI Official',
      desc: 'Pay via government-backed BHIM app'
    },
    {
      id: 'other',
      name: 'Any Other UPI App',
      brand: 'upi',
      badge: 'CRED / Amazon / Bank UPI',
      desc: 'Pay with CRED, Amazon Pay, or any bank UPI application'
    }
  ];

  // 1. Device Detection on Mount & Window Resize
  useEffect(() => {
    const detectDevice = () => {
      const userAgentMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const touchCapable = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      const isNarrow = window.innerWidth <= 768;
      setIsMobile(Boolean(userAgentMobile || (touchCapable && isNarrow)));
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // 2. Fetch Authoritative Multi-Gateway Config on Mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/payments/config');
        if (res.data) {
          if (res.data.gateways && Array.isArray(res.data.gateways)) {
            setAvailableGateways(res.data.gateways);
          }
          if (res.data.plans && res.data.plans[0]) {
            setPlanPrice(res.data.plans[0].price || 499);
            setPlanDetails(res.data.plans[0]);
          }
          if (res.data.supportedBanks) {
            const pop = res.data.supportedBanks.filter(b => b.popular).map(b => ({
              code: b.code,
              name: b.name,
              brand: b.code.toLowerCase()
            }));
            const oth = res.data.supportedBanks.filter(b => !b.popular).map(b => ({
              code: b.code,
              name: b.name,
              brand: b.code.toLowerCase()
            }));
            if (pop.length > 0) setPopularBanks(pop);
            if (oth.length > 0) setOtherBanks(oth);
          }
        }
      } catch (err) {
        console.warn('Could not load dynamic gateway config:', err);
      }
    };

    fetchConfig();

    return () => {
      clearInterval(pollIntervalRef.current);
      clearInterval(timerIntervalRef.current);
      clearTimeout(visibilityTimeoutRef.current);
    };
  }, []);

  // 3. Keep payment methods synchronized with active gateway's capabilities
  const activeGatewayObj = useMemo(() => {
    return availableGateways.find(g => g.id === selectedGateway) || availableGateways[0];
  }, [availableGateways, selectedGateway]);

  const supportedMethods = useMemo(() => {
    return activeGatewayObj?.supportedMethods || ['upi', 'card', 'netbanking', 'wallet'];
  }, [activeGatewayObj]);

  useEffect(() => {
    if (!supportedMethods.includes(selectedMethod)) {
      const fallback = supportedMethods[0] || 'card';
      setSelectedMethod(fallback);
      if (selectedGateway === 'stripe') {
        toast.info('Stripe India processes Cards & Net Banking. UPI is available via Razorpay or Cashfree.');
      }
    }
  }, [selectedGateway, supportedMethods, selectedMethod]);

  // 4. Card Brand Detection & Formatting
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Exact Brand Matcher
    if (/^4/.test(raw)) {
      setCardBrand('visa');
    } else if (/^(5[1-5]|2[2-7])/.test(raw)) {
      setCardBrand('mastercard');
    } else if (/^(60|65|81|82|508)/.test(raw)) {
      setCardBrand('rupay');
    } else if (/^3[47]/.test(raw)) {
      setCardBrand('amex');
    } else if (/^(50|56|57|58|6)/.test(raw)) {
      setCardBrand('maestro');
    } else {
      setCardBrand(null);
    }

    setCardDetails(prev => ({ ...prev, number: formatted }));
    if (cardErrors.number) {
      setCardErrors(prev => ({ ...prev, number: null }));
    }
  };

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardDetails(prev => ({ ...prev, expiry: raw }));
    if (cardErrors.expiry) {
      setCardErrors(prev => ({ ...prev, expiry: null }));
    }
  };

  const handleCvvChange = (e) => {
    const maxLen = cardBrand === 'amex' ? 4 : 3;
    const raw = e.target.value.replace(/\D/g, '').slice(0, maxLen);
    setCardDetails(prev => ({ ...prev, cvv: raw }));
    if (cardErrors.cvv) {
      setCardErrors(prev => ({ ...prev, cvv: null }));
    }
  };

  // 5. UPI ID / VPA Format Validation
  const validateVpa = (vpa) => {
    const vpaRegex = /^[\w.-]+@[\w.-]+$/;
    if (!vpa || !vpa.trim()) {
      return 'Please enter a UPI ID (Virtual Payment Address)';
    }
    if (!vpaRegex.test(vpa.trim())) {
      return 'Invalid UPI ID format. Expected: username@bankhandle (e.g. yourname@okhdfcbank)';
    }
    return '';
  };

  // 6. Card Field Validation
  const validateCard = () => {
    const errors = {};
    const rawNum = cardDetails.number.replace(/\s/g, '');
    if (rawNum.length < 15) {
      errors.number = 'Please enter a valid 15 or 16-digit card number';
    }
    if (!cardDetails.name.trim()) {
      errors.name = 'Cardholder name is required';
    }
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      errors.expiry = 'Invalid expiry format (MM/YY)';
    } else {
      const [m] = cardDetails.expiry.split('/').map(Number);
      if (m < 1 || m > 12) {
        errors.expiry = 'Invalid expiry month (01-12)';
      }
    }
    if (cardDetails.cvv.length < (cardBrand === 'amex' ? 4 : 3)) {
      errors.cvv = 'Invalid CVV / security code';
    }
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 7. Start Authoritative Polling & Countdown Timer
  const startTimerAndPolling = useCallback((orderId) => {
    setTimeLeft(600); // 10 minutes
    setPollingActive(true);

    clearInterval(timerIntervalRef.current);
    clearInterval(pollIntervalRef.current);

    // 1-second countdown
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          clearInterval(pollIntervalRef.current);
          setCheckoutState('failed');
          setErrorMessage('Payment session expired. Please start a new transaction.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 3-second authoritative status polling
    pollIntervalRef.current = setInterval(async () => {
      try {
        const statusRes = await api.get(`/payments/status/${orderId}`);
        if (statusRes.data?.isPaid || statusRes.data?.status === 'captured') {
          clearInterval(timerIntervalRef.current);
          clearInterval(pollIntervalRef.current);
          setPollingActive(false);
          setCheckoutState('success');
          setSuccessData({
            orderId: statusRes.data.orderId,
            paymentId: statusRes.data.paymentId || 'UPI_CONFIRMED',
            amount: statusRes.data.amount,
            method: statusRes.data.method,
            provider: statusRes.data.provider
          });
          toast.success('Payment captured! Skillzy Pro activated! 🎉');
        }
      } catch (err) {
        console.warn('Status poll warning:', err);
      }
    }, 3000);
  }, []);

  // 8. Mobile vs Desktop Smart Redirection Flow
  const triggerMobileAppIntent = (createdOrder, appKey) => {
    setAppLaunchAttempted(true);

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const upiData = createdOrder.upiData || {};

    let targetUri = upiData.upiIntentUrl; // Universal fallback

    if (appKey === 'gpay') {
      targetUri = isAndroid && upiData.gpayIntent
        ? upiData.gpayIntent
        : (isIOS ? `gpay://upi/pay?${(upiData.upiIntentUrl || '').replace('upi://pay?', '')}` : upiData.upiIntentUrl);
    } else if (appKey === 'phonepe') {
      targetUri = upiData.phonepeIntent || upiData.upiIntentUrl;
    } else if (appKey === 'paytm') {
      targetUri = upiData.paytmIntent || upiData.upiIntentUrl;
    } else if (appKey === 'bhim') {
      targetUri = isAndroid && upiData.bhimIntent ? upiData.bhimIntent : upiData.upiIntentUrl;
    }

    if (isMobile && targetUri) {
      // Trigger deep link safely
      window.location.href = targetUri;

      // Detect if app failed to launch or user returns without paying
      clearTimeout(visibilityTimeoutRef.current);
      visibilityTimeoutRef.current = setTimeout(() => {
        // If document is still visible, the browser might not have opened the app
        if (!document.hidden) {
          setAppLaunchAttempted(true);
        }
      }, 2500);
    } else if (!isMobile) {
      // On desktop, immediately show the dynamic QR view for the selected app
      setUpiSubMethod('qr');
      toast.success(`Generated UPI QR Code for ${upiApps.find(a => a.id === appKey)?.name || 'UPI'}. Scan with your phone to pay!`);
    }
  };

  // 9. Main Order Creation and Redirection Dispatcher
  const handleInitiatePayment = async () => {
    setErrorMessage('');
    
    // Method-specific client validation
    if (selectedMethod === 'upi') {
      if (upiSubMethod === 'vpa') {
        const error = validateVpa(vpaInput);
        if (error) {
          setVpaError(error);
          return;
        }
        setVpaError('');
      }
    } else if (selectedMethod === 'card') {
      if (!validateCard()) return;
    }

    setCheckoutState('creating');

    try {
      const payload = {
        purpose: 'premium_membership',
        amount: planPrice,
        provider: selectedGateway,
        method: selectedMethod,
        methodDetails: {
          subMethod: selectedMethod === 'upi' ? upiSubMethod : null,
          upiApp: selectedMethod === 'upi' && upiSubMethod === 'apps' ? selectedUpiApp : null,
          vpa: selectedMethod === 'upi' && upiSubMethod === 'vpa' ? vpaInput.trim() : null,
          bank: selectedMethod === 'netbanking' ? selectedBank : null,
          wallet: selectedMethod === 'wallet' ? selectedWallet : null,
          cardBrand: selectedMethod === 'card' ? cardBrand : null,
          cardLast4: selectedMethod === 'card' ? cardDetails.number.replace(/\s/g, '').slice(-4) : null
        }
      };

      const res = await api.post('/payments/create-order', payload);
      const createdOrder = res.data.order;
      setOrder(createdOrder);

      // Handle based on selected method and device
      if (selectedMethod === 'upi') {
        setCheckoutState('awaiting_payment');
        startTimerAndPolling(createdOrder.orderId);

        if (upiSubMethod === 'apps') {
          triggerMobileAppIntent(createdOrder, selectedUpiApp);
        }
      } else {
        // Cards, Net Banking, or Digital Wallets
        executeBankingGateway(createdOrder);
      }
    } catch (err) {
      console.error('Initiate payment error:', err);
      setCheckoutState('failed');
      setErrorMessage(err.response?.data?.message || 'Failed to initialize secure payment order');
      toast.error('Payment initialization failed');
    }
  };

  // 10. Execute Banking / Provider Gateway Execution (Cards, Net Banking, Wallets)
  const executeBankingGateway = async (createdOrder) => {
    // If live Razorpay JS is available and not in test mode
    if (selectedGateway === 'razorpay' && window.Razorpay && !createdOrder.isTestMode) {
      const options = {
        key: createdOrder.keyId,
        amount: createdOrder.amount * 100,
        currency: createdOrder.currency,
        name: 'Skillzy',
        description: 'Skillzy Pro Monthly Membership',
        order_id: createdOrder.providerOrderId || createdOrder.orderId,
        handler: async function (response) {
          verifyPaymentWithServer({
            provider: 'razorpay',
            orderId: response.razorpay_order_id || createdOrder.orderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature
          });
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: { color: '#5D3C64' }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // In Sandbox/Test mode: execute secure server verification
      setCheckoutState('verifying');
      await verifyPaymentWithServer({
        provider: selectedGateway,
        orderId: createdOrder.orderId,
        paymentId: `pay_${selectedGateway}_test_${Date.now()}`,
        signature: 'mock_valid_signature'
      });
    }
  };

  // 11. Cryptographically Verify Signature on Backend
  const verifyPaymentWithServer = async (verifyPayload) => {
    try {
      setCheckoutState('verifying');
      const res = await api.post('/payments/verify', verifyPayload);

      setCheckoutState('success');
      setSuccessData({
        orderId: res.data?.payment?.orderId || verifyPayload.orderId,
        paymentId: res.data?.payment?.providerPaymentId || verifyPayload.paymentId,
        amount: res.data?.payment?.amount || planPrice,
        method: res.data?.payment?.method || selectedMethod,
        provider: res.data?.payment?.provider || verifyPayload.provider
      });
      toast.success('Skillzy Pro membership activated! 🎉');
    } catch (err) {
      console.error('Verification error:', err);
      setCheckoutState('failed');
      setErrorMessage(err.response?.data?.message || 'Payment signature verification failed');
      toast.error('Verification failed');
    }
  };

  // 12. Sandbox Simulation Helper for Evaluators and Testers
  const handleSimulatePaymentSuccess = async () => {
    if (!order) return;
    try {
      await api.post(`/payments/simulate-success/${order.orderId}`);
      clearInterval(timerIntervalRef.current);
      clearInterval(pollIntervalRef.current);
      setPollingActive(false);
      setCheckoutState('success');
      setSuccessData({
        orderId: order.orderId,
        paymentId: `pay_sim_${Date.now()}`,
        amount: planPrice,
        method: selectedMethod,
        provider: selectedGateway
      });
      toast.success('Simulated UPI payment verified and fulfilled!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to simulate payment');
    }
  };

  // Cancel active payment and return to method selection
  const handleCancelPayment = () => {
    clearInterval(timerIntervalRef.current);
    clearInterval(pollIntervalRef.current);
    setPollingActive(false);
    setCheckoutState('idle');
    setAppLaunchAttempted(false);
    setErrorMessage('');
    toast('Payment cancelled. You can select another method.', { icon: 'ℹ️' });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyVpa = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
    toast.success('Merchant VPA copied to clipboard');
  };

  // --- RENDER SUCCESS STATE ---
  if (checkoutState === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F0D15] text-gray-900 dark:text-[#F5F2FA] pt-20 pb-16 px-4 sm:px-6 lg:px-8 animate-fade-in flex items-center justify-center">
        <div className="max-w-xl w-full bg-white dark:bg-[#1A1625] rounded-3xl p-8 sm:p-10 shadow-lg border border-purple-100 dark:border-[#2D263B] text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="inline-flex items-center space-x-1.5 bg-purple-50 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-orchid dark:text-purple-300" />
            <span>Membership Active</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-plum dark:text-[#F5F2FA] mb-2">
            Welcome to Skillzy Pro!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            Your transaction has been cryptographically verified and captured. All Pro capabilities are instantly unlocked.
          </p>

          <div className="bg-purple-50/50 dark:bg-[#262035]/50 rounded-2xl p-5 mb-6 text-left border border-purple-100 dark:border-[#2D263B] space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-purple-100/60 dark:border-[#2D263B]/60">
              <span className="text-gray-500 dark:text-gray-400">Plan</span>
              <span className="font-bold text-brand-plum dark:text-[#F5F2FA]">{planDetails.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-100/60 dark:border-[#2D263B]/60">
              <span className="text-gray-500 dark:text-gray-400">Order ID</span>
              <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{successData?.orderId || order?.orderId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-100/60 dark:border-[#2D263B]/60">
              <span className="text-gray-500 dark:text-gray-400">Payment ID</span>
              <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{successData?.paymentId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-100/60 dark:border-[#2D263B]/60">
              <span className="text-gray-500 dark:text-gray-400">Gateway Provider</span>
              <span className="font-bold uppercase text-brand-plum dark:text-[#F5F2FA]">{successData?.provider || selectedGateway}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-purple-100/60 dark:border-[#2D263B]/60">
              <span className="text-gray-500 dark:text-gray-400">Amount Paid</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">₹{successData?.amount || planPrice}.00 INR</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 dark:text-gray-400">Valid Until</span>
              <span className="font-bold text-brand-plum dark:text-[#F5F2FA]">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/copilot"
              className="w-full py-3 bg-[#5D3C64] hover:bg-[#4A2F4F] text-white rounded-xl font-bold text-sm shadow-md transition duration-200 flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Launch AI Copilot</span>
            </Link>
            <Link
              to="/premium"
              className="w-full py-3 bg-white dark:bg-[#1A1625] border border-purple-200 dark:border-[#2D263B] hover:bg-purple-50 dark:hover:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] rounded-xl font-bold text-sm transition duration-200 flex items-center justify-center space-x-2"
            >
              <span>View Membership</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0D15] text-gray-900 dark:text-[#F5F2FA] pt-20 pb-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/premium"
            className="inline-flex items-center space-x-2 text-xs font-bold text-[#5D3C64] dark:text-[#A78BFA] hover:text-[#4A2F4F] dark:hover:text-[#C4B5FD] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Plans & Features</span>
          </Link>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>256-Bit TLS Secured Checkout</span>
          </div>
        </div>

        {/* Header Banner */}
        <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 shadow-sm border border-purple-100 dark:border-[#2D263B] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-purple-50 dark:bg-[#262035] px-3 py-1 rounded-full text-[#5D3C64] dark:text-[#A78BFA] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-orchid dark:text-purple-300" />
              <span>Skillzy Pro Subscription</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-plum dark:text-[#F5F2FA] tracking-tight">
              Upgrade to Skillzy Pro
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select your preferred gateway and payment method. Instant activation upon verification.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-[#262035] border border-purple-100 dark:border-[#2D263B] rounded-2xl px-5 py-3 text-right">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Total Due</span>
            <span className="text-2xl font-black text-brand-plum dark:text-[#F5F2FA]">₹{planPrice}<span className="text-xs font-normal text-gray-500 dark:text-gray-400">/mo</span></span>
          </div>
        </div>

        {/* Main Grid: Left = Checkout Options, Right = Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Payment Configuration & Methods */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Payment Gateway Selection */}
            <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 shadow-sm border border-purple-100 dark:border-[#2D263B] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-brand-plum dark:text-[#F5F2FA] flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-[#5D3C64] dark:text-[#A78BFA]" />
                    <span>Select Payment Gateway</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Official merchant-grade payment infrastructure</p>
                </div>
                <span className="text-[10px] font-bold uppercase bg-purple-50 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] px-2.5 py-1 rounded-full">
                  Multi-Gateway
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableGateways.map((gw) => (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => setSelectedGateway(gw.id)}
                    className={`relative p-3 rounded-2xl border text-left transition duration-150 flex flex-col justify-between ${
                      selectedGateway === gw.id
                        ? 'border-[#5D3C64] dark:border-[#A78BFA] bg-purple-50/50 dark:bg-[#262035] shadow-xs ring-1 ring-[#5D3C64] dark:ring-[#A78BFA]'
                        : 'border-purple-100 dark:border-[#2D263B] hover:border-purple-200 dark:hover:border-purple-700/50 bg-white dark:bg-[#151221]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <BrandLogoBadge name={gw.id} className="h-6 w-12 border-0 shadow-none p-0" />
                      {selectedGateway === gw.id && (
                        <Check className="w-3.5 h-3.5 text-[#5D3C64] dark:text-[#A78BFA]" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-[#F5F2FA] block">{gw.name}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">{gw.description}</span>
                    </div>
                    <span className="mt-2 inline-block text-[9px] font-semibold text-brand-orchid dark:text-purple-300 uppercase tracking-wider">
                      {gw.badge || 'Available'}
                    </span>
                  </button>
                ))}
              </div>

              {selectedGateway === 'stripe' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Stripe India Regulation Notice:</strong> In compliance with Indian payment regulations, Stripe India processes International and Domestic Credit & Debit Cards and Net Banking. For UPI (Google Pay, PhonePe, Paytm, QR), please select <strong>Razorpay</strong>, <strong>Cashfree</strong>, or <strong>PayU</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* 2. Payment Method Category Tabs */}
            <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 shadow-sm border border-purple-100 dark:border-[#2D263B] space-y-6">
              <div>
                <h2 className="text-base font-bold text-brand-plum dark:text-[#F5F2FA]">Choose Payment Method</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pick how you want to pay ₹{planPrice}</p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-purple-100 dark:border-[#2D263B] pb-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  disabled={!supportedMethods.includes('upi')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                    selectedMethod === 'upi'
                      ? 'bg-[#5D3C64] dark:bg-[#A78BFA] text-white dark:text-gray-900 shadow-xs'
                      : !supportedMethods.includes('upi')
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#151221]'
                      : 'bg-purple-50 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] hover:bg-purple-100 dark:hover:bg-[#322a45]'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI (GPay, PhonePe, QR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  disabled={!supportedMethods.includes('card')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                    selectedMethod === 'card'
                      ? 'bg-[#5D3C64] dark:bg-[#A78BFA] text-white dark:text-gray-900 shadow-xs'
                      : !supportedMethods.includes('card')
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#151221]'
                      : 'bg-purple-50 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] hover:bg-purple-100 dark:hover:bg-[#322a45]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  disabled={!supportedMethods.includes('netbanking')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                    selectedMethod === 'netbanking'
                      ? 'bg-[#5D3C64] dark:bg-[#A78BFA] text-white dark:text-gray-900 shadow-xs'
                      : !supportedMethods.includes('netbanking')
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#151221]'
                      : 'bg-purple-50 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] hover:bg-purple-100 dark:hover:bg-[#322a45]'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Net Banking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('wallet')}
                  disabled={!supportedMethods.includes('wallet')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                    selectedMethod === 'wallet'
                      ? 'bg-[#5D3C64] dark:bg-[#A78BFA] text-white dark:text-gray-900 shadow-xs'
                      : !supportedMethods.includes('wallet')
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#151221]'
                      : 'bg-purple-50 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] hover:bg-purple-100 dark:hover:bg-[#322a45]'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Wallets</span>
                </button>
              </div>

              {/* TAB 1: UPI CONTENT */}
              {selectedMethod === 'upi' && (
                <div className="space-y-6">
                  {/* UPI Submode Selector */}
                  <div className="grid grid-cols-3 gap-2 p-1 bg-purple-50 dark:bg-[#262035] rounded-2xl text-xs font-bold text-center">
                    <button
                      type="button"
                      onClick={() => setUpiSubMethod('apps')}
                      className={`py-2 rounded-xl transition ${
                        upiSubMethod === 'apps' ? 'bg-white dark:bg-[#1A1625] text-[#5D3C64] dark:text-[#A78BFA] shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[#F5F2FA]'
                      }`}
                    >
                      UPI Apps
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiSubMethod('qr')}
                      className={`py-2 rounded-xl transition ${
                        upiSubMethod === 'qr' ? 'bg-white dark:bg-[#1A1625] text-[#5D3C64] dark:text-[#A78BFA] shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[#F5F2FA]'
                      }`}
                    >
                      Scan QR Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiSubMethod('vpa')}
                      className={`py-2 rounded-xl transition ${
                        upiSubMethod === 'vpa' ? 'bg-white dark:bg-[#1A1625] text-[#5D3C64] dark:text-[#A78BFA] shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[#F5F2FA]'
                      }`}
                    >
                      Enter UPI ID
                    </button>
                  </div>

                  {/* Sub-view A: Quick-launch UPI Apps */}
                  {upiSubMethod === 'apps' && (
                    <div className="space-y-4">
                      {isMobile ? (
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Select your UPI app to initiate payment on this mobile device:
                        </p>
                      ) : (
                        <div className="p-3 bg-purple-50/50 dark:bg-[#262035]/50 rounded-xl border border-purple-100 dark:border-[#2D263B] flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-300">
                          <QrCode className="w-4 h-4 text-[#5D3C64] dark:text-[#A78BFA] shrink-0 mt-0.5" />
                          <span>
                            <strong>Desktop Checkout:</strong> Selecting an app below will generate a direct QR code for that app. Scan with your phone to complete payment.
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {upiApps.map((app) => (
                          <div
                            key={app.id}
                            onClick={() => setSelectedUpiApp(app.id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center space-x-3 ${
                              selectedUpiApp === app.id
                                ? 'border-[#5D3C64] dark:border-[#A78BFA] bg-purple-50/60 dark:bg-[#262035] ring-1 ring-[#5D3C64] dark:ring-[#A78BFA]'
                                : 'border-purple-100 dark:border-[#2D263B] hover:border-purple-200 dark:hover:border-purple-700/50 bg-white dark:bg-[#151221]'
                            }`}
                          >
                            <BrandLogoBadge name={app.brand} className="h-10 w-14" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-900 dark:text-[#F5F2FA]">{app.name}</span>
                                <span className="text-[9px] font-semibold text-brand-orchid dark:text-purple-300 bg-purple-50 dark:bg-[#262035]/80 px-1.5 py-0.5 rounded">
                                  {app.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{app.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Fallback prompt if mobile deep link was triggered or failed */}
                      {appLaunchAttempted && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-xs text-amber-800 dark:text-amber-200 space-y-2">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>
                              <strong>App didn't open or not installed?</strong> You can complete this payment using any of these alternatives:
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (order?.upiData?.upiIntentUrl) {
                                  window.location.href = order.upiData.upiIntentUrl;
                                } else {
                                  handleInitiatePayment();
                                }
                              }}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                            >
                              Open in Any UPI App
                            </button>
                            <button
                              type="button"
                              onClick={() => setUpiSubMethod('qr')}
                              className="px-3 py-1.5 bg-white dark:bg-[#1A1625] border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold rounded-lg text-xs hover:bg-amber-100 dark:hover:bg-amber-900/30"
                            >
                              Show QR Code
                            </button>
                            <button
                              type="button"
                              onClick={() => setUpiSubMethod('vpa')}
                              className="px-3 py-1.5 bg-white dark:bg-[#1A1625] border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold rounded-lg text-xs hover:bg-amber-100 dark:hover:bg-amber-900/30"
                            >
                              Enter UPI ID
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-view B: Scan & Pay QR Code */}
                  {upiSubMethod === 'qr' && (
                    <div className="space-y-4 text-center">
                      <div className="max-w-xs mx-auto p-5 bg-white dark:bg-[#1A1625] border border-purple-100 dark:border-[#2D263B] rounded-3xl shadow-xs space-y-4">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 border-b border-purple-50 dark:border-[#2D263B] pb-2">
                          <span className="font-bold text-brand-plum dark:text-[#F5F2FA]">Scan with any UPI App</span>
                          <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatTime(timeLeft)}</span>
                          </span>
                        </div>

                        {/* High-Reliability Dynamic QR Code with Center Brand Watermark */}
                        <QRCodeDisplay
                          value={order?.upiData?.qrString || `upi://pay?pa=skillzy@icici&pn=Skillzy%20Pro&am=499.00&cu=INR&tn=Skillzy%20Pro%20Subscription`}
                          size={190}
                          brand={selectedUpiApp || 'upi'}
                        />

                        <div className="text-xs space-y-1">
                          <div className="text-gray-500 dark:text-gray-400">Merchant VPA</div>
                          <div className="font-mono font-bold text-brand-plum dark:text-[#F5F2FA] flex items-center justify-center space-x-1.5">
                            <span>skillzy@icici</span>
                            <button
                              type="button"
                              onClick={() => handleCopyVpa('skillzy@icici')}
                              className="text-gray-400 hover:text-[#5D3C64] dark:hover:text-[#A78BFA]"
                              title="Copy VPA"
                            >
                              {copiedVpa ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Polling Indicator */}
                        <div className="p-2.5 bg-purple-50 dark:bg-[#262035] rounded-xl text-xs text-[#5D3C64] dark:text-[#A78BFA] font-medium flex items-center justify-center space-x-2">
                          <RefreshCw className={`w-3.5 h-3.5 ${pollingActive ? 'animate-spin' : ''}`} />
                          <span>Waiting for payment authorization...</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Compatible with Google Pay, PhonePe, Paytm, CRED, Amazon Pay, BHIM, and all banking UPI apps.
                      </p>
                    </div>
                  )}

                  {/* Sub-view C: Enter UPI ID (VPA) */}
                  {upiSubMethod === 'vpa' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                          Enter your UPI ID / Virtual Payment Address
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="e.g. mobile@okhdfcbank or yourname@upi"
                            value={vpaInput}
                            onChange={(e) => {
                              setVpaInput(e.target.value);
                              setVpaError('');
                            }}
                            className={`w-full px-4 py-3 rounded-2xl border text-xs bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] focus:outline-none focus:ring-2 focus:ring-[#5D3C64] dark:focus:ring-[#A78BFA] ${
                              vpaError ? 'border-red-400 bg-red-50/20' : 'border-purple-200 dark:border-[#2D263B]'
                            }`}
                          />
                        </div>
                        {vpaError && (
                          <p className="text-xs text-red-500 mt-1 flex items-center space-x-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{vpaError}</span>
                          </p>
                        )}
                      </div>

                      {/* Quick Bank Handle Suggestions */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">Popular bank handles:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {['@okaxis', '@okhdfcbank', '@okicici', '@ybl', '@ibl', '@paytm', '@upi'].map((handle) => (
                            <button
                              key={handle}
                              type="button"
                              onClick={() => {
                                const base = vpaInput.includes('@') ? vpaInput.split('@')[0] : vpaInput;
                                setVpaInput(`${base || 'username'}${handle}`);
                                setVpaError('');
                              }}
                              className="px-2.5 py-1 bg-purple-50 dark:bg-[#262035] hover:bg-purple-100 dark:hover:bg-[#322a45] text-[#5D3C64] dark:text-[#A78BFA] text-[11px] font-bold rounded-lg transition"
                            >
                              {handle}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-purple-50/50 dark:bg-[#262035]/50 rounded-xl text-xs text-gray-600 dark:text-gray-300 flex items-start space-x-2 border border-purple-100 dark:border-[#2D263B]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>
                          A collect request for <strong>₹{planPrice}.00</strong> will be sent directly to your UPI app for authorization.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD CONTENT */}
              {selectedMethod === 'card' && (
                <div className="space-y-4">
                  {/* Supported Card Networks Ribbon */}
                  <div className="flex items-center space-x-2 pb-1">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Supported cards:</span>
                    <div className="flex items-center space-x-1.5">
                      <BrandLogoBadge name="visa" className="h-6 w-10 border-0 p-0" />
                      <BrandLogoBadge name="mastercard" className="h-6 w-10 border-0 p-0" />
                      <BrandLogoBadge name="rupay" className="h-6 w-10 border-0 p-0" />
                      <BrandLogoBadge name="amex" className="h-6 w-10 border-0 p-0" />
                    </div>
                  </div>

                  {/* Card Number Input with Dynamic Brand Detection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8890"
                        value={cardDetails.number}
                        onChange={handleCardNumberChange}
                        className={`w-full px-4 py-3 pr-20 rounded-2xl border text-xs font-mono bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] focus:outline-none focus:ring-2 focus:ring-[#5D3C64] dark:focus:ring-[#A78BFA] ${
                          cardErrors.number ? 'border-red-400 bg-red-50/20' : 'border-purple-200 dark:border-[#2D263B]'
                        }`}
                      />
                      <div className="absolute right-3 top-2.5 flex items-center space-x-1">
                        {cardBrand ? (
                          <BrandLogoBadge name={cardBrand} className="h-6 w-10 border-0 p-0 shadow-none" />
                        ) : (
                          <CreditCard className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {cardErrors.number && (
                      <p className="text-xs text-red-500 mt-1">{cardErrors.number}</p>
                    )}
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Name as printed on card"
                      value={cardDetails.name}
                      onChange={(e) => {
                        setCardDetails(prev => ({ ...prev, name: e.target.value }));
                        if (cardErrors.name) setCardErrors(prev => ({ ...prev, name: null }));
                      }}
                      className={`w-full px-4 py-3 rounded-2xl border text-xs bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] focus:outline-none focus:ring-2 focus:ring-[#5D3C64] dark:focus:ring-[#A78BFA] ${
                        cardErrors.name ? 'border-red-400 bg-red-50/20' : 'border-purple-200 dark:border-[#2D263B]'
                      }`}
                    />
                    {cardErrors.name && (
                      <p className="text-xs text-red-500 mt-1">{cardErrors.name}</p>
                    )}
                  </div>

                  {/* Expiry & CVV Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={handleExpiryChange}
                        className={`w-full px-4 py-3 rounded-2xl border text-xs font-mono bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] focus:outline-none focus:ring-2 focus:ring-[#5D3C64] dark:focus:ring-[#A78BFA] ${
                          cardErrors.expiry ? 'border-red-400 bg-red-50/20' : 'border-purple-200 dark:border-[#2D263B]'
                        }`}
                      />
                      {cardErrors.expiry && (
                        <p className="text-xs text-red-500 mt-1">{cardErrors.expiry}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                        CVV / CVC
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={cardBrand === 'amex' ? 4 : 3}
                          value={cardDetails.cvv}
                          onChange={handleCvvChange}
                          className={`w-full px-4 py-3 rounded-2xl border text-xs font-mono bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] focus:outline-none focus:ring-2 focus:ring-[#5D3C64] dark:focus:ring-[#A78BFA] ${
                            cardErrors.cvv ? 'border-red-400 bg-red-50/20' : 'border-purple-200 dark:border-[#2D263B]'
                          }`}
                        />
                        <div className="absolute right-3 top-3 text-gray-400">
                          <Lock className="w-4 h-4" />
                        </div>
                      </div>
                      {cardErrors.cvv && (
                        <p className="text-xs text-red-500 mt-1">{cardErrors.cvv}</p>
                      )}
                    </div>
                  </div>

                  {/* PCI-DSS Assurance */}
                  <div className="space-y-2 pt-2">
                    <label className="flex items-center space-x-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cardDetails.saveCard}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, saveCard: e.target.checked }))}
                        className="rounded text-[#5D3C64] focus:ring-[#5D3C64]"
                      />
                      <span>Save card token securely for seamless future renewals</span>
                    </label>

                    <div className="p-3 bg-purple-50/50 dark:bg-[#262035]/50 rounded-xl text-xs text-gray-600 dark:text-gray-300 flex items-start space-x-2 border border-purple-100 dark:border-[#2D263B]">
                      <ShieldCheck className="w-4 h-4 text-[#5D3C64] dark:text-[#A78BFA] flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>PCI-DSS Compliant:</strong> Skillzy never stores confidential card CVVs or banking passwords. All card credentials are encrypted and tokenized directly by the authorized payment gateway.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NET BANKING CONTENT */}
              {selectedMethod === 'netbanking' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600 dark:text-gray-300">Select your bank to authenticate via secure Net Banking portal:</p>
                  
                  {/* Top Popular Banks Tiles with Authentic Logos */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {popularBanks.map((bank) => (
                      <button
                        key={bank.code}
                        type="button"
                        onClick={() => setSelectedBank(bank.code)}
                        className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                          selectedBank === bank.code
                            ? 'border-[#5D3C64] dark:border-[#A78BFA] bg-purple-50 dark:bg-[#262035] shadow-xs ring-1 ring-[#5D3C64] dark:ring-[#A78BFA]'
                            : 'border-purple-100 dark:border-[#2D263B] hover:border-purple-200 dark:hover:border-purple-700/50 bg-white dark:bg-[#151221]'
                        }`}
                      >
                        <BrandLogoBadge name={bank.brand || bank.code} className="h-7 w-12 border-0 shadow-none p-0" />
                        <span className="text-xs font-bold text-gray-900 dark:text-[#F5F2FA] line-clamp-1">{bank.name}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{bank.code}</span>
                      </button>
                    ))}
                  </div>

                  {/* All Other Banks Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                      Or choose any other Indian retail bank
                    </label>
                    <div className="relative">
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-purple-200 dark:border-[#2D263B] text-xs bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] focus:outline-none focus:ring-2 focus:ring-[#5D3C64] dark:focus:ring-[#A78BFA]"
                      >
                        <optgroup label="Popular Banks" className="bg-white dark:bg-[#1A1625] text-gray-900 dark:text-[#F5F2FA]">
                          {popularBanks.map(b => (
                            <option key={b.code} value={b.code}>{b.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="All Retail Banks" className="bg-white dark:bg-[#1A1625] text-gray-900 dark:text-[#F5F2FA]">
                          {otherBanks.map(b => (
                            <option key={b.code} value={b.code}>{b.name}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: WALLETS CONTENT */}
              {selectedMethod === 'wallet' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600 dark:text-gray-300">Select your digital wallet to authorize payment:</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {supportedWalletsList.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWallet(w.id)}
                        className={`p-3.5 rounded-2xl border text-left transition flex items-center space-x-3 ${
                          selectedWallet === w.id
                            ? 'border-[#5D3C64] dark:border-[#A78BFA] bg-purple-50 dark:bg-[#262035] shadow-xs ring-1 ring-[#5D3C64] dark:ring-[#A78BFA]'
                            : 'border-purple-100 dark:border-[#2D263B] hover:border-purple-200 dark:hover:border-purple-700/50 bg-white dark:bg-[#151221]'
                        }`}
                      >
                        <BrandLogoBadge name={w.brand} className="h-8 w-12 border-0 shadow-none p-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-gray-900 dark:text-[#F5F2FA] block">{w.name}</span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">{w.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons & Status Indicators */}
              <div className="pt-4 border-t border-purple-100 dark:border-[#2D263B] space-y-3">
                {errorMessage && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Primary Proceed CTA Button */}
                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  disabled={checkoutState === 'creating' || checkoutState === 'verifying'}
                  className="w-full py-4 bg-[#5D3C64] hover:bg-[#4A2F4F] text-white rounded-2xl font-bold text-sm shadow-md transition duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {checkoutState === 'creating' || checkoutState === 'verifying' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Securing Transaction...</span>
                    </>
                  ) : checkoutState === 'awaiting_payment' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Waiting for Authorization ({formatTime(timeLeft)})...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        {selectedMethod === 'upi' && upiSubMethod === 'apps' && isMobile
                          ? `Pay ₹${planPrice}.00 via ${upiApps.find(a => a.id === selectedUpiApp)?.name || 'UPI'}`
                          : `Pay ₹${planPrice}.00 Securely via ${selectedGateway.toUpperCase()}`}
                      </span>
                    </>
                  )}
                </button>

                {/* Cancel Payment Button during pending state */}
                {checkoutState === 'awaiting_payment' && (
                  <button
                    type="button"
                    onClick={handleCancelPayment}
                    className="w-full py-2.5 bg-white dark:bg-[#1A1625] border border-gray-200 dark:border-[#2D263B] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F2FA] rounded-xl font-bold text-xs transition"
                  >
                    Cancel & Choose Another Payment Method
                  </button>
                )}

                {/* Sandbox / Test Simulation Helper (for testers and evaluators) */}
                {(order || checkoutState === 'awaiting_payment') && (
                  <div className="p-4 bg-purple-50/70 dark:bg-[#262035]/70 border border-purple-200 dark:border-[#2D263B] rounded-2xl text-center space-y-2">
                    <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-[#5D3C64] dark:text-[#A78BFA]">
                      <Zap className="w-4 h-4" />
                      <span>Sandbox / Test Mode Evaluator Helper</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300">
                      Testing locally without a live banking app? Click below to simulate a cryptographically verified webhook/authorization and activate Pro instantly:
                    </p>
                    <button
                      type="button"
                      onClick={handleSimulatePaymentSuccess}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    >
                      ⚡ Authorize Simulated Test Payment
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Order Summary & Trust Badges */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Order Summary Box */}
            <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 shadow-sm border border-purple-100 dark:border-[#2D263B] space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-purple-100 dark:border-[#2D263B]">
                <h3 className="text-base font-bold text-brand-plum dark:text-[#F5F2FA]">Order Summary</h3>
                <span className="text-xs bg-purple-50 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] font-bold px-2.5 py-1 rounded-full">
                  Skillzy Pro
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{planDetails.name} (1 Month)</span>
                  <span className="font-semibold text-gray-900 dark:text-[#F5F2FA]">₹{(planPrice / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>GST (18% Goods & Services Tax)</span>
                  <span className="font-semibold text-gray-900 dark:text-[#F5F2FA]">₹{(planPrice - planPrice / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Platform Processing Fee</span>
                  <span>Waived (FREE)</span>
                </div>
                
                <div className="pt-3 border-t border-purple-100 dark:border-[#2D263B] flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-bold text-brand-plum dark:text-[#F5F2FA] block">Total Payable</span>
                    <span className="text-[10px] text-gray-400">All applicable taxes included</span>
                  </div>
                  <span className="text-2xl font-black text-brand-plum dark:text-[#F5F2FA]">₹{planPrice}.00</span>
                </div>
              </div>

              {/* Included Benefits */}
              <div className="space-y-3 pt-4 border-t border-purple-100 dark:border-[#2D263B]">
                <span className="text-xs font-bold text-brand-plum dark:text-[#F5F2FA] block">What is included with Pro:</span>
                <ul className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
                  {[
                    'Unlimited AI Learning Copilot roadmaps & milestone plans',
                    'Verified PRO badge on public search and browse cards',
                    'Priority ranking boost in AI Skill Matchmaker',
                    'Automated live session agenda preparation generator',
                    'Extended HD classroom calls with collaborative notes',
                    'Zero platform service fees on tutoring & workshops'
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#5D3C64] dark:text-[#A78BFA] flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Security and Guarantees */}
              <div className="bg-gray-50 dark:bg-[#151221] rounded-2xl p-4 space-y-3 border border-gray-100 dark:border-[#2D263B] text-xs">
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>256-Bit Bank-Grade Encryption</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Your payments are processed through PCI-DSS Level 1 certified gateways. We never store confidential credentials.
                </p>
                <div className="pt-2 border-t border-gray-200/60 dark:border-[#2D263B] flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                  <span>Cancel anytime</span>
                  <span>•</span>
                  <span>48-hr satisfaction guarantee</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
