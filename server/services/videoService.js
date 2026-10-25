/**
 * Skillzy 2.0 Video Classroom & LiveKit Architecture Service
 * Issues cryptographically signed room access tokens, enforces session authorization,
 * and validates provider environment configuration.
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Checks whether live LiveKit / external WebRTC credentials are configured
 */
function isLiveKitConfigured() {
  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = process.env;
  return Boolean(LIVEKIT_API_KEY && LIVEKIT_API_SECRET && LIVEKIT_URL);
}

/**
 * Creates a cryptographically signed room token for an authorized session participant
 * Compatible with LiveKit video grant standards.
 */
function generateRoomToken(user, session) {
  const isOrganizer = session.organizer.toString() === user._id.toString();
  const isParticipant = session.participant.toString() === user._id.toString();

  if (!isOrganizer && !isParticipant) {
    throw new Error('Unauthorized: User is not an authorized participant of this session');
  }

  const roomId = session.roomId;
  const participantIdentity = user._id.toString();
  const participantName = user.name || 'Participant';

  // LiveKit JWT Grant Structure
  const videoGrant = {
    room: roomId,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canPublishSources: ['camera', 'microphone', 'screen_share'],
    hidden: false
  };

  // If LiveKit credentials exist, sign with LIVEKIT_API_SECRET
  if (isLiveKitConfigured()) {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    const token = jwt.sign(
      {
        sub: participantIdentity,
        name: participantName,
        video: videoGrant,
        metadata: JSON.stringify({ role: isOrganizer ? 'organizer' : 'participant', isOrganizer })
      },
      apiSecret,
      {
        issuer: apiKey,
        expiresIn: '2h',
        algorithm: 'HS256'
      }
    );

    return {
      token,
      roomId,
      roomName: roomId,
      serverUrl: process.env.LIVEKIT_URL,
      provider: 'livekit_cloud',
      participant: {
        id: participantIdentity,
        name: participantName,
        isOrganizer
      }
    };
  }

  // Native Secure WebRTC Mesh / In-App Video Mode Token
  const signingKey = process.env.JWT_SECRET || 'skillzy_classroom_secret_key';
  const token = jwt.sign(
    {
      sub: participantIdentity,
      name: participantName,
      roomId,
      video: videoGrant,
      metadata: JSON.stringify({ isOrganizer })
    },
    signingKey,
    {
      expiresIn: '2h',
      algorithm: 'HS256'
    }
  );

  return {
    token,
    roomId,
    roomName: roomId,
    serverUrl: null,
    provider: 'native_webrtc',
    isTestMode: true,
    participant: {
      id: participantIdentity,
      name: participantName,
      isOrganizer
    }
  };
}

/**
 * Validates a room token for classroom entry
 */
function verifyRoomToken(token, roomId) {
  try {
    const secret = isLiveKitConfigured()
      ? process.env.LIVEKIT_API_SECRET
      : (process.env.JWT_SECRET || 'skillzy_classroom_secret_key');

    const decoded = jwt.verify(token, secret);
    if (decoded.video?.room !== roomId && decoded.roomId !== roomId) {
      return { valid: false, error: 'Token is for a different room' };
    }
    return { valid: true, payload: decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Helper to generate unique, secure room IDs
 */
function createUniqueRoomId(prefix = 'room') {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
}

module.exports = {
  isLiveKitConfigured,
  generateRoomToken,
  verifyRoomToken,
  createUniqueRoomId
};
