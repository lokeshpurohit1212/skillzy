import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  MessageSquare,
  Calendar,
  Plus,
  Clock
} from 'lucide-react';

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);

  // New community form
  const [communityForm, setCommunityForm] = useState({
    name: '',
    category: 'Engineering & Tech',
    description: ''
  });

  // New event form
  const [eventForm, setEventForm] = useState({
    title: '',
    skillTopic: '',
    description: '',
    scheduledAt: '',
    durationMinutes: 60,
    maxAttendees: 50
  });

  // Discussion reply form
  const [discussionForm, setDiscussionForm] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchCommunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/communities');
      setCommunities(res.data || []);
      if (res.data?.length > 0 && !selectedCommunity) {
        loadCommunityDetails(res.data[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const loadCommunityDetails = async (communityId) => {
    try {
      const [commRes, eventRes] = await Promise.all([
        api.get(`/communities/${communityId}`),
        api.get(`/communities/${communityId}/events`)
      ]);
      setSelectedCommunity(commRes.data);
      setEvents(eventRes.data || []);
    } catch (err) {
      toast.error('Failed to load community details');
    }
  };

  const handleJoinCommunity = async (id) => {
    try {
      await api.post(`/communities/${id}/join`);
      toast.success('Joined community successfully! +15 XP');
      loadCommunityDetails(id);
      fetchCommunities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join community');
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/communities', communityForm);
      toast.success('Skill Club created! +40 XP');
      setShowCreateCommunityModal(false);
      setCommunities([res.data.community, ...communities]);
      loadCommunityDetails(res.data.community._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create community');
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!discussionForm.title || !discussionForm.content) return;

    try {
      await api.post(`/communities/${selectedCommunity._id}/discussions`, discussionForm);
      toast.success('Discussion posted! +10 XP');
      setDiscussionForm({ title: '', content: '' });
      loadCommunityDetails(selectedCommunity._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post discussion');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/communities/${selectedCommunity._id}/events`, eventForm);
      toast.success('Workshop event scheduled! +25 XP');
      setShowCreateEventModal(false);
      loadCommunityDetails(selectedCommunity._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule workshop');
    }
  };

  const handleRegisterEvent = async (eventId) => {
    try {
      await api.post(`/communities/events/${eventId}/register`);
      toast.success('Registered for workshop! +10 XP');
      loadCommunityDetails(selectedCommunity._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register for workshop');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0D15] text-gray-900 dark:text-[#F5F2FA] pt-20 pb-16 px-4 sm:px-6 lg:px-8 animate-fade-in transition-colors duration-200">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Top Banner */}
        <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100 dark:border-[#2D263B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/40 px-3 py-1 rounded-full text-[#5D3C64] dark:text-purple-200 text-xs font-semibold mb-3">
              <Users className="w-3.5 h-3.5 text-brand-orchid" />
              <span>Community Clubs & Group Workshops</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-plum dark:text-purple-200 tracking-tight mb-2">
              Learn Together in Skill Communities
            </h1>
            <p className="text-brand-orchid dark:text-purple-300 text-sm sm:text-base leading-relaxed">
              Join topic-based learning clubs, engage in peer discussions, and attend mentor-led interactive workshops with capacity-managed virtual rooms.
            </p>
          </div>
          <button
            onClick={() => setShowCreateCommunityModal(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-md transition flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Skill Club</span>
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Communities List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-brand-plum dark:text-purple-200 text-lg">Skill Clubs</h3>
              <button
                onClick={() => setShowCreateCommunityModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Club</span>
              </button>
            </div>

            {loading ? (
              <div className="py-10 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-3">
                {communities.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => loadCommunityDetails(c._id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      selectedCommunity?._id === c._id
                        ? 'bg-purple-50/70 dark:bg-purple-950/50 border-purple-300 dark:border-purple-700 shadow-sm'
                        : 'bg-white dark:bg-[#1A1625] border-purple-100 dark:border-[#2D263B] hover:border-purple-200 dark:hover:border-purple-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-bold text-gray-900 dark:text-[#F5F2FA] text-sm">{c.name}</h4>
                      <span className="text-[10px] bg-purple-100 dark:bg-purple-900/50 text-[#5D3C64] dark:text-purple-200 px-2 py-0.5 rounded-md font-semibold">
                        {c.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{c.description}</p>
                    <div className="flex items-center space-x-4 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1 text-[#5D3C64] dark:text-purple-300" />
                        {c.memberCount || c.members?.length || 1} Members
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1 text-[#5D3C64] dark:text-purple-300" />
                        {c.discussionCount || c.discussions?.length || 0} Discussions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* Right Column: Community Details & Tabs */}
        {selectedCommunity && (
          <div className="lg:col-span-2 space-y-6">
            {/* Community Header Banner */}
            <div className="bg-white dark:bg-[#1A1625] rounded-3xl border border-purple-100 dark:border-[#2D263B] p-6 shadow-sm transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-black text-brand-plum dark:text-purple-200">{selectedCommunity.name}</h2>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-[#5D3C64] dark:text-purple-200 font-bold px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/40">
                      {selectedCommunity.category}
                    </span>
                  </div>
                  <p className="text-xs text-brand-orchid dark:text-purple-300 mt-1">{selectedCommunity.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleJoinCommunity(selectedCommunity._id)}
                    className="px-4 py-2 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Join Club
                  </button>
                  <button
                    onClick={() => setShowCreateEventModal(true)}
                    className="px-4 py-2 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-[#5D3C64] dark:text-purple-200 rounded-xl text-xs font-semibold transition"
                  >
                    Host Workshop
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Workshops Section */}
            <div className="bg-white dark:bg-[#1A1625] rounded-3xl border border-purple-100 dark:border-[#2D263B] p-6 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-brand-plum dark:text-purple-200 text-base flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#5D3C64] dark:text-purple-300" />
                  <span>Upcoming Workshops & Group Sessions</span>
                </h3>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">{events.length} Scheduled</span>
              </div>

              {events.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">No scheduled workshops in this club yet.</p>
              ) : (
                <div className="space-y-3">
                  {events.map((evt) => {
                    const eventDate = new Date(evt.scheduledAt);
                    const isFull = (evt.attendees?.length || 0) >= evt.maxAttendees;

                    return (
                      <div key={evt._id} className="p-4 rounded-2xl bg-purple-50/30 dark:bg-[#13111C] border border-purple-100 dark:border-[#2D263B] flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-[#F5F2FA]">{evt.title}</h4>
                            <span className="text-[10px] bg-purple-100 dark:bg-purple-900/50 text-[#5D3C64] dark:text-purple-200 px-2 py-0.5 rounded font-semibold border border-purple-200 dark:border-purple-800/40">
                              {evt.skillTopic}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{evt.description}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1 text-[#5D3C64] dark:text-purple-300" />
                              {eventDate.toLocaleString()} ({evt.durationMinutes} mins)
                            </span>
                            <span>•</span>
                            <span>{evt.attendees?.length || 1} / {evt.maxAttendees} Attending</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRegisterEvent(evt._id)}
                          disabled={isFull}
                          className="px-4 py-2 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 flex-shrink-0"
                        >
                          {isFull ? 'Full' : 'Register'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Discussions Feed */}
            <div className="bg-white dark:bg-[#1A1625] rounded-3xl border border-purple-100 dark:border-[#2D263B] p-6 shadow-sm transition-colors">
              <h3 className="font-bold text-brand-plum dark:text-purple-200 text-base mb-4 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#5D3C64] dark:text-purple-300" />
                <span>Discussion Threads</span>
              </h3>

              {/* Start new discussion form */}
              <form onSubmit={handleCreateDiscussion} className="mb-6 p-4 rounded-2xl bg-purple-50/20 dark:bg-[#13111C] border border-purple-100 dark:border-[#2D263B] space-y-3">
                <input
                  type="text"
                  placeholder="Discussion Topic..."
                  value={discussionForm.title}
                  onChange={(e) => setDiscussionForm({ ...discussionForm, title: e.target.value })}
                  className="w-full border border-gray-200 dark:border-[#2D263B] bg-white dark:bg-[#1A1625] text-gray-900 dark:text-[#F5F2FA] placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none"
                  required
                />
                <textarea
                  rows="2"
                  placeholder="Share a thought, ask a question, or recommend a learning resource..."
                  value={discussionForm.content}
                  onChange={(e) => setDiscussionForm({ ...discussionForm, content: e.target.value })}
                  className="w-full border border-gray-200 dark:border-[#2D263B] bg-white dark:bg-[#1A1625] text-gray-900 dark:text-[#F5F2FA] placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Post Topic
                  </button>
                </div>
              </form>

              {/* Discussions list */}
              <div className="space-y-4">
                {(selectedCommunity.discussions || []).length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">No discussions yet. Start the conversation!</p>
                ) : (
                  selectedCommunity.discussions.map((d, dIdx) => (
                    <div key={dIdx} className="p-4 rounded-2xl border border-purple-100 dark:border-[#2D263B] bg-white dark:bg-[#13111C] shadow-2xs">
                      <div className="flex items-center space-x-2.5 mb-2">
                        <img
                          src={d.author?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.author?.name || 'User')}`}
                          alt="Author"
                          className="w-7 h-7 rounded-full object-cover border border-purple-100 dark:border-purple-800/40"
                        />
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-[#F5F2FA]">{d.author?.name || 'Community Member'}</div>
                          <div className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-brand-plum dark:text-purple-200 mb-1">{d.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{d.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      {showCreateCommunityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1625] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-purple-100 dark:border-[#2D263B]">
            <h2 className="text-xl font-bold text-brand-plum dark:text-purple-200 mb-1">Create a Skill Club</h2>
            <p className="text-xs text-brand-orchid dark:text-purple-300 mb-4">Start a community dedicated to a craft or discipline.</p>

            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Club Name</label>
                <input
                  type="text"
                  placeholder="e.g. React Developers Circle, Jazz Guitarists..."
                  value={communityForm.name}
                  onChange={(e) => setCommunityForm({ ...communityForm, name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={communityForm.category}
                  onChange={(e) => setCommunityForm({ ...communityForm, category: e.target.value })}
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none"
                >
                  <option value="Engineering & Tech">Engineering & Tech</option>
                  <option value="Design & Creative">Design & Creative</option>
                  <option value="Music & Arts">Music & Arts</option>
                  <option value="Languages">Languages</option>
                  <option value="Business & Startups">Business & Startups</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description & Goals</label>
                <textarea
                  rows="3"
                  placeholder="What is the mission of this community? Who should join?"
                  value={communityForm.description}
                  onChange={(e) => setCommunityForm({ ...communityForm, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#2D263B]">
                <button
                  type="button"
                  onClick={() => setShowCreateCommunityModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#262035] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-sm transition"
                >
                  Create Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateEventModal && selectedCommunity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1625] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-purple-100 dark:border-[#2D263B]">
            <h2 className="text-xl font-bold text-brand-plum dark:text-purple-200 mb-1">Host a Community Workshop</h2>
            <p className="text-xs text-brand-orchid dark:text-purple-300 mb-4">Schedule a live group session for {selectedCommunity.name}.</p>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Workshop Title</label>
                <input
                  type="text"
                  placeholder="e.g. Building Full-Stack Apps with Next.js"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Skill Topic</label>
                <input
                  type="text"
                  placeholder="e.g. React & State Management"
                  value={eventForm.skillTopic}
                  onChange={(e) => setEventForm({ ...eventForm, skillTopic: e.target.value })}
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={eventForm.scheduledAt}
                    onChange={(e) => setEventForm({ ...eventForm, scheduledAt: e.target.value })}
                    className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={eventForm.maxAttendees}
                    onChange={(e) => setEventForm({ ...eventForm, maxAttendees: parseInt(e.target.value, 10) })}
                    className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Workshop Description</label>
                <textarea
                  rows="3"
                  placeholder="What will attendees learn? Any requirements?"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#2D263B]">
                <button
                  type="button"
                  onClick={() => setShowCreateEventModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#262035] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-sm transition"
                >
                  Schedule Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Communities;
