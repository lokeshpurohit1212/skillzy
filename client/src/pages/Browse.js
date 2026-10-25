import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Search, 
  MapPin, 
  Clock, 
  Filter, 
  X, 
  Sparkles, 
  ArrowRight,
  Coins,
  Flame,
  Award
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

const Browse = () => {
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'matches'
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Swap Modal
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapTarget, setSwapTarget] = useState(null);
  const [mySkill, setMySkill] = useState('');
  const [theirSkill, setTheirSkill] = useState('');
  const [swapMessage, setSwapMessage] = useState('');
  const [swapDuration, setSwapDuration] = useState(1);
  const [swapLoading, setSwapLoading] = useState(false);

  const USERS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.skill) params.append('skill', filters.skill);
      if (filters.location) params.append('location', filters.location);
      if (filters.availability) params.append('availability', filters.availability);

      const response = await api.get(`/users/browse?${params.toString()}`);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchMatches = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setMatchesLoading(true);
      const response = await api.get('/users/matches');
      setMatches(response.data || []);
    } catch (error) {
      console.error('Error fetching complementary matches:', error);
    } finally {
      setMatchesLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUsers();
    if (isAuthenticated) {
      fetchMatches();
    }
    const handler = () => {
      fetchUsers();
      if (isAuthenticated) fetchMatches();
    };
    window.addEventListener('refresh-users', handler);
    return () => window.removeEventListener('refresh-users', handler);
  }, [fetchUsers, fetchMatches, isAuthenticated]);

  const handleSearch = () => {
    setFilters({
      skill: searchTerm.trim(),
      location: location.trim(),
      availability
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocation('');
    setAvailability('');
    setFilters({});
    setCurrentPage(1);
  };

  const getAvailabilityText = (user) => {
    const avail = user.availability || {};
    const options = [];
    if (avail.weekdays) options.push('Weekdays');
    if (avail.weekends) options.push('Weekends');
    if (avail.evenings) options.push('Evenings');
    if (avail.mornings) options.push('Mornings');
    return options.length > 0 ? options.join(', ') : 'Flexible schedule';
  };

  const openSwapModal = (targetUser) => {
    if (!isAuthenticated) {
      toast.error('Please log in to request a skill swap');
      navigate('/login');
      return;
    }
    setSwapTarget(targetUser);
    setMySkill(currentUser?.skillsOffered?.[0]?.name || '');
    setTheirSkill(targetUser?.skillsOffered?.[0]?.name || '');
    setSwapMessage('');
    setSwapDuration(1);
    setShowSwapModal(true);
  };

  const closeSwapModal = () => {
    setShowSwapModal(false);
    setSwapTarget(null);
  };

  const handleSendSwap = async (e) => {
    e.preventDefault();
    if (!mySkill || !theirSkill) {
      toast.error('Please select both skills');
      return;
    }
    setSwapLoading(true);
    try {
      await api.post('/swaps', {
        recipientId: swapTarget._id,
        requestedSkill: { name: theirSkill },
        offeredSkill: { name: mySkill },
        duration: Number(swapDuration),
        message: swapMessage
      });
      toast.success('Swap request sent successfully!');
      closeSwapModal();
    } catch (error) {
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
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">★</span>);
    }
    const emptyStars = 5 - Math.ceil(rating || 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>);
    }
    return stars;
  };

  const displayedList = activeTab === 'matches' ? matches : users;
  const publicUsers = displayedList.filter(user => user.isPublic && user._id !== 'admin');
  const totalPages = Math.ceil(publicUsers.length / USERS_PER_PAGE);
  const paginatedUsers = publicUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0D15] text-gray-900 dark:text-[#F5F2FA] pt-20 pb-16 px-4 animate-fade-in transition-colors duration-200">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-plum dark:text-purple-200 tracking-tight">
              Discover & Swap Skills
            </h1>
            <p className="text-brand-orchid dark:text-purple-300 text-base mt-1">
              Find teachers, explore complementary matches, and trade knowledge directly.
            </p>
          </div>

          {/* Switch tabs between All and Matches if logged in */}
          {isAuthenticated && (
            <div className="flex bg-white dark:bg-[#1A1625] p-1 rounded-2xl shadow-sm border border-brand-pink/30 dark:border-[#2D263B] self-start sm:self-auto">
              <button
                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-brand-plum text-white shadow dark:bg-purple-600'
                    : 'text-brand-plum dark:text-purple-200 hover:bg-gray-100 dark:hover:bg-[#262035]'
                }`}
              >
                All Skills ({users.length})
              </button>
              <button
                onClick={() => { setActiveTab('matches'); setCurrentPage(1); }}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'matches'
                    ? 'bg-brand-pink text-brand-night shadow font-black'
                    : 'text-brand-orchid dark:text-purple-300 hover:bg-gray-100 dark:hover:bg-[#262035]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-brand-pink" />
                Complementary Matches ({matches.length})
              </button>
            </div>
          )}
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-md border border-brand-pink/30 dark:border-[#2D263B] p-6 space-y-4 transition-colors">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search skills (e.g. JavaScript, Guitar, Photography, Spanish)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-[#2D263B] focus:outline-none focus:ring-2 focus:ring-brand-pink text-sm bg-gray-50 focus:bg-white dark:bg-[#13111C] dark:focus:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA] placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-5 py-3 rounded-2xl border border-brand-orchid/40 dark:border-purple-800 text-brand-plum dark:text-purple-200 font-semibold text-sm hover:bg-brand-pink/10 dark:hover:bg-purple-950/40 transition-colors flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters {filters.location || filters.availability ? '(Active)' : ''}
            </button>

            <button
              onClick={handleSearch}
              className="px-7 py-3 rounded-2xl bg-brand-plum hover:bg-brand-mauve dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

          {/* Advanced Filter Drawer */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-100 dark:border-[#2D263B] grid sm:grid-cols-2 gap-4 animate-slide-up">
              <div>
                <label className="block text-xs font-bold text-brand-plum dark:text-purple-200 mb-1">Location Filter</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="City, State, or Country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-[#2D263B] bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA] focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-plum dark:text-purple-200 mb-1">Availability</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-[#2D263B] bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA] focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  >
                    <option value="">Any Schedule</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="evenings">Evenings</option>
                    <option value="mornings">Mornings</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-gray-500 hover:text-red-500 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Card Feed */}
        {loading || (activeTab === 'matches' && matchesLoading) ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : publicUsers.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-12 text-center shadow-card border border-brand-pink/20 dark:border-[#2D263B] transition-colors">
            <Sparkles className="w-12 h-12 text-brand-pink mx-auto mb-3" />
            <h3 className="text-xl font-bold text-brand-plum dark:text-purple-200">No members found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1">
              {activeTab === 'matches'
                ? "No direct complementary matches yet. Make sure you've added both skills offered and skills wanted in your Profile!"
                : 'Try adjusting your search keywords or clearing your filters.'}
            </p>
            {activeTab === 'matches' ? (
              <Link
                to="/profile"
                className="mt-4 inline-block bg-brand-pink text-brand-night font-bold px-5 py-2.5 rounded-xl shadow text-sm"
              >
                Update Profile Skills
              </Link>
            ) : (
              <button
                onClick={clearFilters}
                className="mt-4 bg-gray-100 dark:bg-[#262035] text-gray-700 dark:text-gray-300 font-semibold px-4 py-2 rounded-xl text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-md border border-brand-pink/30 dark:border-[#2D263B] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-xl transition-all"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-start gap-5 flex-1 min-w-0">
                  <Link to={`/user/${user._id}`} className="shrink-0 group">
                    {user.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-avatar.png';
                        }}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-brand-pink shadow transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-brand-night text-white font-extrabold flex items-center justify-center text-3xl shadow transition-transform group-hover:scale-105">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        to={`/user/${user._id}`}
                        className="text-2xl font-extrabold text-brand-plum dark:text-purple-200 hover:text-brand-orchid dark:hover:text-purple-300 transition-colors"
                      >
                        {user.name}
                      </Link>
                      {user.level && (
                        <span className="bg-purple-100 dark:bg-purple-950/60 text-[#5D3C64] dark:text-purple-200 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                          <Award className="w-3 h-3 text-brand-orchid" /> Lv {user.level}
                        </span>
                      )}
                      {user.streak?.count > 0 && (
                        <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" /> {user.streak.count}d streak
                        </span>
                      )}
                      {user.location && (
                        <span className="text-xs text-brand-orchid dark:text-purple-300 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {user.location}
                        </span>
                      )}
                      {user.isComplementary && (
                        <span className="bg-brand-pink/20 dark:bg-purple-900/40 text-brand-plum dark:text-purple-300 px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-brand-orchid" /> Mutual Match
                        </span>
                      )}
                    </div>

                    {/* Rating display */}
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      {typeof user.ratingAverage === 'number' && user.ratingCount > 0 ? (
                        <div className="flex items-center gap-1.5 font-bold text-brand-plum dark:text-purple-200">
                          <span>{renderStars(user.ratingAverage)}</span>
                          <span>{user.ratingAverage.toFixed(1)}</span>
                          <span className="text-gray-400 dark:text-gray-500 font-normal">({user.ratingCount} reviews)</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">New to Skillzy</span>
                      )}
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {user.swapsCompleted || 0} swaps completed
                      </span>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-2 leading-relaxed">
                        {user.bio}
                      </p>
                    )}

                    {/* Skills Grid */}
                    <div className="mt-4 grid sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-green-700 dark:text-emerald-400 block mb-1">
                          Offers for Teaching:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {user.skillsOffered?.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-green-50 dark:bg-emerald-950/40 text-green-800 dark:text-emerald-300 border border-green-200 dark:border-emerald-800/40"
                            >
                              {s.name}
                            </span>
                          ))}
                          {user.skillsOffered?.length > 3 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 self-center">
                              +{user.skillsOffered.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-blue-700 dark:text-sky-400 block mb-1">
                          Wants to Learn:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {user.skillsWanted?.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-sky-950/40 text-blue-800 dark:text-sky-300 border border-blue-200 dark:border-sky-800/40"
                            >
                              {s.name}
                            </span>
                          ))}
                          {user.skillsWanted?.length > 3 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 self-center">
                              +{user.skillsWanted.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-[#2D263B]">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 block">Schedule:</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {getAvailabilityText(user)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/user/${user._id}`}
                      className="px-4 py-2 rounded-xl border border-brand-plum dark:border-purple-400 text-brand-plum dark:text-purple-200 hover:bg-brand-plum dark:hover:bg-purple-600 hover:text-white font-bold text-xs transition-colors"
                    >
                      View Profile
                    </Link>

                    {currentUser && currentUser._id !== user._id && (
                      <button
                        onClick={() => openSwapModal(user)}
                        className="px-5 py-2 rounded-xl bg-brand-pink hover:bg-brand-blush text-brand-night font-extrabold text-xs shadow transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                      >
                        <span>Request Swap</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-brand-orchid dark:border-purple-500 text-brand-plum dark:text-purple-200 font-bold text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl border border-brand-orchid dark:border-purple-500 text-brand-plum dark:text-purple-200 font-bold text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

        {/* Quick Swap Proposal Modal */}
        {showSwapModal && swapTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1A1625] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2D263B] p-6 sm:p-8 max-w-lg w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-extrabold text-brand-plum dark:text-purple-200">
                  Swap with {swapTarget.name}
                </h3>
                <button onClick={closeSwapModal} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#262035] text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendSwap} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-plum dark:text-purple-200 mb-1">
                    Skill you want to learn from {swapTarget.name} *
                  </label>
                  <select
                    value={theirSkill}
                    onChange={(e) => setTheirSkill(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#2D263B] focus:outline-none focus:ring-2 focus:ring-brand-pink text-sm bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA]"
                  >
                    <option value="">Choose one of their skills</option>
                    {swapTarget.skillsOffered?.map((s) => (
                      <option key={s._id || s.name} value={s.name}>
                        {s.name} ({s.proficiency || 'Intermediate'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-plum dark:text-purple-200 mb-1">
                    Skill you offer in exchange *
                  </label>
                  <select
                    value={mySkill}
                    onChange={(e) => setMySkill(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#2D263B] focus:outline-none focus:ring-2 focus:ring-brand-pink text-sm bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA]"
                  >
                    <option value="">Choose from your offered skills</option>
                    {currentUser?.skillsOffered?.map((s) => (
                      <option key={s._id || s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {(!currentUser?.skillsOffered || currentUser.skillsOffered.length === 0) && (
                    <p className="text-[11px] text-red-500 mt-1">
                      You haven't listed any skills in your profile yet.{' '}
                      <Link to="/profile" className="underline font-bold">Add skills in Profile</Link>.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-plum dark:text-purple-200 mb-1">
                    Exchange Duration *
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
                  </select>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-brand-orchid" />
                    Your balance: {currentUser?.timeCredits ?? 5} credits.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-plum dark:text-purple-200 mb-1">
                    Message
                  </label>
                  <textarea
                    value={swapMessage}
                    onChange={(e) => setSwapMessage(e.target.value)}
                    rows={3}
                    placeholder="Introduce yourself and outline your learning goals..."
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#13111C] text-gray-900 dark:text-[#F5F2FA] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-pink text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeSwapModal}
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
                    {swapLoading ? 'Sending...' : 'Send Swap Request'}
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

export default Browse;