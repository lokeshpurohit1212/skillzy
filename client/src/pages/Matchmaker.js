import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../config/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Star,
  MapPin,
  Send,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const Matchmaker = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState('');
  const [minScore, setMinScore] = useState(15);
  const [sortBy, setSortBy] = useState('score');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [swapForm, setSwapForm] = useState({
    requestedSkill: '',
    offeredSkill: '',
    duration: 1,
    message: ''
  });
  const [submittingSwap, setSubmittingSwap] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentUser();
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minScore, sortBy]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setCurrentUser(res.data);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params = { minScore, sortBy };
      if (skillFilter) params.skillFilter = skillFilter;
      const res = await api.get('/matchmaker/recommendations', { params });
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load matchmaker recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchRecommendations();
  };

  const openSwapModal = (rec) => {
    setSelectedUser(rec.user);
    const firstLearnable = rec.skillsTheyCanTeachMe?.[0]?.skill || rec.user.skillsOffered?.[0]?.name || '';
    const firstTeachable = rec.skillsICanTeachThem?.[0]?.skill || currentUser?.skillsOffered?.[0]?.name || '';
    setSwapForm({
      requestedSkill: firstLearnable,
      offeredSkill: firstTeachable,
      duration: 1,
      message: `Hi ${rec.user.name}, I discovered our high compatibility on Skillzy Matchmaker and would love to exchange skills!`
    });
    setShowSwapModal(true);
  };

  const handleCreateSwap = async (e) => {
    e.preventDefault();
    if (!swapForm.requestedSkill || !swapForm.offeredSkill) {
      toast.error('Please select both a requested skill and an offered skill');
      return;
    }
    setSubmittingSwap(true);
    try {
      await api.post('/swaps', {
        recipientId: selectedUser._id,
        requestedSkill: { name: swapForm.requestedSkill },
        offeredSkill: { name: swapForm.offeredSkill },
        duration: parseInt(swapForm.duration, 10),
        message: swapForm.message
      });
      toast.success('Swap request sent successfully!');
      setShowSwapModal(false);
      navigate('/swaps');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send swap request');
    } finally {
      setSubmittingSwap(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0D15] text-gray-900 dark:text-[#F5F2FA] pt-20 pb-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-8 border border-purple-100 dark:border-[#2D263B] shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-purple-50 dark:bg-[#262035] border border-purple-200 dark:border-[#2D263B] px-3 py-1 rounded-full text-[#5D3C64] dark:text-[#A78BFA] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#5D3C64] dark:text-[#A78BFA]" />
              <span>AI Matchmaker Engine 2.0</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-plum dark:text-[#F5F2FA] tracking-tight mb-2">
              Find Your Ideal Skill Exchange Partners
            </h1>
            <p className="text-brand-orchid dark:text-gray-300 text-base max-w-3xl">
              Our multi-factor compatibility algorithm analyzes your complementary skills, schedules, learning styles, and reputation to recommend partners with verified mutual learning value.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Filter & Controls Bar */}
        <div className="bg-white dark:bg-[#1A1625] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-[#2D263B] flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleFilterSubmit} className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by skill (e.g. Python, UI/UX, Guitar)..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] focus:outline-none focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:ring-2 focus:ring-[#5D3C64]/20 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#5D3C64] hover:bg-[#4A2F4F] text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              Apply Filter
            </button>
          </form>

        <div className="flex items-center space-x-4 w-full md:w-auto justify-end flex-wrap gap-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="text-xs uppercase font-semibold text-gray-400">Min Score:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="bg-gray-50 dark:bg-[#151221] border border-gray-200 dark:border-[#2D263B] rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="0">Any (0%+)</option>
              <option value="15">Fair (15%+)</option>
              <option value="30">Good (30%+)</option>
              <option value="50">Strong (50%+)</option>
              <option value="70">Elite (70%+)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <SlidersHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-xs uppercase font-semibold text-gray-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 dark:bg-[#151221] border border-gray-200 dark:border-[#2D263B] rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="score">Compatibility Score</option>
              <option value="rating">Highest Rated</option>
              <option value="swaps">Most Active</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations Feed */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1A1625] rounded-2xl border border-dashed border-gray-200 dark:border-[#2D263B] p-8">
          <HelpCircle className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#F5F2FA] mb-2">No Matching Partners Found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
            Try adjusting your search criteria, or add more skills to your profile to expand your compatibility reach.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm"
          >
            <span>Update Your Skills Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => {
            const user = rec.user;
            const scoreBadge =
              rec.matchScore >= 80
                ? 'bg-purple-100 dark:bg-purple-900/50 text-[#5D3C64] dark:text-[#A78BFA] border border-purple-200 dark:border-purple-800'
                : rec.matchScore >= 50
                ? 'bg-purple-50 dark:bg-[#262035] text-[#7B466A] dark:text-purple-300 border border-purple-100 dark:border-[#2D263B]'
                : 'bg-gray-100 dark:bg-[#151221] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2D263B]';

            return (
              <div
                key={user._id}
                className="bg-white dark:bg-[#1A1625] rounded-2xl border border-gray-100 dark:border-[#2D263B] shadow-sm hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Match Score Banner */}
                <div className="p-5 border-b border-gray-50 dark:border-[#2D263B] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=5D3C64&color=fff`}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-100 dark:border-[#2D263B]"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-bold text-brand-plum dark:text-[#F5F2FA] text-base">{user.name}</h3>
                        {user.membership === 'premium' && (
                          <span className="bg-purple-100 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-purple-200 dark:border-[#2D263B]">
                            PRO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {user.location && (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-0.5 text-gray-400" />
                            {user.location}
                          </span>
                        )}
                        <span className="flex items-center text-amber-600 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                          {user.ratingAverage ? user.ratingAverage.toFixed(1) : 'New'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`px-3 py-1.5 rounded-xl ${scoreBadge} text-center`}>
                    <div className="text-[10px] uppercase tracking-wider font-extrabold opacity-90">Match</div>
                    <div className="text-base font-black leading-tight">{rec.matchScore}%</div>
                  </div>
                </div>

                {/* Compatibility Badges */}
                <div className="p-5 flex-1 space-y-4">
                  {rec.isComplementary && (
                    <div className="bg-purple-50 dark:bg-[#262035] border border-purple-200 dark:border-[#2D263B] rounded-xl p-2.5 flex items-center space-x-2 text-xs text-[#5D3C64] dark:text-[#A78BFA] font-medium">
                      <CheckCircle className="w-4 h-4 text-[#5D3C64] dark:text-[#A78BFA] flex-shrink-0" />
                      <span>Mutual Complementary Match — You each teach what the other wants!</span>
                    </div>
                  )}

                  {/* Why You Match Highlights */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-orchid dark:text-purple-300 mb-2">Why You Match</h4>
                    <ul className="space-y-1.5">
                      {rec.reasons.slice(0, 3).map((reason, idx) => (
                        <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                          <span className="text-[#5D3C64] dark:text-[#A78BFA] mt-0.5">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skills Grid */}
                  <div className="pt-2 border-t border-gray-50 dark:border-[#2D263B] space-y-2">
                    {rec.skillsTheyCanTeachMe.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">They Can Teach You:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.skillsTheyCanTeachMe.map((s, idx) => (
                            <span key={idx} className="bg-purple-50 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] border border-purple-100 dark:border-[#2D263B] text-xs px-2 py-0.5 rounded-md font-medium">
                              {s.skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {rec.skillsICanTeachThem.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">You Can Teach Them:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.skillsICanTeachThem.map((s, idx) => (
                            <span key={idx} className="bg-purple-50 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] border border-purple-100 dark:border-[#2D263B] text-xs px-2 py-0.5 rounded-md font-medium">
                              {s.skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50/70 dark:bg-[#151221]/70 border-t border-gray-100 dark:border-[#2D263B] flex items-center space-x-2">
                  <Link
                    to={`/user/${user._id}`}
                    className="flex-1 text-center py-2 px-3 border border-purple-200 dark:border-[#2D263B] hover:bg-purple-50 dark:hover:bg-[#262035] rounded-xl text-xs font-semibold text-[#5D3C64] dark:text-[#A78BFA] transition"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => openSwapModal(rec)}
                    className="flex-1 py-2 px-3 bg-[#5D3C64] hover:bg-[#4A2F4F] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition shadow-sm"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    <span>Request Swap</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Swap Request Modal */}
      {showSwapModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1625] text-gray-900 dark:text-[#F5F2FA] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-purple-100 dark:border-[#2D263B]">
            <h2 className="text-xl font-bold text-brand-plum dark:text-[#F5F2FA] mb-2">
              Request Skill Exchange with {selectedUser.name}
            </h2>
            <p className="text-sm text-brand-orchid dark:text-gray-300 mb-4">
              Coordinate exchange skills and confirm duration in time credits.
            </p>

            <form onSubmit={handleCreateSwap} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Skill You Want to Learn (from {selectedUser.name})
                </label>
                <select
                  value={swapForm.requestedSkill}
                  onChange={(e) => setSwapForm({ ...swapForm, requestedSkill: e.target.value })}
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none"
                  required
                >
                  <option value="">Select a skill offered by partner</option>
                  {(selectedUser.skillsOffered || []).map((s, idx) => (
                    <option key={idx} value={s.name}>
                      {s.name} ({s.proficiency || 'Intermediate'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Skill You Offer to Teach in Return
                </label>
                <select
                  value={swapForm.offeredSkill}
                  onChange={(e) => setSwapForm({ ...swapForm, offeredSkill: e.target.value })}
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none"
                  required
                >
                  <option value="">Select one of your teaching skills</option>
                  {(currentUser?.skillsOffered || []).map((s, idx) => (
                    <option key={idx} value={s.name}>
                      {s.name} ({s.proficiency || 'Intermediate'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Exchange Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={swapForm.duration}
                    onChange={(e) => setSwapForm({ ...swapForm, duration: e.target.value })}
                    className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Your balance: <strong className="text-[#5D3C64] dark:text-[#A78BFA]">{currentUser?.timeCredits ?? 5} credits</strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Introductory Message
                </label>
                <textarea
                  rows="3"
                  value={swapForm.message}
                  onChange={(e) => setSwapForm({ ...swapForm, message: e.target.value })}
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 focus:border-[#5D3C64] focus:outline-none"
                  placeholder="Share what you hope to achieve and your general availability..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#2D263B]">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#262035] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSwap}
                  className="px-5 py-2 bg-[#5D3C64] hover:bg-[#4A2F4F] text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {submittingSwap ? 'Sending...' : 'Send Swap Request'}
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

export default Matchmaker;
