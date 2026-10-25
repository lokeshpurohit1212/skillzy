const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../config/db');
const app = require('../index');

const User = require('../models/User');
const Swap = require('../models/Swap');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Session = require('../models/Session');
const Roadmap = require('../models/Roadmap');
const Community = require('../models/Community');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const AnalyticsEvent = require('../models/AnalyticsEvent');

let server;
let baseUrl;

async function startServer() {
  return new Promise((resolve) => {
    // Listen on random available port
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      console.log(`Test server running at ${baseUrl}`);
      resolve();
    });
  });
}

async function stopServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

async function request(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const config = {
    method: options.method || 'GET',
    headers
  };
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, config);
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, data, headers: res.headers };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING SKILLZY FULL-STACK INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  try {
    await connectDB();
    await startServer();

    const timestamp = Date.now();
    const user1Email = `tester1_${timestamp}@skillzytest.com`;
    const user2Email = `tester2_${timestamp}@skillzytest.com`;
    const user3Email = `tester3_${timestamp}@skillzytest.com`;

    let user1Token, user1Id;
    let user2Token, user2Id;
    let user3Token;
    let swapId;

    // 1. Health check
    console.log('\n--- 1. API Health Check ---');
    const health = await request('/health');
    assert(health.status === 200, 'Health endpoint returns 200');
    assert(health.data?.database === 'connected', 'Database state is connected');

    // 2. Registration & Validation
    console.log('\n--- 2. User Registration & Auth ---');
    const invalidReg = await request('/auth/register', {
      method: 'POST',
      body: { name: 'A', email: 'invalid-email', password: '123' }
    });
    assert(invalidReg.status === 400, 'Rejects invalid registration data');

    const reg1 = await request('/auth/register', {
      method: 'POST',
      body: { name: 'Alice Developer', email: user1Email, password: 'Password123!' }
    });
    assert(reg1.status === 201, 'User 1 registered successfully (201)');
    assert(!!reg1.data?.token, 'Returns JWT token for User 1');
    assert(reg1.data?.user?.name === 'Alice Developer', 'User 1 public profile returned');
    user1Token = reg1.data.token;
    user1Id = reg1.data.user._id;

    // Duplicate registration check
    const dupReg = await request('/auth/register', {
      method: 'POST',
      body: { name: 'Alice Dup', email: user1Email, password: 'Password123!' }
    });
    assert(dupReg.status === 400, 'Rejects duplicate registration with existing email');

    // Login checks
    const badLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: user1Email, password: 'WrongPassword' }
    });
    assert(badLogin.status === 400, 'Rejects login with invalid credentials');

    const goodLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: user1Email, password: 'Password123!' }
    });
    assert(goodLogin.status === 200, 'User 1 logs in successfully (200)');

    // Protected route check
    const unauthMe = await request('/auth/me');
    assert(unauthMe.status === 401, 'Rejects protected route without token (401)');

    const authMe = await request('/auth/me', {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert(authMe.status === 200, 'Accepts protected route with valid token');
    assert(authMe.data?.user?.name === 'Alice Developer', 'Correct user profile returned');

    // 3. User 2 Registration
    console.log('\n--- 3. User 2 Registration ---');
    const reg2 = await request('/auth/register', {
      method: 'POST',
      body: { name: 'Bob Designer', email: user2Email, password: 'Password123!' }
    });
    assert(reg2.status === 201, 'User 2 registered successfully');
    user2Token = reg2.data.token;
    user2Id = reg2.data.user._id;

    // User 3 (unrelated user for authorization boundary testing)
    const reg3 = await request('/auth/register', {
      method: 'POST',
      body: { name: 'Eve Intruder', email: user3Email, password: 'Password123!' }
    });
    user3Token = reg3.data.token;

    // 4. Skills & Profile Management
    console.log('\n--- 4. Profile & Skill Management ---');
    // Alice offers Python, wants UI Design
    const addSkill1 = await request('/users/skills-offered', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: { name: 'Python Programming', description: 'Django and FastAPI development', proficiency: 'Advanced' }
    });
    assert(addSkill1.status === 200, 'Alice adds offered skill (Python)');

    const addWanted1 = await request('/users/skills-wanted', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: { name: 'UI Design', description: 'Figma and wireframing', priority: 'High' }
    });
    assert(addWanted1.status === 200, 'Alice adds wanted skill (UI Design)');

    // Bob offers UI Design, wants Python Programming
    const addSkill2 = await request('/users/skills-offered', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user2Token}` },
      body: { name: 'UI Design', description: 'Design systems and prototyping', proficiency: 'Expert' }
    });
    assert(addSkill2.status === 200, 'Bob adds offered skill (UI Design)');

    const addWanted2 = await request('/users/skills-wanted', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user2Token}` },
      body: { name: 'Python Programming', description: 'Backend automation', priority: 'High' }
    });
    assert(addWanted2.status === 200, 'Bob adds wanted skill (Python Programming)');

    // Alice updates bio & location
    const updateProfile = await request('/users/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: { bio: 'Passionate full-stack developer', location: 'Bengaluru, India' }
    });
    assert(updateProfile.status === 200, 'Alice updates profile bio and location');

    // 5. Skill Discovery & Search
    console.log('\n--- 5. Discovery & Search ---');
    const browseRes = await request('/users/browse?skill=Python');
    assert(browseRes.status === 200, 'Browse endpoint responds successfully');
    assert(Array.isArray(browseRes.data), 'Browse returns array of users');
    const foundAliceInBrowse = browseRes.data.some(u => u.name === 'Alice Developer');
    assert(foundAliceInBrowse, 'Alice is discoverable via skill filter');

    const searchRes = await request('/users/search?q=Design');
    assert(searchRes.status === 200, 'Search endpoint responds successfully');
    const foundBobInSearch = searchRes.data.some(u => u.name === 'Bob Designer');
    assert(foundBobInSearch, 'Bob is discoverable via skill search');

    // Complementary matching
    const matchRes = await request('/users/matches', {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert(matchRes.status === 200, 'Complementary matches endpoint responds successfully');
    const bobMatch = matchRes.data.find(u => u._id === user2Id);
    assert(!!bobMatch, 'Bob is identified as a match for Alice');
    assert(bobMatch?.isComplementary === true, 'Bob is correctly identified as a mutual complementary match');

    // 6. Skill Exchange Lifecycle
    console.log('\n--- 6. Skill Exchange Lifecycle & Rules ---');
    // Cannot swap with self
    const selfSwap = await request('/swaps', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        recipientId: user1Id,
        requestedSkill: { name: 'Python Programming' },
        offeredSkill: { name: 'Python Programming' },
        duration: 1
      }
    });
    assert(selfSwap.status === 400, 'Enforces rule: cannot request swap with oneself');

    // Alice requests swap with Bob
    const createSwap = await request('/swaps', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        recipientId: user2Id,
        requestedSkill: { name: 'UI Design' },
        offeredSkill: { name: 'Python Programming' },
        duration: 2,
        message: 'Excited to learn Figma UI design in exchange for Python lessons!'
      }
    });
    assert(createSwap.status === 201, 'Alice creates swap request with Bob (201)');
    swapId = createSwap.data?._id;
    assert(createSwap.data?.status === 'pending', 'Initial swap status is pending');
    assert(createSwap.data?.duration === 2, 'Swap duration is 2 hours');

    // Prevent duplicate active swap
    const dupSwap = await request('/swaps', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        recipientId: user2Id,
        requestedSkill: { name: 'UI Design' },
        offeredSkill: { name: 'Python Programming' },
        duration: 1
      }
    });
    assert(dupSwap.status === 400, 'Enforces rule: prevents duplicate active swap requests');

    // Check Bob received a notification for incoming swap request
    const bobNotifs = await request('/notifications', {
      headers: { Authorization: `Bearer ${user2Token}` }
    });
    assert(bobNotifs.status === 200, 'Bob fetches notifications');
    assert(bobNotifs.data?.unreadCount >= 1, 'Bob has unread notification');
    const swapReqNotif = bobNotifs.data?.notifications?.find(n => n.type === 'swap_request');
    assert(!!swapReqNotif, 'Bob received swap_request notification');

    // Bob accepts swap
    const acceptSwap = await request(`/swaps/${swapId}/accept`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user2Token}` }
    });
    assert(acceptSwap.status === 200, 'Bob accepts swap request (200)');
    assert(acceptSwap.data?.status === 'accepted', 'Swap status transitioned to accepted');

    // Alice receives accept notification
    const aliceNotifs = await request('/notifications', {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    const acceptedNotif = aliceNotifs.data?.notifications?.find(n => n.type === 'swap_accepted');
    assert(!!acceptedNotif, 'Alice received swap_accepted notification');

    // 7. Secure Messaging & Conversation
    console.log('\n--- 7. Messaging & Access Control ---');
    // Unauthorized user (Eve) cannot message in Alice & Bob's swap
    const eveMsg = await request('/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user3Token}` },
      body: { swapId, text: 'I am spying on your conversation!' }
    });
    assert(eveMsg.status === 403, 'Enforces conversation authorization: unauthorized user rejected (403)');

    // Alice sends message to Bob
    const aliceMsg = await request('/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: { swapId, text: 'Hi Bob, when are you free for our first Figma session?' }
    });
    assert(aliceMsg.status === 201, 'Alice sends message in swap (201)');
    assert(aliceMsg.data?.sender?.name === 'Alice Developer', 'Message sender identity persisted');

    // Bob sends reply
    const bobMsg = await request('/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user2Token}` },
      body: { swapId, text: 'Hi Alice! Saturday morning works great for me.' }
    });
    assert(bobMsg.status === 201, 'Bob replies in swap (201)');

    // Bob fetches messages
    const getMsgs = await request(`/messages/swap/${swapId}`, {
      headers: { Authorization: `Bearer ${user2Token}` }
    });
    assert(getMsgs.status === 200, 'Bob retrieves messages for swap');
    assert(getMsgs.data?.length === 2, 'All conversation messages persisted and retrieved');

    // 8. Swap Completion & Credit Transfer Integrity
    console.log('\n--- 8. Swap Completion & Time Credits ---');
    const completeRes = await request(`/swaps/${swapId}/complete`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user2Token}` }
    });
    assert(completeRes.status === 200, 'Swap marked completed and credits transferred (200)');
    assert(completeRes.data?.swap?.status === 'completed', 'Swap status is completed');

    // Verify credits: Alice spent 2 credits (5 - 2 = 3), Bob earned 2 credits (5 + 2 = 7)
    const aliceUser = await User.findById(user1Id);
    const bobUser = await User.findById(user2Id);
    assert(aliceUser.timeCredits === 3, `Alice credit balance deducted correctly: ${aliceUser.timeCredits} (expected 3)`);
    assert(bobUser.timeCredits === 7, `Bob credit balance credited correctly: ${bobUser.timeCredits} (expected 7)`);
    assert(aliceUser.swapsCompleted === 1, 'Alice swapsCompleted incremented');
    assert(bobUser.swapsCompleted === 1, 'Bob swapsCompleted incremented');

    // Verify transaction logs
    const aliceTx = await request('/transactions/my-transactions', {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert(aliceTx.status === 200, 'Alice retrieves transactions');
    assert(aliceTx.data?.length >= 1, 'Alice has transaction record');
    assert(aliceTx.data?.[0]?.type === 'spent', 'Alice transaction is recorded as spent');
    assert(aliceTx.data?.[0]?.credits === 2, 'Alice transaction amount is 2 credits');

    // 9. Reviews & Rating Restrictions
    console.log('\n--- 9. Reviews & Ratings ---');
    // Alice reviews Bob
    const aliceReview = await request(`/swaps/${swapId}/rate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: { rating: 5, comment: 'Bob was an exceptional Figma instructor! Very clear explanations.' }
    });
    assert(aliceReview.status === 200, 'Alice rates Bob (200)');

    // Cannot review the same swap twice
    const dupReview = await request(`/swaps/${swapId}/rate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: { rating: 4, comment: 'Trying to rate again' }
    });
    assert(dupReview.status === 400, 'Enforces rule: cannot submit duplicate review for same swap');

    // Bob profile reflects rating
    const bobProfile = await request(`/users/${user2Id}`);
    assert(bobProfile.data?.ratingAverage === 5, 'Bob average rating updated to 5.0');
    assert(bobProfile.data?.ratingCount === 1, 'Bob review count updated to 1');
    assert(bobProfile.data?.recentReviews?.length === 1, 'Review appears in recent reviews');

    // 10. Swap Cancellation Lifecycle
    console.log('\n--- 10. Swap Cancellation Lifecycle ---');
    const swap2 = await request('/swaps', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        recipientId: user2Id,
        requestedSkill: { name: 'UI Design' },
        offeredSkill: { name: 'Python Programming' },
        duration: 1,
        message: 'Second test swap to test cancellation.'
      }
    });
    assert(swap2.status === 201, 'Created second test swap');
    const swap2Id = swap2.data?._id;

    const cancelRes = await request(`/swaps/${swap2Id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert(cancelRes.status === 200, 'Requester successfully cancels pending swap');
    assert(cancelRes.data?.status === 'cancelled', 'Swap status changed to cancelled');

    // Cannot cancel already cancelled swap
    const cancelAgain = await request(`/swaps/${swap2Id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert(cancelAgain.status === 400, 'Cannot cancel already cancelled swap');

    // 11. Admin Access Control
    let adminToken;
    if (process.env.ADMIN_ID && process.env.ADMIN_PASS) {
      console.log('\n--- 11. Admin Access Control ---');
      const adminLogin = await request('/auth/login', {
        method: 'POST',
        body: { email: process.env.ADMIN_ID, password: process.env.ADMIN_PASS }
      });
      assert(adminLogin.status === 200, 'Admin logs in successfully');
      assert(adminLogin.data?.user?.isAdmin === true, 'Admin status verified');
      adminToken = adminLogin.data?.token;
      const allUsers = await request('/users/all', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(allUsers.status === 200, 'Admin accesses /users/all');
    }

    // 12. Skillzy 2.0 — AI Matchmaker
    console.log('\n--- 12. Skillzy 2.0: AI Matchmaker Engine ---');
    const aiMatchRes = await request('/matchmaker/recommendations', {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert(aiMatchRes.status === 200, 'Matchmaker recommendations returns 200');
    assert(Array.isArray(aiMatchRes.data?.recommendations), 'Returns recommendations array');
    if (aiMatchRes.data?.recommendations?.length > 0) {
      const firstRec = aiMatchRes.data.recommendations[0];
      assert(typeof (firstRec.score ?? firstRec.matchScore) === 'number', 'Recommendation includes numeric match score');
      assert(Array.isArray(firstRec.reasons), 'Recommendation includes explainable compatibility reasons');
    }

    // 13. Skillzy 2.0: Smart Session Scheduling & Overlap Conflict Prevention
    console.log('\n--- 13. Skillzy 2.0: Smart Session Scheduling & Overlap Prevention ---');
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    futureDate.setMinutes(0, 0, 0);

    const bookRes = await request('/sessions/book', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        participantId: user2Id,
        skillTopic: 'Python Machine Learning & Algorithms',
        scheduledAt: futureDate.toISOString(),
        durationMinutes: 60,
        notes: 'Introductory deep dive session'
      }
    });
    assert(bookRes.status === 201, 'Live session booked successfully');
    assert(bookRes.data?.session?.status === 'scheduled', 'Session status is scheduled');
    const sessionId = bookRes.data?.session?._id;
    assert(Boolean(sessionId), 'Session ID generated');

    // Attempt double-booking in overlapping interval (15 mins into the scheduled hour)
    const overlappingDate = new Date(futureDate.getTime() + 15 * 60 * 1000);
    const overlapRes = await request('/sessions/book', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        participantId: user2Id,
        skillTopic: 'Overlapping Session Attempt',
        scheduledAt: overlappingDate.toISOString(),
        durationMinutes: 45
      }
    });
    assert(overlapRes.status === 409 || overlapRes.status === 400, 'Overlap conflict engine prevents double-booking');

    // Fetch user sessions
    const mySessions = await request('/sessions', {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert(mySessions.status === 200, 'List sessions returns 200');
    assert(Array.isArray(mySessions.data) && mySessions.data.length >= 1, 'Booked session appears in sessions list');

    // 14. Skillzy 2.0: Virtual Classroom Room Access Token
    console.log('\n--- 14. Skillzy 2.0: Virtual Classroom Room Access Token ---');
    const tokenRes = await request(`/sessions/${sessionId}/token`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert(tokenRes.status === 200, 'Classroom token generated successfully');
    assert(Boolean(tokenRes.data?.token), 'Signed room JWT token returned');
    assert(Boolean(tokenRes.data?.roomName), 'Virtual classroom roomName returned');
    assert(Boolean(tokenRes.data?.provider), 'Classroom media provider specified');

    // 15. Skillzy 2.0: AI Learning Copilot Roadmap & Milestones
    console.log('\n--- 15. Skillzy 2.0: AI Learning Copilot Roadmap ---');
    const roadmapRes = await request('/copilot/roadmap', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        skillName: 'Full-Stack React & Node.js System Design',
        currentProficiency: 'Beginner',
        targetProficiency: 'Advanced',
        weeklyCommitmentHours: 8
      }
    });
    assert(roadmapRes.status === 201, 'AI Copilot roadmap created successfully');
    assert(Array.isArray(roadmapRes.data?.roadmap?.milestones), 'Roadmap contains structured milestones');
    const roadmapId = roadmapRes.data?.roadmap?._id;
    const firstMilestoneId = roadmapRes.data?.roadmap?.milestones?.[0]?.id;

    if (roadmapId && firstMilestoneId) {
      const updateMilestone = await request(`/copilot/roadmaps/${roadmapId}/milestone/${firstMilestoneId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user1Token}` },
        body: { completed: true }
      });
      assert(updateMilestone.status === 200, 'Milestone completion toggled successfully');
      assert((updateMilestone.data?.progressPercentage ?? updateMilestone.data?.roadmap?.progressPercentage) > 0, 'Roadmap progress percentage updated');
    }

    // 16. Skillzy 2.0: Gamification, Badges & Leaderboard
    console.log('\n--- 16. Skillzy 2.0: Gamification & Leaderboard ---');
    const gamificationRes = await request('/gamification/me', {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert(gamificationRes.status === 200, 'Gamification profile returns 200');
    assert(typeof gamificationRes.data?.xp === 'number', 'Numeric XP tracked');
    assert(typeof gamificationRes.data?.level === 'number', 'User level computed');

    const leaderboardRes = await request('/gamification/leaderboard');
    assert(leaderboardRes.status === 200, 'Leaderboard returns 200');
    assert(Array.isArray(leaderboardRes.data), 'Leaderboard returns user rankings');

    // 17. Skillzy 2.0: Verified Skill Portfolio
    console.log('\n--- 17. Skillzy 2.0: Verified Skill Portfolio ---');
    const portfolioRes = await request('/users/portfolio', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        title: 'Skillzy Full-Stack Platform',
        description: 'AI-powered collaborative skill exchange platform with WebRTC classroom',
        projectUrl: 'https://github.com/skillzy/showcase',
        skillsUsed: ['React', 'Node.js', 'MongoDB', 'WebRTC']
      }
    });
    assert(portfolioRes.status === 201, 'Portfolio project added successfully');
    assert(portfolioRes.data?.[0]?.title === 'Skillzy Full-Stack Platform', 'Portfolio title preserved');

    // 18. Skillzy 2.0 / Pro: Multi-Gateway, UPI App, Banking & Card Checkout
    console.log('\n--- 18. Skillzy Pro: Multi-Gateway, UPI, Banking & Polling ---');
    const configRes = await request('/payments/config');
    assert(configRes.status === 200, 'Payments config returned successfully');
    assert(Array.isArray(configRes.data?.plans), 'Pricing catalog plans available');
    assert(Array.isArray(configRes.data?.gateways), 'Multi-gateway registry returned');
    assert(configRes.data.gateways.some(g => g.id === 'razorpay'), 'Razorpay gateway present');
    assert(configRes.data.gateways.some(g => g.id === 'cashfree'), 'Cashfree gateway present');
    assert(configRes.data.gateways.some(g => g.id === 'payu'), 'PayU gateway present');
    assert(configRes.data.gateways.some(g => g.id === 'stripe'), 'Stripe gateway present');
    assert(Array.isArray(configRes.data?.supportedBanks), 'Supported Indian banks list provided');
    assert(Array.isArray(configRes.data?.supportedWallets), 'Supported wallets list provided');

    // 18a. Legacy Razorpay & Generic Order Creation
    const orderRes = await request('/payments/create-order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        purpose: 'premium_membership',
        amount: 499,
        provider: 'razorpay',
        method: 'upi'
      }
    });
    assert(orderRes.status === 201 || orderRes.status === 200, 'Razorpay membership order created');
    assert(Boolean(orderRes.data?.order?.orderId), 'Order ID issued');
    const orderId = orderRes.data?.order?.orderId;
    assert(orderRes.data?.order?.upiData?.upiIntentUrl?.startsWith('upi://pay?'), 'NPCI-compliant UPI URI generated');
    assert(Boolean(orderRes.data?.order?.upiData?.qrString), 'QR code string provided');
    assert(Boolean(orderRes.data?.order?.upiData?.gpayIntent), 'Google Pay mobile intent generated');
    assert(Boolean(orderRes.data?.order?.upiData?.phonepeIntent), 'PhonePe mobile intent generated');
    assert(Boolean(orderRes.data?.order?.upiData?.paytmIntent), 'Paytm mobile intent generated');
    assert(Boolean(orderRes.data?.order?.upiData?.bhimIntent), 'BHIM mobile intent generated');
    assert(orderRes.data?.order?.upiData?.payeeVpa === 'skillzy@icici', 'Merchant UPI VPA is skillzy@icici');

    // 18b. Cashfree Gateway & UPI Intent Testing
    const cfOrderRes = await request('/payments/create-order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        purpose: 'premium_membership',
        amount: 499,
        provider: 'cashfree',
        method: 'upi'
      }
    });
    assert(cfOrderRes.status === 201, 'Cashfree unified order created');
    assert(Boolean(cfOrderRes.data?.order?.paymentSessionId), 'Cashfree payment session ID issued');

    // 18c. PayU Gateway & Card Order Testing
    const payuOrderRes = await request('/payments/create-order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        purpose: 'premium_membership',
        amount: 499,
        provider: 'payu',
        method: 'card',
        methodDetails: { cardBrand: 'visa', cardLast4: '4242' }
      }
    });
    assert(payuOrderRes.status === 201, 'PayU unified card order created');
    assert(Boolean(payuOrderRes.data?.order?.paymentHash), 'PayU cryptographic hash generated');

    // 18d. Stripe Gateway & Net Banking Order Testing
    const stripeOrderRes = await request('/payments/create-order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        purpose: 'premium_membership',
        amount: 499,
        provider: 'stripe',
        method: 'netbanking',
        methodDetails: { bank: 'HDFC' }
      }
    });
    assert(stripeOrderRes.status === 201, 'Stripe unified netbanking order created');
    assert(Boolean(stripeOrderRes.data?.order?.clientSecret), 'Stripe client secret generated');

    // 18e. Real-Time Status Polling Endpoint
    const statusRes = await request(`/payments/status/${orderId}`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert(statusRes.status === 200, 'Real-time payment status queried');
    assert(statusRes.data?.found === true, 'Order found in payment status check');
    assert(statusRes.data?.status === 'created', 'Initial payment status is created');

    // 18f. Simulated UPI / Dev Sandbox Authorization Polling Simulation
    const simSuccessRes = await request(`/payments/simulate-success/${orderId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert(simSuccessRes.status === 200, 'Sandbox UPI payment simulation succeeded');
    assert(simSuccessRes.data?.payment?.status === 'captured', 'Simulated payment marked captured');

    // Verify polling now reports captured and Pro active
    const polledPaidRes = await request(`/payments/status/${orderId}`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert(polledPaidRes.data?.isPaid === true, 'Real-time status polling reports isPaid true');
    assert(polledPaidRes.data?.isPro === true, 'Real-time status polling reports isPro true');

    // 18g. Direct Signature Verification Endpoint with Unified Payload
    const secondOrderRes = await request('/payments/create-order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user2Token}` },
      body: {
        purpose: 'premium_membership',
        amount: 499,
        provider: 'cashfree',
        method: 'upi'
      }
    });
    const secondOrderId = secondOrderRes.data?.order?.orderId;
    const verifyPayRes = await request('/payments/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user2Token}` },
      body: {
        provider: 'cashfree',
        orderId: secondOrderId,
        paymentId: `cf_pay_test_${Date.now()}`,
        signature: 'mock_valid_signature'
      }
    });
    assert(verifyPayRes.status === 200, 'Unified payment signature verified and fulfilled');
    assert(verifyPayRes.data?.payment?.status === 'captured', 'Payment marked as captured in audit ledger');
    assert(verifyPayRes.data?.user?.membership === 'premium', 'User 2 membership upgraded to Premium');

    // 18h. Idempotent repeated verification check
    const repeatVerifyRes = await request('/payments/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user2Token}` },
      body: {
        provider: 'cashfree',
        orderId: secondOrderId,
        paymentId: `cf_pay_test_repeat`,
        signature: 'mock_valid_signature'
      }
    });
    assert(repeatVerifyRes.status === 200, 'Repeated verification is idempotent and returns 200');

    // 18i. Strict amount mismatch verification rejection
    const mismatchOrderRes = await request('/payments/create-order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user2Token}` },
      body: { purpose: 'premium_membership', amount: 499, provider: 'cashfree' }
    });
    const mismatchOrderId = mismatchOrderRes.data?.order?.orderId;
    const mismatchVerifyRes = await request('/payments/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user2Token}` },
      body: {
        provider: 'cashfree',
        orderId: mismatchOrderId,
        paymentId: 'cf_pay_mismatch',
        signature: 'mock_valid_signature',
        additionalParams: { amount: 100 } // Wrong amount passed to verification
      }
    });
    assert(mismatchVerifyRes.status === 400, 'Rejects verification with mismatched order amount (400)');

    // 18j. Auditable Payment History
    const historyRes = await request('/payments/history', {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert(historyRes.status === 200, 'Payment audit history retrieved');
    assert(Array.isArray(historyRes.data) && historyRes.data.length > 0, 'Audit history contains captured transactions');

    // 19. Skillzy 2.0: Skill Communities & Discussions
    console.log('\n--- 19. Skillzy 2.0: Skill Communities & Discussions ---');
    const commRes = await request('/communities', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        name: `Skill Guild ${timestamp}`,
        description: 'Community for advanced skill development and project collaboration.',
        category: 'Technology'
      }
    });
    assert(commRes.status === 201, 'Skill community created successfully');
    const communityId = commRes.data?.community?._id;

    if (communityId) {
      const joinRes = await request(`/communities/${communityId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user2Token}` }
      });
      assert(joinRes.status === 200, 'Second user joined skill community');

      const discRes = await request(`/communities/${communityId}/discussions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user1Token}` },
        body: {
          title: 'Welcome to the skill circle',
          content: 'Feel free to share what skills you are learning this week.'
        }
      });
      assert(discRes.status === 201, 'Discussion thread posted to community');
    }

    // 20. Skillzy 2.0: Analytics Telemetry & Admin Overview
    console.log('\n--- 20. Skillzy 2.0: Telemetry & Admin Overview ---');
    const eventRes = await request('/analytics/event', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Token}` },
      body: {
        eventType: 'session_attended',
        metadata: { sessionId, durationMinutes: 60 }
      }
    });
    assert(eventRes.status === 201, 'Analytics telemetry event ingested');

    const userAnalytics = await request('/analytics/user', {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    assert(userAnalytics.status === 200, 'User personal analytics retrieved');
    assert(userAnalytics.data?.membership === 'premium', 'User analytics reflects Premium status');

    if (adminToken) {
      const adminOverview = await request('/admin/overview', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(adminOverview.status === 200, 'Admin 2.0 overview metrics retrieved');
      assert(typeof adminOverview.data?.metrics?.totalSessions === 'number', 'Admin metrics includes totalSessions');
      assert(adminOverview.data?.providerHealth?.database === 'connected', 'Admin health shows database connected');
    }

    // 21. Cleanup Test Records
    console.log('\n--- 21. Cleaning Up Test Records ---');
    await User.deleteMany({ _id: { $in: [user1Id, user2Id, reg3.data?.user?._id] } });
    await Swap.deleteMany({ _id: { $in: [swapId, swap2Id] } });
    await Transaction.deleteMany({ user: { $in: [user1Id, user2Id] } });
    await Message.deleteMany({ swap: { $in: [swapId, swap2Id] } });
    await Notification.deleteMany({ user: { $in: [user1Id, user2Id] } });
    if (sessionId) await Session.deleteMany({ _id: sessionId });
    if (roadmapId) await Roadmap.deleteMany({ _id: roadmapId });
    if (communityId) await Community.deleteMany({ _id: communityId });
    await Payment.deleteMany({ user: { $in: [user1Id, user2Id] } });
    await AnalyticsEvent.deleteMany({ user: { $in: [user1Id, user2Id] } });
    console.log('  ✅ Test records cleaned up successfully.');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    await stopServer();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
