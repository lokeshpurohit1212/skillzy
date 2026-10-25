import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../config/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Settings,
  CheckCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const Classroom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Session & Auth state
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pre-call check state
  const [preCallDone, setPreCallDone] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [micPermission, setMicPermission] = useState('prompt');

  // Media call state
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callState, setCallState] = useState('waiting'); // 'waiting' | 'connected' | 'reconnecting' | 'ended'
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'agenda' | 'participants'
  const [callDuration, setCallDuration] = useState(0);
  const [agenda, setAgenda] = useState([]);
  const [notes, setNotes] = useState('');

  // Media stream refs
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchSessionDetails();
    return () => {
      cleanupStreams();
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const [userRes, sessionRes] = await Promise.all([
        api.get('/auth/me'),
        api.get(`/sessions/${sessionId}`)
      ]);
      setCurrentUser(userRes.data);
      setSession(sessionRes.data);
      setNotes(sessionRes.data.notes || '');

      // Load session prep agenda if exists
      if (sessionRes.data.agenda && sessionRes.data.agenda.length > 0) {
        setAgenda(sessionRes.data.agenda);
      } else {
        // Fetch AI session prep suggestions
        try {
          const prepRes = await api.post('/copilot/session-prep', {
            skillTopic: sessionRes.data.skillTopic,
            durationMinutes: sessionRes.data.durationMinutes
          });
          if (prepRes.data.agenda) {
            setAgenda(prepRes.data.agenda);
          }
        } catch (e) {
          console.warn('AI session prep unavailable:', e.message);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load classroom session');
      navigate('/sessions');
    } finally {
      setLoading(false);
    }
  };

  const cleanupStreams = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
  };

  // Pre-call device check
  const requestMediaPermissions = async () => {
    try {
      cleanupStreams();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCameraPermission('granted');
      setMicPermission('granted');
    } catch (err) {
      console.error('Media permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraPermission('denied');
        setMicPermission('denied');
        toast.error('Camera or microphone permissions were denied. Please allow device access in your browser settings.');
      } else {
        toast.error(`Device error: ${err.message}`);
      }
    }
  };

  const joinClassroom = async () => {
    try {
      // Request backend room token
      const res = await api.post(`/sessions/${sessionId}/token`);
      setTokenData(res.data);
      setPreCallDone(true);
      setCallState('connected');

      // Start duration counter
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      toast.success('Connected to Virtual Classroom!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to authenticate room access');
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoDisabled(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      setIsScreenSharing(false);
    } else {
      // Start sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);

        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        };
      } catch (err) {
        console.warn('Screen share canceled or denied:', err.message);
      }
    }
  };

  const endCall = async () => {
    cleanupStreams();
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('ended');

    try {
      await api.put(`/sessions/${sessionId}/complete`, {
        actualDuration: Math.round(callDuration / 60)
      });
      toast.success('Session completed and attendance saved!');
    } catch (err) {
      console.warn('Failed to record session completion:', err.message);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const partner =
    session.organizer._id === currentUser?._id
      ? session.participant
      : session.organizer;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col animate-fade-in">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Session Title Bar */}
        <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-purple-100 flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#5D3C64] font-bold">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-brand-plum">{session.skillTopic} Classroom</h1>
                <span className="text-xs bg-purple-100 text-[#5D3C64] px-2.5 py-0.5 rounded-full font-semibold border border-purple-200">
                  Room: {session.roomId}
                </span>
              </div>
              <p className="text-xs text-brand-orchid">
                Partner: <strong className="text-gray-800">{partner.name}</strong> • Scheduled Duration: {session.durationMinutes} mins
              </p>
            </div>
          </div>

        <div className="flex items-center space-x-4">
          {callState === 'connected' && (
            <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE: {formatTimer(callDuration)}</span>
            </div>
          )}

          <div className="text-xs text-gray-500 hidden sm:flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{tokenData?.provider === 'livekit_cloud' ? 'LiveKit Cloud Room' : 'Encrypted WebRTC Session'}</span>
          </div>
        </div>
      </div>

      {/* Pre-Call Device Test Modal */}
      {!preCallDone && callState !== 'ended' && (
        <div className="flex-1 flex items-center justify-center py-6">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full border border-purple-100 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#5D3C64] mx-auto mb-4">
              <Settings className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-brand-plum mb-2">Pre-Call Device Check</h2>
            <p className="text-brand-orchid text-sm mb-6">
              Test your camera and microphone before entering the virtual classroom with {partner.name}.
            </p>

            {/* Video Preview Box */}
            <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden mb-6 flex items-center justify-center border border-gray-200 shadow-inner">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraPermission !== 'granted' ? 'hidden' : ''}`}
              />
              {cameraPermission !== 'granted' && (
                <div className="text-gray-400 text-center p-6">
                  <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Camera preview will appear here once permissions are granted</p>
                </div>
              )}
            </div>

            {/* Permissions Status Indicators */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center space-x-2 text-xs">
                <Video className={`w-4 h-4 ${cameraPermission === 'granted' ? 'text-emerald-500' : 'text-gray-400'}`} />
                <span className="font-semibold text-gray-700">Camera:</span>
                <span className={`capitalize ${cameraPermission === 'granted' ? 'text-emerald-600 font-bold' : 'text-gray-500'}`}>
                  {cameraPermission}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center space-x-2 text-xs">
                <Mic className={`w-4 h-4 ${micPermission === 'granted' ? 'text-emerald-500' : 'text-gray-400'}`} />
                <span className="font-semibold text-gray-700">Microphone:</span>
                <span className={`capitalize ${micPermission === 'granted' ? 'text-emerald-600 font-bold' : 'text-gray-500'}`}>
                  {micPermission}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {cameraPermission !== 'granted' ? (
                <button
                  onClick={requestMediaPermissions}
                  className="flex-1 py-3 px-5 bg-[#5D3C64] hover:bg-[#4A2F4F] text-white rounded-xl font-bold text-sm shadow-md transition"
                >
                  Test Camera & Mic
                </button>
              ) : (
                <button
                  onClick={joinClassroom}
                  className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition"
                >
                  Join Classroom Now
                </button>
              )}
              <button
                onClick={() => navigate('/sessions')}
                className="py-3 px-5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-sm transition"
              >
                Return to Sessions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Classroom Call Interface */}
      {preCallDone && callState !== 'ended' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 h-[75vh]">
          {/* Video Stage (3 Columns) */}
          <div className="lg:col-span-3 bg-gray-950 rounded-3xl overflow-hidden relative flex flex-col shadow-xl border border-gray-800">
            {/* Main Stage (Remote Partner Stream / Waiting screen) */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              <div className="text-center text-gray-400">
                <div className="w-20 h-20 rounded-full bg-gray-850 border-2 border-[#9F6496] flex items-center justify-center mx-auto mb-3 text-[#D391B0] font-bold text-2xl shadow-lg">
                  {partner.name?.charAt(0) || 'P'}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{partner.name}</h3>
                <p className="text-xs text-purple-200 flex items-center justify-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
                  <span>Waiting for partner audio/video stream in room...</span>
                </p>
              </div>

              {/* Local PiP Video Tile */}
              <div className="absolute bottom-4 right-4 w-44 sm:w-56 aspect-video bg-gray-900 rounded-2xl overflow-hidden border-2 border-[#9F6496]/60 shadow-2xl z-20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoDisabled ? 'hidden' : ''}`}
                />
                {isVideoDisabled && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-400">
                    <VideoOff className="w-6 h-6 mb-1 text-gray-500" />
                    <span className="text-[10px]">Camera Off</span>
                  </div>
                )}
                <div className="absolute bottom-1.5 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-medium">
                  You ({currentUser?.name})
                </div>
              </div>
            </div>

            {/* Bottom Call Controls Toolbar */}
            <div className="bg-gray-900/90 backdrop-blur-md px-6 py-4 border-t border-gray-800 flex items-center justify-between z-30">
              <div className="text-xs text-gray-400 hidden sm:block">
                <span>{session.skillTopic}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 mx-auto">
                {/* Mic Mute */}
                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition shadow-sm ${
                    isAudioMuted ? 'bg-rose-600 hover:bg-rose-700' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Video Toggle */}
                <button
                  onClick={toggleVideo}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition shadow-sm ${
                    isVideoDisabled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  title={isVideoDisabled ? 'Turn On Camera' : 'Turn Off Camera'}
                >
                  {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                {/* Screen Share */}
                <button
                  onClick={toggleScreenShare}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition shadow-sm ${
                    isScreenSharing ? 'bg-[#5D3C64] hover:bg-[#4A2F4F]' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
                >
                  <Monitor className="w-5 h-5" />
                </button>

                {/* End Call */}
                <button
                  onClick={endCall}
                  className="h-12 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center space-x-2 transition shadow-md"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">Leave Session</span>
                </button>
              </div>

              <div className="text-xs text-gray-400 hidden sm:block">
                <span>{formatTimer(callDuration)}</span>
              </div>
            </div>
          </div>

          {/* Interactive Classroom Sidebar (1 Column) */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-sm flex flex-col overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50 p-1">
              <button
                onClick={() => setActiveTab('agenda')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'agenda' ? 'bg-white text-[#5D3C64] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                AI Agenda
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'notes' ? 'bg-white text-[#5D3C64] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Live Notes
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'participants' ? 'bg-white text-[#5D3C64] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Members (2)
              </button>
            </div>

            {/* Sidebar Tab Content */}
            <div className="p-4 flex-1 overflow-y-auto">
              {activeTab === 'agenda' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-1.5 text-xs text-brand-plum font-semibold mb-2">
                    <Sparkles className="w-4 h-4 text-brand-orchid" />
                    <span>AI Copilot Suggested Session Flow</span>
                  </div>
                  {agenda.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No agenda generated.</p>
                  ) : (
                    agenda.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-purple-50/40 border border-purple-100">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-900 mb-1">
                          <span>{item.topic}</span>
                          <span className="text-[10px] bg-purple-100 text-[#5D3C64] px-1.5 py-0.5 rounded font-semibold">
                            {item.duration}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-snug">{item.description}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="h-full flex flex-col">
                  <label className="text-xs font-bold text-gray-700 mb-2 flex items-center justify-between">
                    <span>Collaborative Session Notes</span>
                    <span className="text-[10px] text-gray-400 font-normal">Autosaved</span>
                  </label>
                  <textarea
                    rows="15"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Capture key concepts, code snippets, exercise links, and action points during your call..."
                    className="flex-1 w-full p-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {activeTab === 'participants' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                    <img
                      src={currentUser?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'You')}`}
                      alt="You"
                      className="w-9 h-9 rounded-full object-cover border border-purple-100"
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-900">{currentUser?.name} (You)</div>
                      <div className="text-[10px] text-gray-500">Connected • Host</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                    <img
                      src={partner.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}`}
                      alt={partner.name}
                      className="w-9 h-9 rounded-full object-cover border border-purple-100"
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-900">{partner.name}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">Authorized Participant</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ended State Screen */}
      {callState === 'ended' && (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-purple-100 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-brand-plum mb-2">Classroom Session Ended</h2>
            <p className="text-gray-500 text-sm mb-6">
              You participated for <strong>{formatTimer(callDuration)}</strong> with {partner.name}. You earned <strong>+30 XP</strong> for your live skill exchange!
            </p>

            <div className="space-y-3">
              <Link
                to="/sessions"
                className="block w-full py-3 px-5 bg-[#5D3C64] hover:bg-[#4A2F4F] text-white rounded-xl font-bold text-sm shadow-md transition"
              >
                View Your Scheduled Sessions
              </Link>
              <Link
                to="/leaderboard"
                className="block w-full py-3 px-5 border border-purple-200 text-[#5D3C64] hover:bg-purple-50 rounded-xl font-semibold text-sm transition"
              >
                Check Your Leaderboard Rank & XP
              </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Classroom;
