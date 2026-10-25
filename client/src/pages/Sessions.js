import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  CalendarDays
} from 'lucide-react';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming' | 'completed' | 'cancelled' | 'all'
  const [showBookModal, setShowBookModal] = useState(false);
  const [partners, setPartners] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [bookingForm, setBookingForm] = useState({
    participantId: '',
    skillTopic: '',
    scheduledAt: '',
    durationMinutes: 60,
    notes: ''
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);

  useEffect(() => {
    fetchSessionsAndPartners();
  }, []);

  const fetchSessionsAndPartners = async () => {
    setLoading(true);
    try {
      const [userRes, sessionRes, swapsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/sessions'),
        api.get('/swaps/my-swaps')
      ]);

      setCurrentUser(userRes.data);
      setSessions(sessionRes.data || []);

      // Derive eligible swap partners
      const activeSwaps = (swapsRes.data || []).filter(s =>
        s.status === 'accepted' || s.status === 'completed'
      );
      const partnerMap = new Map();
      activeSwaps.forEach(s => {
        const partner =
          s.requester._id === userRes.data._id ? s.recipient : s.requester;
        if (partner && !partnerMap.has(partner._id)) {
          partnerMap.set(partner._id, {
            ...partner,
            skillTopic: s.requestedSkill?.name || 'Skill Exchange'
          });
        }
      });
      setPartners(Array.from(partnerMap.values()));
    } catch (err) {
      toast.error('Failed to load sessions data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!bookingForm.participantId || !bookingForm.skillTopic || !bookingForm.scheduledAt) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmittingBooking(true);
    try {
      await api.post('/sessions/book', {
        ...bookingForm,
        durationMinutes: parseInt(bookingForm.durationMinutes, 10)
      });
      toast.success('Session scheduled successfully!');
      setShowBookModal(false);
      fetchSessionsAndPartners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule session');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    const reason = window.prompt('Please provide a reason for cancellation:');
    if (reason === null) return;

    try {
      await api.put(`/sessions/${sessionId}/cancel`, { reason });
      toast.success('Session cancelled');
      fetchSessionsAndPartners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel session');
    }
  };

  const filteredSessions = sessions.filter(s => {
    const isPast = new Date(s.scheduledAt) < new Date();
    if (filter === 'upcoming') {
      return (s.status === 'scheduled' || s.status === 'in_progress' || s.status === 'rescheduled') && !isPast;
    }
    if (filter === 'completed') return s.status === 'completed';
    if (filter === 'cancelled') return s.status === 'cancelled';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0D15] text-gray-900 dark:text-[#F5F2FA] pt-20 pb-16 px-4 sm:px-6 lg:px-8 animate-fade-in transition-colors duration-200">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/60 dark:border-[#2D263B]">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-plum dark:text-[#F5F2FA] tracking-tight">
              Smart Session Scheduling
            </h1>
            <p className="text-brand-orchid dark:text-gray-300 text-base mt-1">
              Book timezone-aware 1-on-1 virtual sessions with your skill exchange partners.
            </p>
          </div>

          <button
            onClick={() => setShowBookModal(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-[#A78BFA] dark:hover:bg-[#906cd8] text-white dark:text-gray-950 rounded-xl text-sm font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Session</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-[#2D263B] pb-2">
          {['upcoming', 'completed', 'cancelled', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                filter === tab
                  ? 'bg-[#5D3C64] dark:bg-[#A78BFA] text-white dark:text-gray-950 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[#F5F2FA] hover:bg-gray-100 dark:hover:bg-[#262035]'
              }`}
            >
              {tab} Sessions
            </button>
          ))}
        </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1A1625] rounded-3xl border border-dashed border-gray-200 dark:border-[#2D263B] p-8 shadow-xs">
          <CalendarDays className="w-12 h-12 text-brand-orchid dark:text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-brand-plum dark:text-[#F5F2FA] mb-1">No {filter} sessions found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-6">
            Coordinate with your accepted exchange partners and lock in calendar time for live learning.
          </p>
          <button
            onClick={() => setShowBookModal(true)}
            className="px-5 py-2.5 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-[#A78BFA] dark:hover:bg-[#906cd8] text-white dark:text-gray-950 rounded-xl text-sm font-semibold transition shadow-sm"
          >
            Schedule a Live Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((sess) => {
            const isOrganizer = sess.organizer._id === currentUser?._id;
            const partner = isOrganizer ? sess.participant : sess.organizer;
            const scheduledDate = new Date(sess.scheduledAt);
            const isToday = new Date().toDateString() === scheduledDate.toDateString();

            return (
              <div
                key={sess._id}
                className="bg-white dark:bg-[#1A1625] rounded-2xl border border-purple-100 dark:border-[#2D263B] shadow-sm hover:shadow-md transition flex flex-col overflow-hidden"
              >
                {/* Header card status */}
                <div className="p-5 border-b border-gray-50 dark:border-[#2D263B] flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5D3C64] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-100 dark:border-purple-800/40">
                    {sess.skillTopic}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                      sess.status === 'completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                        : sess.status === 'cancelled'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                        : isToday
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                        : 'bg-purple-50 dark:bg-purple-950/40 text-[#5D3C64] dark:text-purple-300 border border-purple-100 dark:border-purple-800/40'
                    }`}
                  >
                    {sess.status}
                  </span>
                </div>

                {/* Body details */}
                <div className="p-5 flex-1 space-y-4">
                  {/* Partner Info */}
                  <div className="flex items-center space-x-3">
                    <img
                      src={partner.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}`}
                      alt={partner.name}
                      className="w-10 h-10 rounded-full object-cover border border-purple-100 dark:border-[#2D263B]"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-[#F5F2FA]">{partner.name}</h4>
                      <p className="text-xs text-gray-400 dark:text-gray-400">
                        {isOrganizer ? 'Invited Partner' : 'Session Host'}
                      </p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="bg-gray-50 dark:bg-[#262035]/60 rounded-xl p-3 space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[#5D3C64] dark:text-[#A78BFA]" />
                      <span className="font-semibold">{scheduledDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[#5D3C64] dark:text-[#A78BFA]" />
                      <span>{scheduledDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({sess.durationMinutes} mins)</span>
                    </div>
                  </div>

                  {sess.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2">
                      "{sess.notes}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 dark:bg-[#151221] border-t border-gray-100 dark:border-[#2D263B] flex items-center justify-between gap-2">
                  {sess.status === 'scheduled' || sess.status === 'in_progress' || sess.status === 'rescheduled' ? (
                    <>
                      <button
                        onClick={() => handleCancelSession(sess._id)}
                        className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-2 rounded-xl transition"
                      >
                        Cancel
                      </button>
                      <Link
                        to={`/classroom/${sess._id}`}
                        className="flex-1 py-2 px-4 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-[#A78BFA] dark:hover:bg-[#906cd8] text-white dark:text-gray-950 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Enter Classroom</span>
                      </Link>
                    </>
                  ) : (
                    <div className="w-full text-center text-xs text-gray-400 dark:text-gray-500 py-1">
                      Session {sess.status}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Book Session Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1625] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-purple-100 dark:border-[#2D263B]">
            <h2 className="text-xl font-bold text-brand-plum dark:text-[#F5F2FA] mb-1">Schedule a Live Session</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Select an exchange partner, date, and learning topic.
            </p>

            <form onSubmit={handleBookSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Exchange Partner
                </label>
                <select
                  value={bookingForm.participantId}
                  onChange={(e) => {
                    const selPartner = partners.find(p => p._id === e.target.value);
                    setBookingForm({
                      ...bookingForm,
                      participantId: e.target.value,
                      skillTopic: selPartner?.skillTopic || bookingForm.skillTopic
                    });
                  }}
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 dark:focus:ring-purple-400/20 focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:outline-none"
                  required
                >
                  <option value="" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">Select an active partner</option>
                  {partners.map((p) => (
                    <option key={p._id} value={p._id} className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">
                      {p.name} ({p.skillTopic})
                    </option>
                  ))}
                </select>
                {partners.length === 0 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                    No active swap partners found. Request or accept a swap first!
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Session Topic / Skill Focus
                </label>
                <input
                  type="text"
                  value={bookingForm.skillTopic}
                  onChange={(e) => setBookingForm({ ...bookingForm, skillTopic: e.target.value })}
                  placeholder="e.g. React Component Architecture, Guitar Scales..."
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 dark:focus:ring-purple-400/20 focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={bookingForm.scheduledAt}
                    onChange={(e) => setBookingForm({ ...bookingForm, scheduledAt: e.target.value })}
                    className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 dark:focus:ring-purple-400/20 focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <select
                    value={bookingForm.durationMinutes}
                    onChange={(e) => setBookingForm({ ...bookingForm, durationMinutes: e.target.value })}
                    className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 dark:focus:ring-purple-400/20 focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="30" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">30 minutes</option>
                    <option value="45" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">45 minutes</option>
                    <option value="60" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">60 minutes</option>
                    <option value="90" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">90 minutes</option>
                    <option value="120" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">120 minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Preparation Notes / Agenda
                </label>
                <textarea
                  rows="3"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  placeholder="Any prerequisites or goals for this session..."
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 dark:focus:ring-purple-400/20 focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#2D263B]">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#262035] dark:hover:text-[#F5F2FA] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBooking || partners.length === 0}
                  className="px-5 py-2 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-[#A78BFA] dark:hover:bg-[#906cd8] text-white dark:text-gray-950 rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {submittingBooking ? 'Scheduling...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
