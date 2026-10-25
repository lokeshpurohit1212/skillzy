import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Star, 
  MessageSquare, 
  Check, 
  X,
  Send,
  Clock,
  Coins
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const SwapDetail = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [swap, setSwap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Rating state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({ rating: 5, comment: '' });
  const [submittingRating, setSubmittingRating] = useState(false);

  // Messaging state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchSwap = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/swaps/${id}`);
      setSwap(response.data);
    } catch (error) {
      console.error('Error fetching swap:', error);
      toast.error('Failed to load swap details');
      navigate('/swaps');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await api.get(`/messages/swap/${id}`);
      setMessages(response.data || []);
    } catch (error) {
      // Don't show toast on background poll
    }
  }, [id]);

  useEffect(() => {
    fetchSwap();
  }, [fetchSwap]);

  // Poll messages every 6 seconds if swap is accessible
  useEffect(() => {
    if (swap && swap.status !== 'rejected') {
      fetchMessages();
      const interval = setInterval(fetchMessages, 6000);
      return () => clearInterval(interval);
    }
  }, [swap, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const response = await api.post('/messages', {
        swapId: id,
        text: newMessage.trim()
      });
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await api.put(`/swaps/${id}/accept`);
      toast.success('Swap request accepted!');
      fetchSwap();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept swap');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await api.put(`/swaps/${id}/reject`);
      toast.success('Swap request rejected');
      fetchSwap();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject swap');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      const res = await api.put(`/swaps/${id}/complete`);
      toast.success(res.data?.message || 'Swap marked as completed!');
      fetchSwap();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete swap');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this swap?')) return;
    setActionLoading(true);
    try {
      await api.put(`/swaps/${id}/cancel`);
      toast.success('Swap request cancelled');
      fetchSwap();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel swap');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setSubmittingRating(true);
    try {
      await api.post(`/swaps/${id}/rate`, ratingData);
      toast.success('Rating submitted successfully!');
      setShowRatingModal(false);
      setRatingData({ rating: 5, comment: '' });
      fetchSwap();
      window.dispatchEvent(new Event('refresh-users'));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'Pending Request' },
      accepted: { color: 'bg-green-100 text-green-800 border-green-300', text: 'Accepted / Active' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-300', text: 'Declined' },
      completed: { color: 'bg-purple-100 text-purple-800 border-purple-300', text: 'Completed' },
      cancelled: { color: 'bg-gray-100 text-gray-700 border-gray-300', text: 'Cancelled' }
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700 border-gray-300', text: status };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  if (!swap) {
    return (
      <div className="text-center py-20">
        <p className="text-brand-plum text-xl font-bold">Swap exchange not found</p>
        <Link to="/swaps" className="text-brand-orchid hover:underline mt-2 inline-block">
          Return to My Swaps
        </Link>
      </div>
    );
  }

  const isRequester = swap.requester?._id?.toString() === currentUser?._id?.toString();
  const isRecipient = swap.recipient?._id?.toString() === currentUser?._id?.toString();
  
  // Can rate if completed and current user hasn't rated yet
  const canRate = swap.status === 'completed' && 
    ((isRequester && !swap.requesterRating?.rating) || 
     (isRecipient && !swap.recipientRating?.rating));

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16 px-4 animate-fade-in">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/swaps')}
            className="flex items-center text-brand-mauve hover:text-brand-plum font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Swaps
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Status:</span>
            {getStatusBadge(swap.status)}
          </div>
        </div>

        {/* Swap Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-brand-pink/30 p-6 md:p-8">
          <div className="border-b border-gray-100 pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-brand-plum">
                Skill Exchange Details
              </h1>
              <p className="text-sm text-brand-orchid mt-1">
                Created on {formatDate(swap.createdAt)}
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-brand-pink/10 border border-brand-pink/20 px-4 py-2 rounded-2xl">
              <Coins className="w-5 h-5 text-brand-plum" />
              <div className="text-left">
                <span className="text-xs text-brand-orchid block leading-none">Exchange Value</span>
                <span className="font-extrabold text-brand-plum text-sm">{swap.duration || 1} Time Credit(s) ({swap.duration || 1} hr)</span>
              </div>
            </div>
          </div>

          {/* Participant Columns */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Requester Column */}
            <div className="bg-brand-pink/5 rounded-2xl p-5 border border-brand-pink/20">
              <div className="flex items-center gap-3 mb-4">
                {swap.requester?.profilePhoto ? (
                  <img src={swap.requester.profilePhoto} alt={swap.requester.name} className="w-12 h-12 rounded-full object-cover border-2 border-brand-plum" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-plum text-white font-bold flex items-center justify-center text-lg">
                    {swap.requester?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-brand-plum text-base">
                    {isRequester ? 'You (Requester)' : swap.requester?.name}
                  </h3>
                  <Link to={`/user/${swap.requester?._id}`} className="text-xs text-brand-orchid hover:underline">
                    View Profile →
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-3.5 rounded-xl border border-green-200">
                  <span className="text-xs font-bold text-green-700 block mb-0.5">Teaches / Offers:</span>
                  <p className="font-bold text-gray-900">{swap.offeredSkill?.name}</p>
                  {swap.offeredSkill?.description && (
                    <p className="text-xs text-gray-600 mt-1">{swap.offeredSkill.description}</p>
                  )}
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-blue-200">
                  <span className="text-xs font-bold text-blue-700 block mb-0.5">Learns / Requests:</span>
                  <p className="font-bold text-gray-900">{swap.requestedSkill?.name}</p>
                  {swap.requestedSkill?.description && (
                    <p className="text-xs text-gray-600 mt-1">{swap.requestedSkill.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recipient Column */}
            <div className="bg-brand-orchid/5 rounded-2xl p-5 border border-brand-orchid/20">
              <div className="flex items-center gap-3 mb-4">
                {swap.recipient?.profilePhoto ? (
                  <img src={swap.recipient.profilePhoto} alt={swap.recipient.name} className="w-12 h-12 rounded-full object-cover border-2 border-brand-orchid" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-orchid text-white font-bold flex items-center justify-center text-lg">
                    {swap.recipient?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-brand-plum text-base">
                    {isRecipient ? 'You (Recipient)' : swap.recipient?.name}
                  </h3>
                  <Link to={`/user/${swap.recipient?._id}`} className="text-xs text-brand-orchid hover:underline">
                    View Profile →
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-3.5 rounded-xl border border-blue-200">
                  <span className="text-xs font-bold text-blue-700 block mb-0.5">Teaches:</span>
                  <p className="font-bold text-gray-900">{swap.requestedSkill?.name}</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-green-200">
                  <span className="text-xs font-bold text-green-700 block mb-0.5">Learns:</span>
                  <p className="font-bold text-gray-900">{swap.offeredSkill?.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Initial Proposal Message */}
          {swap.message && (
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-brand-orchid mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-brand-plum block">Initial Proposal Message:</span>
                  <p className="text-sm text-gray-700 mt-0.5">{swap.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Key Dates & Completion Info */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-6 text-xs text-gray-500">
            {swap.scheduledDate && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-orchid" />
                Scheduled: {formatDate(swap.scheduledDate)}
              </span>
            )}
            {swap.completedDate && (
              <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                <Check className="w-4 h-4" />
                Completed: {formatDate(swap.completedDate)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-100">
            {swap.status === 'pending' && isRecipient && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Accept Swap
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Decline
                </button>
              </>
            )}

            {swap.status === 'pending' && isRequester && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-gray-200 hover:bg-red-100 hover:text-red-700 text-gray-700 font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel Proposal
              </button>
            )}

            {swap.status === 'accepted' && (
              <>
                <button
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-brand-plum hover:bg-brand-mauve text-white font-bold rounded-xl shadow transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Mark Completed & Transfer Credits
                </button>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-colors"
                >
                  Cancel Swap
                </button>
              </>
            )}

            {canRate && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow transition-colors flex items-center gap-2"
              >
                <Star className="w-4 h-4" /> Leave Review
              </button>
            )}
          </div>
        </div>

        {/* Reviews Section if already submitted */}
        {((swap.requesterRating?.rating) || (swap.recipientRating?.rating)) && (
          <div className="bg-white rounded-3xl shadow-xl border border-brand-pink/30 p-6 md:p-8">
            <h3 className="text-xl font-bold text-brand-plum mb-4">Exchange Reviews</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {swap.requesterRating?.rating && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-brand-plum">
                      {isRequester ? 'Your Review' : `${swap.requester?.name}'s Review`}
                    </span>
                    <div className="flex items-center gap-1">
                      {renderStars(swap.requesterRating.rating)}
                    </div>
                  </div>
                  {swap.requesterRating.comment && (
                    <p className="text-xs text-gray-700 italic">"{swap.requesterRating.comment}"</p>
                  )}
                  <span className="text-[10px] text-gray-400 mt-2 block">
                    {formatDate(swap.requesterRating.date)}
                  </span>
                </div>
              )}

              {swap.recipientRating?.rating && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-brand-plum">
                      {isRecipient ? 'Your Review' : `${swap.recipient?.name}'s Review`}
                    </span>
                    <div className="flex items-center gap-1">
                      {renderStars(swap.recipientRating.rating)}
                    </div>
                  </div>
                  {swap.recipientRating.comment && (
                    <p className="text-xs text-gray-700 italic">"{swap.recipientRating.comment}"</p>
                  )}
                  <span className="text-[10px] text-gray-400 mt-2 block">
                    {formatDate(swap.recipientRating.date)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Real-Time Exchange Messaging Component */}
        <div className="bg-white rounded-3xl shadow-xl border border-brand-pink/30 overflow-hidden flex flex-col h-[520px]">
          {/* Messages Header */}
          <div className="bg-brand-night text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-brand-pink" />
              <div>
                <h3 className="font-bold text-base leading-tight">Conversation</h3>
                <p className="text-xs text-brand-pink/80">Direct messages for this skill exchange</p>
              </div>
            </div>
            <span className="text-xs text-white/60">Live Updates</span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FCFAFD]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <MessageSquare className="w-12 h-12 text-brand-pink/40 mb-2" />
                <p className="text-sm font-semibold text-brand-plum">No messages yet.</p>
                <p className="text-xs text-gray-500 max-w-xs mt-1">
                  Say hello, agree on a schedule, or exchange learning materials!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?._id?.toString() === currentUser?._id?.toString();
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[80%]">
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-brand-orchid text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {msg.sender?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm break-words ${
                          isMe
                            ? 'bg-brand-plum text-white rounded-br-xs'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs'
                        }`}
                      >
                        {!isMe && (
                          <span className="block text-[10px] font-bold text-brand-orchid mb-0.5">
                            {msg.sender?.name}
                          </span>
                        )}
                        <p>{msg.text}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Send Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                swap.status === 'cancelled' || swap.status === 'rejected'
                  ? 'Messaging closed for this exchange.'
                  : 'Type your message...'
              }
              disabled={swap.status === 'cancelled' || swap.status === 'rejected' || sendingMessage}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-orchid text-sm bg-gray-50 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sendingMessage || swap.status === 'cancelled' || swap.status === 'rejected'}
              className="bg-brand-pink hover:bg-brand-blush text-brand-night px-5 py-2.5 rounded-xl font-bold shadow text-sm transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-brand-plum mb-2">Review Skill Exchange</h2>
              <p className="text-xs text-gray-600 mb-6">
                Rate your experience exchanging skills with{' '}
                <span className="font-bold text-brand-plum">
                  {isRequester ? swap.recipient?.name : swap.requester?.name}
                </span>.
              </p>

              <form onSubmit={handleSubmitRating} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-brand-plum mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingData({ ...ratingData, rating: star })}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-110 ${
                          ratingData.rating >= star
                            ? 'bg-yellow-400 text-white shadow-md'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-plum mb-1">Feedback Comment</label>
                  <textarea
                    value={ratingData.comment}
                    onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
                    rows={4}
                    placeholder="Share what went well or what you learned..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-orchid text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRatingModal(false)}
                    disabled={submittingRating}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRating}
                    className="px-6 py-2.5 rounded-xl bg-brand-plum hover:bg-brand-mauve text-white font-bold text-sm shadow transition-colors"
                  >
                    {submittingRating ? 'Submitting...' : 'Submit Review'}
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

export default SwapDetail;