import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { User as UserIcon, MapPin, Users, Layers, MessageCircle, Flag, BarChart2 } from 'lucide-react';

const summaryColors = [
  'bg-[#5D3C64]',
  'bg-[#7B466A]',
  'bg-[#9F6496]',
  'bg-[#D391B0]'
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('skills');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [flaggedReviews, setFlaggedReviews] = useState([]);
const [reportsLoading, setReportsLoading] = useState(false);
const [adminSwaps, setAdminSwaps] = useState([]);
const [swapsLoading, setSwapsLoading] = useState(false);

  const fetchFlaggedReviews = async () => {
    try {
      setReportsLoading(true);

      const response = await api.get('/users/admin/flagged-reviews');

      setFlaggedReviews(response.data);
    } catch (error) {
      console.error('Failed to load flagged reviews:', error);
      toast.error(
        error.response?.data?.message || 'Failed to load reports'
      );
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchAdminSwaps = async () => {
  try {
    setSwapsLoading(true);

    const response = await api.get('/swaps/admin/all');

    setAdminSwaps(response.data);
  } catch (error) {
    console.error('Failed to load swaps:', error);
    toast.error(
      error.response?.data?.message || 'Failed to load swaps'
    );
  } finally {
    setSwapsLoading(false);
  }
};
  // Fetch all users for skill moderation
  useEffect(() => {
  if (activeTab === 'skills' || activeTab === 'users') {
    setLoading(true);
    setError('');

    api.get('/users/all')
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        setError('Failed to fetch users. Please check your admin permissions.');
        setLoading(false);
      });
  }
}, [activeTab]);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Remove a skill (offered or wanted)
  const handleRejectSkill = async (userId, skillId, type) => {
    setError('');
    setSuccess('');
    try {
      await api.delete(`/users/${type === 'offered' ? 'skills-offered' : 'skills-wanted'}/${skillId}`);
      setSuccess('Skill rejected successfully.');
      // Refresh users
      setUsers(users => users.map(u => {
        if (u._id !== userId) return u;
        return {
          ...u,
          skillsOffered: type === 'offered' ? u.skillsOffered.filter(s => s._id !== skillId) : u.skillsOffered,
          skillsWanted: type === 'wanted' ? u.skillsWanted.filter(s => s._id !== skillId) : u.skillsWanted,
        };
      }));
    } catch (err) {
      console.error('Failed to reject skill:', err);
      setError('Failed to reject skill. Please try again.');
    }
  };

  // Dashboard summary data (mocked for now)
  const summary = [
    { label: 'Users', value: users.length, icon: <Users className="w-6 h-6" /> },
    { label: 'Skills Offered', value: users.reduce((acc, u) => acc + (u.skillsOffered?.length || 0), 0), icon: <Layers className="w-6 h-6" /> },
    { label: 'Skills Wanted', value: users.reduce((acc, u) => acc + (u.skillsWanted?.length || 0), 0), icon: <BarChart2 className="w-6 h-6" /> },
    { label: 'Reports', value: 0, icon: <Flag className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 pb-16 px-4 animate-fade-in">
      {/* Header */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between bg-white rounded-3xl shadow-sm px-10 py-8 border border-purple-100 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-[#5D3C64]">Hi, Admin</h1>
          <p className="text-lg text-[#7B466A]">Ready to moderate skills and manage the platform?</p>
        </div>
        <div className="flex gap-4 mt-6 md:mt-0">
          <button
            className="bg-[#D391B0] text-[#0C0420] px-6 py-3 rounded-lg font-bold shadow hover:bg-[#BA6E8F] border border-[#7B466A] transition-colors"
            onClick={() => navigate('/')}
          >
            Back to Main
          </button>
          <button
            className="bg-[#7B466A] text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-[#5D3C64] border border-[#5D3C64] transition-colors"
            onClick={() => {
              localStorage.removeItem('adminToken');
              navigate('/admin/login');
            }}
          >
            Logout
          </button>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="w-full max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 mb-8">
        {summary.map((item, idx) => (
          <div key={item.label} className={`rounded-2xl shadow ${summaryColors[idx]} text-white p-6 flex flex-col items-center`}>
            {item.icon}
            <span className="text-2xl font-bold mt-2">{item.value}</span>
            <span className="mt-1 text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>
      {/* Main Content Area */}
      <div className="w-full max-w-7xl flex gap-8">
        {/* Sidebar */}
        <div className="w-64 bg-white border border-[#E5D0E3] rounded-3xl shadow-lg flex flex-col py-8 px-4 gap-2">
          <button className={`flex items-center gap-3 text-left px-4 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'skills' ? 'bg-[#D391B0] text-[#0C0420] shadow' : 'hover:bg-gray-100 text-[#5D3C64]'}`} onClick={() => setActiveTab('skills')}><Layers className="w-5 h-5" /> Skill Moderation</button>
          <button className={`flex items-center gap-3 text-left px-4 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'users' ? 'bg-[#D391B0] text-[#0C0420] shadow' : 'hover:bg-gray-100 text-[#5D3C64]'}`} onClick={() => setActiveTab('users')}><Users className="w-5 h-5" /> User Management</button>
          <button className={`flex items-center gap-3 text-left px-4 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'swaps' ? 'bg-[#D391B0] text-[#0C0420] shadow' : 'hover:bg-gray-100 text-[#5D3C64]'}`} onClick={() => setActiveTab('swaps')}><BarChart2 className="w-5 h-5" /> Swap Monitoring</button>
          <button className={`flex items-center gap-3 text-left px-4 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'messages' ? 'bg-[#D391B0] text-[#0C0420] shadow' : 'hover:bg-gray-100 text-[#5D3C64]'}`} onClick={() => setActiveTab('messages')}><MessageCircle className="w-5 h-5" /> Platform Messages</button>
          <button className={`flex items-center gap-3 text-left px-4 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'reports' ? 'bg-[#D391B0] text-[#0C0420] shadow' : 'hover:bg-gray-100 text-[#5D3C64]'}`} onClick={() => setActiveTab('reports')}><Flag className="w-5 h-5" /> Reports</button>
        </div>
        {/* Main Content */}
        <div className="flex-1 min-h-[500px] bg-white rounded-3xl shadow-lg border-2 border-[#9F6496] p-10 flex flex-col gap-8 animate-fade-in transition-all duration-500 mt-0">
          {activeTab === 'skills' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-[#5D3C64]">Skill Moderation</h2>
              <p className="text-[#7B466A] mb-4">
  Review skills submitted by community members and remove inappropriate or unsuitable skills.
</p>
              {loading ? <LoadingSpinner /> : (
                <>
                  {error && <div className="text-red-600 mb-4 font-semibold bg-red-50 border border-red-200 rounded-lg px-4 py-2 shadow">{error}</div>}
                  {success && <div className="text-green-600 mb-4 font-semibold bg-green-50 border border-green-200 rounded-lg px-4 py-2 shadow">{success}</div>}
                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {users.length === 0 && <div className="text-gray-400">No users found.</div>}
                    {users.filter(user => user._id !== 'admin').map(user => (
                      <div key={user._id} className="w-full bg-white/80 rounded-2xl shadow-lg border-2 border-[#D391B0] p-8 flex flex-col md:flex-row items-center gap-8 hover:shadow-2xl transition-shadow mx-auto relative">
                        {/* Avatar */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center">
                          {user.profilePhoto ? (
                            <img src={user.profilePhoto} alt="avatar" className="w-28 h-28 rounded-full object-cover border-4 border-[#7B466A] shadow-lg" />
                          ) : (
                            <div className="w-28 h-28 bg-[#7B466A] rounded-full flex items-center justify-center text-5xl text-white font-bold shadow-lg border-4 border-[#7B466A]">
                              <UserIcon className="w-14 h-14" />
                            </div>
                          )}
                        </div>
                        {/* User Info and Skills */}
                        <div className="flex-1 flex flex-col gap-3 justify-center">
                          <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-2">
                            <span className="font-bold text-2xl text-[#0C0420]">{user.name}</span>
                            {user.location && (
                              <span className="flex items-center gap-1 text-[#7B466A] text-base mt-1 md:mt-0"><MapPin className="w-5 h-5" />{user.location}</span>
                            )}
                          </div>
                          <div className="mt-2">
                            <span className="font-semibold text-[#5D3C64] block mb-1">Skills Offered:</span>
                            <div className="flex flex-wrap gap-3">
                              {user.skillsOffered && user.skillsOffered.length > 0 ? user.skillsOffered.map(skill => (
                                <span key={skill._id} className="inline-flex items-center gap-2 px-5 py-2 rounded-full border-2 border-[#D391B0] bg-white text-[#7B466A] font-semibold shadow-sm text-base">
                                  {skill.name}
                                  <button className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-[#D391B0] hover:bg-[#BA6E8F] transition-colors" onClick={() => handleRejectSkill(user._id, skill._id, 'offered')}>Reject</button>
                                </span>
                              )) : <span className="text-gray-400 ml-2">None</span>}
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="font-semibold text-[#5D3C64] block mb-1">Skills Wanted:</span>
                            <div className="flex flex-wrap gap-3">
                              {user.skillsWanted && user.skillsWanted.length > 0 ? user.skillsWanted.map(skill => (
                                <span key={skill._id} className="inline-flex items-center gap-2 px-5 py-2 rounded-full border-2 border-[#7B466A] bg-white text-[#0C0420] font-semibold shadow-sm text-base">
                                  {skill.name}
                                  <button className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-[#7B466A] hover:bg-[#5D3C64] transition-colors" onClick={() => handleRejectSkill(user._id, skill._id, 'wanted')}>Reject</button>
                                </span>
                              )) : <span className="text-gray-400 ml-2">None</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === 'users' && (
  <div className="max-h-[60vh] overflow-y-auto pr-2">
    <h2 className="text-2xl font-bold mb-2 text-[#5D3C64]">
      User Management
    </h2>

    <p className="text-[#7B466A] mb-5">
      View registered users, their activity, ratings, and time credit balances.
    </p>

    {users.length === 0 ? (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <p className="text-gray-500">
          No users found.
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white border border-[#D391B0] rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              
              {/* User information */}
              <div className="flex items-center gap-4">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#D391B0]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#7B466A] text-white flex items-center justify-center text-xl font-bold">
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : 'U'}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-[#5D3C64]">
                    {user.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Account status */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  user.isPublic
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {user.isPublic ? 'Public' : 'Private'}
              </span>
            </div>

            {/* User statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">

              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-[#5D3C64]">
                  {user.skillsOffered?.length || 0}
                </p>
                <p className="text-xs text-gray-500">
                  Skills Offered
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-[#5D3C64]">
                  {user.skillsWanted?.length || 0}
                </p>
                <p className="text-xs text-gray-500">
                  Skills Wanted
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-[#5D3C64]">
                  {user.swapsCompleted || 0}
                </p>
                <p className="text-xs text-gray-500">
                  Swaps Completed
                </p>
              </div>

              <div className="bg-[#D391B0] rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-[#0C0420]">
                  {typeof user.timeCredits === 'number'
                    ? user.timeCredits
                    : 0}
                </p>
                <p className="text-xs font-semibold text-[#0C0420]">
                  Time Credits
                </p>
              </div>

            </div>

            {/* Rating */}
            <div className="mt-4 text-sm text-[#7B466A]">
              <strong>Rating:</strong>{' '}
              {typeof user.ratingAverage === 'number'
                ? `${user.ratingAverage.toFixed(1)} / 5`
                : 'Not rated yet'}
            </div>

          </div>
        ))}
      </div>
    )}
  </div>
)}
          {activeTab === 'swaps' && (
  <div className="max-h-[60vh] overflow-y-auto pr-2">
    <h2 className="text-2xl font-bold mb-2 text-[#5D3C64]">
      Swap Monitoring
    </h2>

    <p className="text-[#7B466A] mb-5">
      Monitor all skill exchanges and their current status.
    </p>

    <button
      onClick={fetchAdminSwaps}
      disabled={swapsLoading}
      className="mb-6 px-5 py-2 rounded-lg bg-[#7B466A] text-white font-semibold hover:bg-[#5D3C64] transition-colors disabled:opacity-60"
    >
      {swapsLoading ? 'Loading...' : 'Load All Swaps'}
    </button>

    {adminSwaps.length === 0 && !swapsLoading ? (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <p className="text-gray-500">
          No swaps found.
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {adminSwaps.map((swap) => (
          <div
            key={swap._id}
            className="bg-white border border-[#D391B0] rounded-xl p-5 shadow-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-bold text-[#5D3C64]">
                  {swap.offeredSkill?.name || 'Skill'}
                  {' → '}
                  {swap.requestedSkill?.name || 'Skill'}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {swap.requester?.name || 'Unknown'} →{' '}
                  {swap.recipient?.name || 'Unknown'}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  swap.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : swap.status === 'accepted'
                    ? 'bg-blue-100 text-blue-700'
                    : swap.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : swap.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {swap.status}
              </span>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
              <p>
                <strong>Requester:</strong>{' '}
                {swap.requester?.name || 'Unknown'}
              </p>

              <p>
                <strong>Recipient:</strong>{' '}
                {swap.recipient?.name || 'Unknown'}
              </p>

              <p>
                <strong>Duration:</strong>{' '}
                {swap.duration || 0} hour(s)
              </p>

              <p>
                <strong>Created:</strong>{' '}
                {swap.createdAt
                  ? new Date(swap.createdAt).toLocaleDateString()
                  : 'Unknown'}
              </p>
            </div>

            {swap.message && (
              <div className="mt-4 bg-gray-50 rounded-lg p-3 text-sm">
                <strong>Message:</strong> {swap.message}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}
          {activeTab === 'messages' && (
  <div className="max-h-[60vh] overflow-y-auto pr-2">
    <h2 className="text-2xl font-bold mb-2 text-[#5D3C64]">
      Platform Messages
    </h2>

    <p className="text-[#7B466A] mb-5">
      Prepare announcements and important information for Skillzy members.
    </p>

    <div className="bg-white border border-[#D391B0] rounded-xl p-5 shadow-sm">
      <label className="block font-semibold text-[#5D3C64] mb-2">
        Announcement Title
      </label>

      <input
        type="text"
        placeholder="Enter announcement title"
        className="w-full px-4 py-3 rounded-lg border border-[#D391B0] focus:outline-none focus:ring-2 focus:ring-[#7B466A]"
      />

      <label className="block font-semibold text-[#5D3C64] mt-5 mb-2">
        Message
      </label>

      <textarea
        rows="5"
        placeholder="Write your platform announcement..."
        className="w-full px-4 py-3 rounded-lg border border-[#D391B0] focus:outline-none focus:ring-2 focus:ring-[#7B466A]"
      />

      <button
        type="button"
        onClick={() =>
          toast.success('Announcement prepared successfully.')
        }
        className="mt-5 px-6 py-3 rounded-lg bg-[#7B466A] text-white font-semibold hover:bg-[#5D3C64] transition-colors"
      >
        Prepare Announcement
      </button>
    </div>

    <div className="mt-5 bg-gray-50 border border-gray-200 rounded-xl p-5">
      <h3 className="font-bold text-[#5D3C64] mb-2">
        Admin Notice
      </h3>

      <p className="text-sm text-gray-600">
        Platform announcements are currently prepared from the admin
        dashboard. A delivery system can be added later if needed.
      </p>
    </div>
  </div>
)}
          {activeTab === 'reports' && (
  <div className="max-h-[60vh] overflow-y-auto pr-2">
    <h2 className="text-2xl font-bold mb-2 text-[#5D3C64]">
      Reports
    </h2>

    <p className="text-[#7B466A] mb-5">
      Review flagged content submitted by users.
    </p>

    <button
      onClick={fetchFlaggedReviews}
      disabled={reportsLoading}
      className="mb-6 px-5 py-2 rounded-lg bg-[#7B466A] text-white font-semibold hover:bg-[#5D3C64] transition-colors disabled:opacity-60"
    >
      {reportsLoading ? 'Loading...' : 'Load Flagged Reviews'}
    </button>

    {flaggedReviews.length === 0 && !reportsLoading ? (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <p className="text-gray-500">
          No flagged reviews found.
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {flaggedReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-[#D391B0] rounded-xl p-5 shadow-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-bold text-[#5D3C64]">
                  Review for {review.userName}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Reviewer:{' '}
                  {review.reviewer?.name || 'Unknown'}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold">
                🚩 Flagged
              </span>
            </div>

            <div className="mt-4">
              <p className="text-yellow-600 font-bold">
                {'⭐'.repeat(review.rating)}
              </p>

              {review.comment && (
                <p className="mt-2 text-gray-700">
                  "{review.comment}"
                </p>
              )}
            </div>

            <div className="mt-4 bg-gray-50 rounded-lg p-3 text-sm">
              <p>
                <strong>Flagged by:</strong>{' '}
                {review.flaggedBy?.name || 'Unknown'}
              </p>

              <p className="mt-1">
                <strong>Reason:</strong>{' '}
                {review.flaggedReason || 'No reason provided'}
              </p>

              {review.flaggedDate && (
                <p className="mt-1">
                  <strong>Date:</strong>{' '}
                  {new Date(review.flaggedDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 