import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  Clock, 
  Star, 
  Send, 
  ArrowLeft, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Coins
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../config/api';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Swap Modal state
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [mySkill, setMySkill] = useState('');
  const [theirSkill, setTheirSkill] = useState('');
  const [swapDuration, setSwapDuration] = useState(1);
  const [swapMessage, setSwapMessage] = useState('');
  const [swapDate, setSwapDate] = useState('');

  // Reviews Modal state
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [allReviews, setAllReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [reviewSort, setReviewSort] = useState('date');
  const [reviewFilter, setReviewFilter] = useState('all');
  const reviewsPerPage = 10;
  const [reviewsPagination, setReviewsPagination] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user profile');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchAllReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const params = new URLSearchParams({
        page: currentReviewPage,
        limit: reviewsPerPage,
        sort: reviewSort
      });
      const response = await api.get(`/users/${id}/reviews?${params}`);
      setAllReviews(response.data.reviews || []);
      setReviewsPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  }, [id, currentReviewPage, reviewSort]);

  const openAllReviewsModal = async () => {
    setShowAllReviewsModal(true);
    setCurrentReviewPage(1);
    setReviewSort('date');
    setReviewFilter('all');
    await fetchAllReviews();
  };

  const closeAllReviewsModal = () => {
    setShowAllReviewsModal(false);
    setAllReviews([]);
    setReviewsPagination(null);
  };

  const handleReviewSortChange = async (newSort) => {
    setReviewSort(newSort);
    setCurrentReviewPage(1);
  };

  const handleReviewFilterChange = (newFilter) => {
    setReviewFilter(newFilter);
    setCurrentReviewPage(1);
  };

  const filteredReviews = allReviews.filter(review => {
    if (reviewFilter === 'all') return true;
    if (reviewFilter === '5star') return review.rating === 5;
    if (reviewFilter === '4star') return review.rating === 4;
    if (reviewFilter === '3star') return review.rating === 3;
    if (reviewFilter === '2star') return review.rating === 2;
    if (reviewFilter === '1star') return review.rating === 1;
    if (reviewFilter === 'withComments') return review.comment && review.comment.trim().length > 0;
    return true;
  });

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (showAllReviewsModal) {
      fetchAllReviews();
    }
  }, [showAllReviewsModal, fetchAllReviews]);

  const openSwapModal = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to request a skill swap');
      navigate('/login');
      return;
    }
    setMySkill('');
    setTheirSkill(user?.skillsOffered?.[0]?.name || '');
    setSwapDuration(1);
    setSwapMessage('');
    setSwapDate('');
    setShowSwapModal(true);
  };

  const handleSwapRequest = async (e) => {
    e.preventDefault();
    if (!mySkill) {
      toast.error('Please select one of your skills to offer');
      return;
    }
    if (!theirSkill) {
      toast.error('Please select a skill you want to learn');
      return;
    }

    setSwapLoading(true);
    try {
      await api.post('/swaps', {
        recipientId: user._id,
        requestedSkill: { name: theirSkill },
        offeredSkill: { name: mySkill },
        duration: Number(swapDuration),
        message: swapMessage,
        scheduledDate: swapDate || null
      });
      toast.success('Swap request sent successfully!');
      setShowSwapModal(false);
    } catch (error) {
      console.error('Error sending swap request:', error);
      toast.error(error.response?.data?.message || 'Failed to send swap request');
    } finally {
      setSwapLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    const emptyStars = 5 - Math.ceil(rating || 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    return stars;
  };

  const getAvailabilityText = (availability = {}) => {
    const options = [];
    if (availability.weekdays) options.push('Weekdays');
    if (availability.weekends) options.push('Weekends');
    if (availability.evenings) options.push('Evenings');
    if (availability.mornings) options.push('Mornings');
    return options.length > 0 ? options.join(', ') : 'Flexible schedule';
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">User not found</p>
        <Link to="/browse" className="text-brand-plum font-bold mt-2 inline-block">
          Return to Browse
        </Link>
      </div>
    );
  }

  const isSelf = currentUser && currentUser._id?.toString() === user._id?.toString();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0D15] text-gray-900 dark:text-[#F5F2FA] pt-20 pb-16 px-4 animate-fade-in transition-colors duration-200">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Navigation */}
        <button
          onClick={() => navigate('/browse')}
          className="flex items-center text-brand-mauve dark:text-purple-300 hover:text-brand-plum dark:hover:text-purple-200 font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </button>

        {/* Profile Header Card */}
        <div className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-xl border border-brand-pink/30 dark:border-[#2D263B] p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 transition-colors">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
                className="w-28 h-28 rounded-3xl object-cover border-4 border-brand-pink shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-3xl bg-brand-night text-white font-extrabold flex items-center justify-center text-5xl shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-extrabold text-brand-night dark:text-[#F5F2FA]">{user.name}</h1>
              {user.location && (
                <p className="text-brand-orchid dark:text-purple-300 flex items-center justify-center sm:justify-start gap-1 text-sm mt-1">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </p>
              )}

              {/* Rating Summary */}
              <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                {typeof user.ratingAverage === 'number' && user.ratingCount > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {renderStars(user.ratingAverage)}
                    </div>
                    <span className="font-extrabold text-brand-plum dark:text-purple-200 text-sm">
                      {user.ratingAverage.toFixed(1)}
                    </span>
                    <button
                      onClick={openAllReviewsModal}
                      className="text-xs text-brand-orchid dark:text-purple-300 hover:underline font-semibold"
                    >
                      ({user.ratingCount} reviews)
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-brand-orchid dark:text-purple-300 font-medium bg-brand-pink/10 dark:bg-purple-950/40 px-3 py-1 rounded-full">
                    New to Skillzy • No reviews yet
                  </span>
                )}
              </div>

              {/* Swaps Completed */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Swaps Completed: <strong className="text-brand-plum dark:text-purple-300">{user.swapsCompleted || 0}</strong>
              </p>
            </div>
          </div>

          {!isSelf && (
            <button
              onClick={openSwapModal}
              className="bg-brand-pink hover:bg-brand-blush text-brand-night px-6 py-3 rounded-2xl font-extrabold shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Request Swap
            </button>
          )}
        </div>

        {/* Bio Card */}
        {user.bio && (
          <div className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-card border border-brand-pink/20 dark:border-[#2D263B] p-6 md:p-8 transition-colors">
            <h2 className="text-lg font-extrabold text-brand-night dark:text-[#F5F2FA] mb-2">About Me</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">{user.bio}</p>
          </div>
        )}

        {/* Availability */}
        <div className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-card border border-brand-pink/20 dark:border-[#2D263B] p-6 md:p-8 flex items-center gap-3 transition-colors">
          <Clock className="w-6 h-6 text-brand-orchid dark:text-purple-400 shrink-0" />
          <div>
            <h3 className="font-bold text-brand-night dark:text-[#F5F2FA] text-sm">Availability</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-0.5">{getAvailabilityText(user.availability)}</p>
          </div>
        </div>

        {/* Skills Offered */}
        <div className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-card border border-brand-pink/20 dark:border-[#2D263B] p-6 md:p-8 transition-colors">
          <h2 className="text-xl font-extrabold text-brand-night dark:text-[#F5F2FA] mb-4">Skills Offered for Teaching</h2>
          {(!user.skillsOffered || user.skillsOffered.length === 0) ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">No skills offered yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {user.skillsOffered.map((skill, idx) => (
                <div key={skill._id || idx} className="p-4 rounded-2xl bg-green-50/70 dark:bg-emerald-950/40 border border-green-200 dark:border-emerald-800/40">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-green-900 dark:text-emerald-300 text-base">{skill.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-200 dark:bg-emerald-900/60 text-green-800 dark:text-emerald-200">
                      {skill.proficiency || 'Intermediate'}
                    </span>
                  </div>
                  {skill.description && (
                    <p className="text-xs text-green-800 dark:text-emerald-400 mt-1">{skill.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills Wanted */}
        <div className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-card border border-brand-pink/20 dark:border-[#2D263B] p-6 md:p-8 transition-colors">
          <h2 className="text-xl font-extrabold text-brand-night dark:text-[#F5F2FA] mb-4">Skills Desired for Learning</h2>
          {(!user.skillsWanted || user.skillsWanted.length === 0) ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">No skills wanted listed yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {user.skillsWanted.map((skill, idx) => (
                <div key={skill._id || idx} className="p-4 rounded-2xl bg-blue-50/70 dark:bg-indigo-950/40 border border-blue-200 dark:border-indigo-800/40">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-blue-900 dark:text-indigo-300 text-base">{skill.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-200 dark:bg-indigo-900/60 text-blue-800 dark:text-indigo-200">
                      {skill.priority || 'Medium'} Priority
                    </span>
                  </div>
                  {skill.description && (
                    <p className="text-xs text-blue-800 dark:text-indigo-400 mt-1">{skill.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verified Portfolio Showcase */}
        {user.portfolio && user.portfolio.length > 0 && (
          <div className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-card border border-brand-pink/20 dark:border-[#2D263B] p-6 md:p-8 transition-colors">
            <h2 className="text-xl font-extrabold text-brand-night dark:text-[#F5F2FA] mb-4 flex items-center gap-2">
              <span>Verified Skill Portfolio</span>
              <span className="text-xs bg-indigo-50 dark:bg-purple-950/60 text-indigo-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
                {user.portfolio.length} Projects
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.portfolio.map((item, idx) => (
                <div key={item._id || idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-[#13111C] border border-gray-100 dark:border-[#2D263B] flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-purple-200 text-sm mb-1">{item.title}</h3>
                    {item.description && <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{item.description}</p>}
                    {item.projectUrl && (
                      <a
                        href={item.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold block mb-2"
                      >
                        External Project Link ↗
                      </a>
                    )}
                    {item.skillsUsed?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.skillsUsed.map((sk, sIdx) => (
                          <span key={sIdx} className="bg-indigo-100 dark:bg-purple-900/50 text-indigo-800 dark:text-purple-200 text-[10px] font-semibold px-2 py-0.5 rounded">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Reviews List */}
        {user.recentReviews && user.recentReviews.length > 0 && (
          <div className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-card border border-brand-pink/20 dark:border-[#2D263B] p-6 md:p-8 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-brand-night dark:text-[#F5F2FA]">Recent Reviews</h2>
              {user.ratingCount > 3 && (
                <button
                  onClick={openAllReviewsModal}
                  className="text-xs text-brand-orchid dark:text-purple-300 hover:underline font-bold"
                >
                  View All ({user.ratingCount})
                </button>
              )}
            </div>

            <div className="space-y-3">
              {user.recentReviews.map((rev, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-[#13111C] border border-gray-100 dark:border-[#2D263B] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {rev.reviewer?.profilePhoto ? (
                        <img src={rev.reviewer.profilePhoto} alt={rev.reviewer.name} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-brand-orchid text-white text-xs font-bold flex items-center justify-center">
                          {rev.reviewer?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="font-bold text-xs text-brand-plum dark:text-purple-200">{rev.reviewer?.name || 'Skillzy Member'}</span>
                    </div>
                    <div className="flex items-center">{renderStars(rev.rating)}</div>
                  </div>
                  {rev.comment && <p className="text-xs text-gray-700 dark:text-gray-300 italic">"{rev.comment}"</p>}
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(rev.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Swap Modal */}
        {showSwapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2D263B] p-6 sm:p-8 max-w-lg w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-extrabold text-brand-plum dark:text-purple-200">
                  Request Swap with {user.name}
                </h3>
                <button onClick={() => setShowSwapModal(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#262035] text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSwapRequest} className="space-y-4">
                {/* What user wants to learn */}
                <div>
                  <label className="block text-xs font-bold text-brand-plum dark:text-purple-200 mb-1">
                    Skill you want to learn from {user.name} *
                  </label>
                  <select
                    value={theirSkill}
                    onChange={(e) => setTheirSkill(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#2D263B] focus:outline-none focus:ring-2 focus:ring-brand-pink text-sm bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA]"
                  >
                    <option value="">Select one of their offered skills</option>
                    {user.skillsOffered?.map((s) => (
                      <option key={s._id || s.name} value={s.name}>
                        {s.name} ({s.proficiency || 'Intermediate'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* What user offers */}
                <div>
                  <label className="block text-xs font-bold text-brand-plum dark:text-purple-200 mb-1">
                    Skill you offer to teach *
                  </label>
                  <select
                    value={mySkill}
                    onChange={(e) => setMySkill(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#2D263B] focus:outline-none focus:ring-2 focus:ring-brand-pink text-sm bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA]"
                  >
                    <option value="">Select one of your offered skills</option>
                    {currentUser?.skillsOffered?.map((s) => (
                      <option key={s._id || s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {(!currentUser?.skillsOffered || currentUser.skillsOffered.length === 0) && (
                    <p className="text-[11px] text-red-500 mt-1">
                      You haven't added any skills to your profile yet.{' '}
                      <Link to="/profile" className="underline font-bold">Add skills in Profile</Link>.
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-bold text-brand-plum dark:text-purple-200 mb-1">
                    Duration & Time Credits *
                  </label>
                  <select
                    value={swapDuration}
                    onChange={(e) => setSwapDuration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#2D263B] focus:outline-none focus:ring-2 focus:ring-brand-pink text-sm bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA]"
                  >
                    <option value={1}>1 hour exchange (1 time credit)</option>
                    <option value={2}>2 hours exchange (2 time credits)</option>
                    <option value={3}>3 hours exchange (3 time credits)</option>
                    <option value={4}>4 hours exchange (4 time credits)</option>
                    <option value={5}>5 hours exchange (5 time credits)</option>
                  </select>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-brand-orchid" />
                    Your balance: {currentUser?.timeCredits ?? 5} credits.
                  </p>
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="block text-xs font-bold text-brand-plum dark:text-purple-200 mb-1">
                    Preferred Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={swapDate}
                    onChange={(e) => setSwapDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-[#2D263B] focus:outline-none focus:ring-2 focus:ring-brand-pink text-sm bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA]"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-brand-plum dark:text-purple-200 mb-1">
                    Personalized Message (Optional)
                  </label>
                  <textarea
                    value={swapMessage}
                    onChange={(e) => setSwapMessage(e.target.value)}
                    rows={3}
                    placeholder="Describe your learning goals, background, or availability..."
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-[#2D263B] focus:outline-none focus:ring-2 focus:ring-brand-pink text-sm bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA] placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowSwapModal(false)}
                    disabled={swapLoading}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-[#2D263B] text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-[#262035]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={swapLoading || !currentUser?.skillsOffered?.length}
                    className="px-6 py-2.5 rounded-xl bg-brand-plum hover:bg-brand-mauve dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-sm shadow transition-colors disabled:opacity-50"
                  >
                    {swapLoading ? 'Sending Proposal...' : 'Send Swap Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* All Reviews Modal */}
        {showAllReviewsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2D263B] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#2D263B]">
                <h3 className="text-xl font-bold text-brand-plum dark:text-purple-200">
                  All Reviews for {user.name}
                </h3>
                <button onClick={closeAllReviewsModal} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#262035] text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Controls */}
              <div className="px-6 py-3 bg-gray-50 dark:bg-[#13111C] border-b border-gray-100 dark:border-[#2D263B] flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-600 dark:text-gray-300">Sort:</span>
                  <select
                    value={reviewSort}
                    onChange={(e) => handleReviewSortChange(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#1A1625] text-gray-900 dark:text-[#F5F2FA]"
                  >
                    <option value="date">Newest First</option>
                    <option value="rating">Highest Rating</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-600 dark:text-gray-300">Filter:</span>
                  <select
                    value={reviewFilter}
                    onChange={(e) => handleReviewFilterChange(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#1A1625] text-gray-900 dark:text-[#F5F2FA]"
                  >
                    <option value="all">All Reviews</option>
                    <option value="5star">5 Stars Only</option>
                    <option value="4star">4 Stars Only</option>
                    <option value="3star">3 Stars Only</option>
                    <option value="withComments">With Comments</option>
                  </select>
                </div>
              </div>

              {/* Reviews List */}
              <div className="p-6 overflow-y-auto space-y-3 flex-1">
                {reviewsLoading ? (
                  <div className="py-12 text-center text-gray-400 text-sm">Loading reviews...</div>
                ) : filteredReviews.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-sm">No reviews found matching filter.</div>
                ) : (
                  filteredReviews.map((r, i) => (
                    <div key={i} className="p-4 bg-gray-50 dark:bg-[#13111C] rounded-2xl border border-gray-100 dark:border-[#2D263B]">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {r.reviewer?.profilePhoto ? (
                            <img src={r.reviewer.profilePhoto} alt={r.reviewer.name} className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-brand-orchid text-white text-xs font-bold flex items-center justify-center">
                              {r.reviewer?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <span className="font-bold text-xs text-brand-plum dark:text-purple-200">{r.reviewer?.name || 'Member'}</span>
                        </div>
                        <div className="flex items-center">{renderStars(r.rating)}</div>
                      </div>
                      {r.comment && <p className="text-xs text-gray-700 dark:text-gray-300 italic">"{r.comment}"</p>}
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 block">{new Date(r.date).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {reviewsPagination && reviewsPagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 dark:border-[#2D263B] flex items-center justify-center gap-4 text-xs font-semibold">
                  <button
                    onClick={() => setCurrentReviewPage((p) => Math.max(1, p - 1))}
                    disabled={!reviewsPagination.hasPrevPage}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-[#2D263B] text-gray-700 dark:text-gray-300 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-gray-600 dark:text-gray-400">
                    Page {reviewsPagination.currentPage} of {reviewsPagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentReviewPage((p) => Math.min(reviewsPagination.totalPages, p + 1))}
                    disabled={!reviewsPagination.hasNextPage}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-[#2D263B] text-gray-700 dark:text-gray-300 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;