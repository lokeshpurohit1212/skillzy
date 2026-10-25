import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import toast from 'react-hot-toast';
import { 
  Clock, 
  Check, 
  X, 
  Star, 
  MessageSquare, 
  Calendar, 
  ArrowRight,
  Coins
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const Swaps = () => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { user: currentUser } = useAuth();
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingSwap, setRatingSwap] = useState(null);
  const [ratingData, setRatingData] = useState({ rating: 5, comment: '' });
  const [ratingLoading, setRatingLoading] = useState(false);

  const fetchSwaps = useCallback(async () => {
    try {
      setLoading(true);
      const params = activeTab !== 'all' ? '?status=' + activeTab : '';
      const response = await api.get('/swaps/my-swaps' + params);
      setSwaps(response.data || []);
    } catch (error) {
      console.error('Error fetching swaps:', error);
      toast.error('Failed to load swaps');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchSwaps();
  }, [fetchSwaps]);

  const handleAccept = useCallback(async (swapId) => {
    try {
      await api.put('/swaps/' + swapId + '/accept');
      toast.success('Swap request accepted!');
      fetchSwaps();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept swap request');
    }
  }, [fetchSwaps]);

  const handleReject = useCallback(async (swapId) => {
    try {
      await api.put('/swaps/' + swapId + '/reject');
      toast.success('Swap request declined');
      fetchSwaps();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to decline swap request');
    }
  }, [fetchSwaps]);

  const handleComplete = useCallback(async (swapId) => {
    try {
      const res = await api.put('/swaps/' + swapId + '/complete');
      toast.success(res.data?.message || 'Swap marked as completed!');
      fetchSwaps();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete swap');
    }
  }, [fetchSwaps]);

  const handleCancel = useCallback(async (swapId) => {
    if (!window.confirm('Are you sure you want to cancel this swap?')) return;
    try {
      await api.put('/swaps/' + swapId + '/cancel');
      toast.success('Swap request cancelled');
      fetchSwaps();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel swap request');
    }
  }, [fetchSwaps]);

  const openRatingModal = (swap) => {
    setRatingSwap(swap);
    setRatingData({ rating: 5, comment: '' });
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setRatingSwap(null);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setRatingLoading(true);
    try {
      await api.post(`/swaps/${ratingSwap._id}/rate`, ratingData);
      toast.success('Rating submitted successfully!');
      closeRatingModal();
      fetchSwaps();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'Pending' },
      accepted: { color: 'bg-green-100 text-green-800 border-green-300', text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-300', text: 'Declined' },
      completed: { color: 'bg-purple-100 text-purple-800 border-purple-300', text: 'Completed' },
      cancelled: { color: 'bg-gray-100 text-gray-700 border-gray-300', text: 'Cancelled' }
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700 border-gray-300', text: status };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />);
    }
    const emptyStars = 5 - Math.ceil(rating || 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3.5 h-3.5 text-gray-300" />);
    }
    return stars;
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0D15] text-gray-900 dark:text-[#F5F2FA] pt-20 pb-16 px-4 animate-fade-in">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-plum dark:text-[#F5F2FA] tracking-tight">
              My Skill Swaps
            </h1>
            <p className="text-brand-orchid dark:text-gray-300 text-base mt-1">
              Track incoming proposals, ongoing learning exchanges, and history.
            </p>
          </div>
          <Link
            to="/browse"
            className="self-start sm:self-auto px-5 py-2.5 rounded-2xl bg-brand-pink text-brand-night font-bold shadow hover:bg-white transition-colors text-sm flex items-center gap-1.5"
          >
            Find New Skills <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tabs Filter */}
        <div className="flex bg-white dark:bg-[#1A1625] p-1 rounded-2xl shadow-sm border border-brand-pink/30 dark:border-[#2D263B] max-w-md">
          {[
            { key: 'all', label: 'All Swaps' },
            { key: 'pending', label: 'Pending' },
            { key: 'accepted', label: 'Active' },
            { key: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-brand-plum dark:bg-[#A78BFA] text-white dark:text-gray-950 shadow'
                  : 'text-brand-plum dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#262035]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Swaps List */}
        <div className="space-y-6">
          {swaps.length === 0 ? (
            <div className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-card border border-brand-pink/20 dark:border-[#2D263B] p-12 text-center">
              <p className="text-brand-plum dark:text-[#F5F2FA] text-xl font-bold mb-2">No skill swaps found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {activeTab === 'all'
                  ? "You haven't requested or received any skill exchanges yet."
                  : `No ${activeTab} skill exchanges found.`}
              </p>
              <Link
                to="/browse"
                className="px-6 py-3 rounded-2xl bg-brand-plum text-white font-bold shadow hover:bg-brand-mauve transition-colors text-sm inline-flex items-center gap-2"
              >
                Browse Skills Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            swaps.map((swap) => {
              const isRequester = swap.requester?._id?.toString() === currentUser?._id?.toString();
              const otherUser = isRequester ? swap.recipient : swap.requester;

              return (
                <div
                  key={swap._id}
                  className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-md border border-brand-pink/30 dark:border-[#2D263B] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-xl transition-shadow"
                >
                  {/* Left: User Info */}
                  <div className="flex items-start gap-4 shrink-0">
                    <Link to={`/user/${otherUser?._id}`} className="shrink-0 group">
                      {otherUser?.profilePhoto ? (
                        <img
                          src={otherUser.profilePhoto}
                          alt={otherUser.name}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-brand-pink shadow transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand-night text-white font-extrabold flex items-center justify-center text-2xl shadow transition-transform group-hover:scale-105">
                          {otherUser?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </Link>

                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/user/${otherUser?._id}`}
                          className="text-lg md:text-xl font-extrabold text-brand-plum dark:text-[#F5F2FA] hover:text-brand-orchid dark:hover:text-[#A78BFA]"
                        >
                          {otherUser?.name}
                        </Link>
                        {getStatusBadge(swap.status)}
                      </div>
                      <span className="text-xs text-gray-400 block mt-0.5">
                        {isRequester ? 'Outgoing Proposal' : 'Incoming Request'}
                      </span>
                      <span className="text-xs text-brand-orchid dark:text-purple-300 flex items-center gap-1 mt-1 font-semibold">
                        <Coins className="w-3.5 h-3.5" />
                        {swap.duration || 1} hr exchange ({swap.duration || 1} credit)
                      </span>
                    </div>
                  </div>

                  {/* Center: Exchange Summary */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="bg-green-50 dark:bg-emerald-950/40 border border-green-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl">
                        <span className="font-bold text-green-800 dark:text-emerald-300">
                          {isRequester ? 'You teach:' : `${otherUser?.name} teaches:`}
                        </span>{' '}
                        <span className="text-green-950 dark:text-emerald-100 font-semibold">{swap.offeredSkill?.name}</span>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-xl">
                        <span className="font-bold text-blue-800 dark:text-blue-300">
                          {isRequester ? 'You learn:' : `${otherUser?.name} learns:`}
                        </span>{' '}
                        <span className="text-blue-950 dark:text-blue-100 font-semibold">{swap.requestedSkill?.name}</span>
                      </div>
                    </div>

                    {swap.message && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 italic line-clamp-1 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        "{swap.message}"
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Created: {formatDate(swap.createdAt)}
                      </span>
                      {swap.scheduledDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Scheduled: {formatDate(swap.scheduledDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap md:flex-col items-center md:items-end justify-end gap-2 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-[#2D263B]">
                    <Link
                      to={`/swaps/${swap._id}`}
                      className="px-4 py-2 rounded-xl bg-brand-pink text-brand-night font-bold text-xs shadow hover:bg-brand-blush transition-colors"
                    >
                      View Details & Chat
                    </Link>

                    {swap.status === 'pending' && !isRequester && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(swap._id)}
                          className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleReject(swap._id)}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>
                    )}

                    {swap.status === 'pending' && isRequester && (
                      <button
                        onClick={() => handleCancel(swap._id)}
                        className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-600 dark:text-gray-300 font-semibold text-xs"
                      >
                        Cancel Request
                      </button>
                    )}

                    {swap.status === 'accepted' && (
                      <button
                        onClick={() => handleComplete(swap._id)}
                        className="px-4 py-2 rounded-xl bg-brand-plum hover:bg-brand-mauve text-white font-bold text-xs shadow"
                      >
                        Complete Exchange
                      </button>
                    )}

                    {swap.status === 'completed' && (
                      <>
                        {((isRequester && swap.requesterRating?.rating) ||
                          (!isRequester && swap.recipientRating?.rating)) ? (
                          <div className="flex items-center gap-1 text-xs text-yellow-600 font-bold bg-yellow-50 dark:bg-yellow-950/40 px-2.5 py-1 rounded-xl border border-yellow-200 dark:border-yellow-800">
                            {renderStars(isRequester ? swap.requesterRating.rating : swap.recipientRating.rating)}
                            <span className="ml-1">Reviewed</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => openRatingModal(swap)}
                            className="px-3 py-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xs shadow flex items-center gap-1"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" /> Leave Review
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rating Modal */}
        {showRatingModal && ratingSwap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1A1625] text-gray-900 dark:text-[#F5F2FA] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-purple-100 dark:border-[#2D263B]">
              <h2 className="text-2xl font-bold text-brand-plum dark:text-[#F5F2FA] mb-2">Review Skill Exchange</h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-6">
                Share feedback on your exchange experience.
              </p>

              <form onSubmit={handleSubmitRating} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-brand-plum dark:text-[#F5F2FA] mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingData({ ...ratingData, rating: star })}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-110 ${
                          ratingData.rating >= star
                            ? 'bg-yellow-400 text-white shadow'
                            : 'bg-gray-100 dark:bg-[#262035] text-gray-400'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-plum dark:text-[#F5F2FA] mb-1">Feedback Comment</label>
                  <textarea
                    value={ratingData.comment}
                    onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
                    rows={3}
                    placeholder="Share what went well or what you learned..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] focus:outline-none focus:ring-2 focus:ring-brand-orchid text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeRatingModal}
                    disabled={ratingLoading}
                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-[#262035]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={ratingLoading}
                    className="px-5 py-2 rounded-xl bg-brand-plum hover:bg-brand-mauve text-white font-bold text-sm shadow transition-colors"
                  >
                    {ratingLoading ? 'Submitting...' : 'Submit Review'}
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

export default Swaps;