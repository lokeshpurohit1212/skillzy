import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Edit, MapPin, Star, LogOut, Camera } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../config/api';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    location: user?.location || '',
    bio: user?.bio || '',
    isPublic: user?.isPublic ?? true,
    availability: user?.availability || {
      weekdays: false,
      weekends: false,
      evenings: false,
      mornings: false,
      customSchedule: ''
    }
  });
  const [photoUploading, setPhotoUploading] = useState(false);
  const [newSkillOffered, setNewSkillOffered] = useState({ name: '', description: '', proficiency: 'Intermediate' });
  const [newSkillWanted, setNewSkillWanted] = useState({ name: '', description: '', priority: 'Medium' });
  const [showAddSkillOffered, setShowAddSkillOffered] = useState(false);
  const [showAddSkillWanted, setShowAddSkillWanted] = useState(false);
  const [newPortfolioItem, setNewPortfolioItem] = useState({ title: '', description: '', projectUrl: '', skillsUsed: '' });
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        location: user.location || '',
        bio: user.bio || '',
        isPublic: user.isPublic ?? true,
        availability: user.availability || {
          weekdays: false,
          weekends: false,
          evenings: false,
          mornings: false,
          customSchedule: ''
        }
      });
    }
    // Listen for refresh-users event to update profile
    const handler = async () => {
      try {
        const response = await api.get('/auth/me');
        updateUser(response.data.user);
      } catch (e) {}
    };
    window.addEventListener('refresh-users', handler);
    return () => window.removeEventListener('refresh-users', handler);
  }, [user, updateUser]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.put('/users/profile', {
        name: profileData.name,
        location: profileData.location,
        bio: profileData.bio,
        isPublic: profileData.isPublic,
        availability: profileData.availability
      });
      updateUser(response.data);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkillOffered = async () => {
    try {
      const response = await api.post('/users/skills-offered', newSkillOffered);
      updateUser({ ...user, skillsOffered: response.data });
      setNewSkillOffered({ name: '', description: '', proficiency: 'Intermediate' });
      setShowAddSkillOffered(false);
      toast.success('Skill added successfully!');
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error(error.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleAddSkillWanted = async () => {
    try {
      const response = await api.post('/users/skills-wanted', newSkillWanted);
      updateUser({ ...user, skillsWanted: response.data });
      setNewSkillWanted({ name: '', description: '', priority: 'Medium' });
      setShowAddSkillWanted(false);
      toast.success('Skill added successfully!');
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error(error.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkillOffered = async (skillId) => {
    try {
      const response = await api.delete(`/users/skills-offered/${skillId}`);
      updateUser({ ...user, skillsOffered: response.data });
      toast.success('Skill removed successfully!');
    } catch (error) {
      console.error('Error removing skill:', error);
      toast.error('Failed to remove skill');
    }
  };

  const handleRemoveSkillWanted = async (skillId) => {
    try {
      const response = await api.delete(`/users/skills-wanted/${skillId}`);
      updateUser({ ...user, skillsWanted: response.data });
      toast.success('Skill removed successfully!');
    } catch (error) {
      console.error('Error removing skill:', error);
      toast.error('Failed to remove skill');
    }
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    if (!newPortfolioItem.title.trim()) return;
    try {
      const skillsArray = newPortfolioItem.skillsUsed
        ? newPortfolioItem.skillsUsed.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const res = await api.post('/users/portfolio', {
        title: newPortfolioItem.title,
        description: newPortfolioItem.description,
        projectUrl: newPortfolioItem.projectUrl,
        skillsUsed: skillsArray
      });
      updateUser({ ...user, portfolio: res.data });
      setNewPortfolioItem({ title: '', description: '', projectUrl: '', skillsUsed: '' });
      setShowAddPortfolio(false);
      toast.success('Portfolio project added! +20 XP');
    } catch (err) {
      toast.error('Failed to add portfolio project');
    }
  };

  const handleRemovePortfolio = async (id) => {
    try {
      const res = await api.delete(`/users/portfolio/${id}`);
      updateUser({ ...user, portfolio: res.data });
      toast.success('Portfolio item removed');
    } catch (err) {
      toast.error('Failed to remove portfolio item');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  // Profile photo upload handler
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const response = await api.post('/users/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(response.data.user);
      toast.success('Profile photo updated!');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 dark:bg-[#0F0D15] text-gray-900 dark:text-[#F5F2FA] pt-20 pb-16 px-4 animate-fade-in transition-colors duration-200">
      {/* Header with greeting and illustration */}
      <div className="w-full max-w-6xl flex flex-col items-start justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-brand-plum dark:text-purple-200 mb-2">Hi, {user.name}</h1>
        <p className="text-lg text-brand-orchid dark:text-purple-300">Welcome back! Ready to swap some skills today?</p>
      </div>
      {/* Stat Cards */}
      <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">

  {/* Skills Offered */}
  <div className="rounded-2xl shadow bg-[#5D3C64] dark:bg-purple-900/60 dark:border dark:border-purple-800/40 text-white p-6 flex flex-col items-center">
    <span className="text-2xl font-bold">{user.skillsOffered?.length || 0}</span>
    <span className="mt-2 text-sm font-medium">Skills Offered</span>
  </div>

  {/* Skills Wanted */}
  <div className="rounded-2xl shadow bg-[#7B466A] dark:bg-purple-900/80 dark:border dark:border-purple-800/40 text-white p-6 flex flex-col items-center">
    <span className="text-2xl font-bold">{user.skillsWanted?.length || 0}</span>
    <span className="mt-2 text-sm font-medium">Skills Wanted</span>
  </div>

  {/* Swaps Completed */}
  <div className="rounded-2xl shadow bg-[#9F6496] dark:bg-[#7B466A] dark:border dark:border-purple-800/40 text-white p-6 flex flex-col items-center">
    <span className="text-2xl font-bold">
      {typeof user.swapsCompleted === 'number' ? user.swapsCompleted : 0}
    </span>
    <span className="mt-2 text-sm font-medium">Swaps Completed</span>
  </div>

  {/* Rating */}
  <div className="rounded-2xl shadow bg-[#0C0420] dark:bg-[#1A1625] dark:border dark:border-purple-800/40 text-white p-6 flex flex-col items-center">
    <span className="text-2xl font-bold">
      {typeof user.ratingAverage === 'number'
        ? user.ratingAverage.toFixed(1)
        : '0.0'}
    </span>
    <span className="mt-2 text-sm font-medium">Rating</span>
  </div>

  {/* Time Credits — ADD THIS HERE */}
  <div className="rounded-2xl shadow bg-[#D391B0] dark:bg-purple-950/70 dark:border dark:border-purple-700/50 text-[#0C0420] dark:text-purple-200 p-6 flex flex-col items-center">
  <span className="text-2xl font-bold">
    {typeof user.timeCredits === 'number' ? user.timeCredits : 0}
  </span>

  <span className="mt-2 text-sm font-medium">
    Time Credits
  </span>

  <button
    onClick={() => navigate('/transactions')}
    className="mt-3 text-xs font-bold underline hover:no-underline"
  >
    View History
  </button>
</div>

</div>
      {/* Main Card with all details */}
      <div className="w-full max-w-6xl bg-white dark:bg-[#1A1625] rounded-3xl shadow-lg border-2 border-[#9F6496] dark:border-[#2D263B] p-12 flex flex-col gap-10 animate-fade-in transition-all duration-500 relative">
        {/* Edit button at top right */}
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="absolute top-6 right-6 bg-[#D391B0] text-[#0C0420] hover:bg-[#BA6E8F] px-6 py-3 rounded-lg flex items-center gap-2 font-bold shadow z-20"
            title="Edit Profile"
            style={{ zIndex: 20 }}
          >
            <Edit className="w-5 h-5" /> Edit
          </button>
        )}
        {/* Profile Info */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-6 relative">
          <div className="flex-shrink-0 flex flex-col items-center gap-2 relative">
            {user.profilePhoto ? (
              <div className="relative">
                <img src={user.profilePhoto} alt={user.name} className="w-32 h-32 rounded-full object-cover border-4 border-[#7B466A] shadow-lg" />
                {editing && (
                  <label className="absolute bottom-2 right-2 bg-[#D391B0] rounded-full p-2 cursor-pointer shadow-lg hover:bg-[#BA6E8F] transition-colors flex items-center justify-center">
                    <Camera className="w-6 h-6 text-[#0C0420]" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={photoUploading} />
                  </label>
                )}
              </div>
            ) : (
              <div className="w-32 h-32 bg-[#7B466A] rounded-full flex items-center justify-center relative">
                <span className="text-white font-bold text-5xl">{user.name.charAt(0).toUpperCase()}</span>
                {editing && (
                  <label className="absolute bottom-2 right-2 bg-[#D391B0] rounded-full p-2 cursor-pointer shadow-lg hover:bg-[#BA6E8F] transition-colors flex items-center justify-center">
                    <Camera className="w-6 h-6 text-[#0C0420]" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={photoUploading} />
                  </label>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 w-full">
            {editing ? (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div>
                  <label className="block text-[#0C0420] font-semibold mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-[#7B466A] focus:ring-2 focus:ring-[#D391B0] outline-none bg-white"
                    value={profileData.name}
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#0C0420] font-semibold mb-1">Location <span className="text-xs text-[#9F6496]">(optional)</span></label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-[#7B466A] focus:ring-2 focus:ring-[#D391B0] outline-none bg-white"
                      value={profileData.location}
                      onChange={e => setProfileData({ ...profileData, location: e.target.value })}
                      placeholder="Enter your city, state, country or use GPS"
                    />
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#D391B0] text-[#0C0420] font-semibold shadow hover:bg-[#BA6E8F] transition-colors"
                      onClick={async () => {
                        if (!navigator.geolocation) {
                          toast.error('Geolocation is not supported by your browser');
                          return;
                        }
                        toast.loading('Getting your location...');
                        navigator.geolocation.getCurrentPosition(async (position) => {
                          try {
                            const { latitude, longitude } = position.coords;
                            // Use a free reverse geocoding API (e.g., OpenStreetMap Nominatim)
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                            const data = await res.json();
                            const city = data.address.city || data.address.town || data.address.village || '';
                            const state = data.address.state || data.address.state_district || '';
                            const country = data.address.country || '';
                            const locationString = [city, state, country].filter(Boolean).join(', ');
                            setProfileData(pd => ({ ...pd, location: locationString }));
                            toast.dismiss();
                            toast.success('Location updated!');
                          } catch (err) {
                            toast.dismiss();
                            toast.error('Could not determine location');
                          }
                        }, (err) => {
                          toast.dismiss();
                          toast.error('Location access denied');
                        });
                      }}
                      title="Use my current location"
                    >
                      <MapPin className="w-4 h-4" /> Use My Location
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[#0C0420] font-semibold mb-1">Bio <span className="text-xs text-[#9F6496]">(optional)</span></label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg border border-[#7B466A] focus:ring-2 focus:ring-[#D391B0] outline-none bg-white"
                    value={profileData.bio}
                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={profileData.isPublic}
                    onChange={e => setProfileData({ ...profileData, isPublic: e.target.checked })}
                  />
                  <label htmlFor="isPublic" className="text-[#0C0420] font-semibold">Public Profile</label>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="bg-[#7B466A] text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-[#5D3C64] transition-colors disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="bg-white text-[#0C0420] font-bold px-6 py-2 rounded-lg border border-[#7B466A] shadow hover:bg-[#D391B0] transition-colors"
                    onClick={() => setEditing(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-[#0C0420] dark:text-[#F5F2FA] mb-1">{user.name}</h2>
                {user.location && (
                  <div className="text-[#5D3C64] dark:text-purple-300 mb-2">{user.location}</div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(user.rating && typeof user.rating.average === 'number' ? user.rating.average : 5.0)}
                  <span className="text-sm text-[#9F6496] dark:text-purple-300">({user.rating && typeof user.rating.count === 'number' ? user.rating.count : 0} reviews)</span>
                </div>
                {user.bio && (
                  <div className="text-md text-[#0C0420] dark:text-[#F5F2FA] mb-2">{user.bio}</div>
                )}
                <div className="flex items-center gap-4 text-xs text-[#9F6496] dark:text-purple-400">
                  <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                  <span>|</span>
                  <span>Public Profile: {user.isPublic ? 'Yes' : 'No'}</span>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Skills Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Skills Offered */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#5D3C64] dark:text-purple-200">Skills Offered</span>
              <button
                className="bg-[#7B466A] text-white px-3 py-1 rounded-lg shadow hover:bg-[#5D3C64] text-xs font-bold"
                onClick={() => setShowAddSkillOffered(v => !v)}
              >
                {showAddSkillOffered ? 'Cancel' : 'Add'}
              </button>
            </div>
            {showAddSkillOffered && (
              <form
                className="space-y-2 mb-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleAddSkillOffered();
                }}
              >
                <input
                  type="text"
                  placeholder="Skill name"
                  className="w-full px-3 py-1 rounded border border-[#7B466A] bg-white focus:ring-2 focus:ring-[#D391B0]"
                  value={newSkillOffered.name}
                  onChange={e => setNewSkillOffered({ ...newSkillOffered, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  className="w-full px-3 py-1 rounded border border-[#7B466A] bg-white focus:ring-2 focus:ring-[#D391B0]"
                  value={newSkillOffered.description}
                  onChange={e => setNewSkillOffered({ ...newSkillOffered, description: e.target.value })}
                />
                <select
                  className="w-full px-3 py-1 rounded border border-[#7B466A] bg-white focus:ring-2 focus:ring-[#D391B0]"
                  value={newSkillOffered.proficiency}
                  onChange={e => setNewSkillOffered({ ...newSkillOffered, proficiency: e.target.value })}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-[#7B466A] text-white font-bold px-4 py-1 rounded-lg shadow hover:bg-[#5D3C64] mt-2"
                >
                  Add Skill
                </button>
              </form>
            )}
            <div className="space-y-2">
              {user.skillsOffered && user.skillsOffered.length > 0 ? (
                user.skillsOffered.map((skill, idx) => (
                  <div key={skill._id || idx} className="flex items-center gap-3 bg-[#D391B0]/30 rounded-lg px-3 py-2 shadow border border-[#7B466A]">
                    <div className="flex-1">
                      <div className="font-semibold text-[#0C0420]">{skill.name}</div>
                      <div className="text-xs text-[#5D3C64]">{skill.description}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#7B466A] text-white border border-[#5D3C64]">{skill.proficiency}</span>
                    <button
                      className="ml-2 text-xs text-[#BA6E8F] hover:text-[#0C0420] font-bold"
                      onClick={() => handleRemoveSkillOffered(skill._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-[#5D3C64]">No skills offered yet.</div>
              )}
            </div>
          </div>
          {/* Skills Wanted */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#5D3C64]">Skills Wanted</span>
              <button
                className="bg-[#9F6496] text-white px-3 py-1 rounded-lg shadow hover:bg-[#7B466A] text-xs font-bold"
                onClick={() => setShowAddSkillWanted(v => !v)}
              >
                {showAddSkillWanted ? 'Cancel' : 'Add'}
              </button>
            </div>
            {showAddSkillWanted && (
              <form
                className="space-y-2 mb-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleAddSkillWanted();
                }}
              >
                <input
                  type="text"
                  placeholder="Skill name"
                  className="w-full px-3 py-1 rounded border border-[#9F6496] bg-white focus:ring-2 focus:ring-[#D391B0]"
                  value={newSkillWanted.name}
                  onChange={e => setNewSkillWanted({ ...newSkillWanted, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  className="w-full px-3 py-1 rounded border border-[#9F6496] bg-white focus:ring-2 focus:ring-[#D391B0]"
                  value={newSkillWanted.description}
                  onChange={e => setNewSkillWanted({ ...newSkillWanted, description: e.target.value })}
                />
                <select
                  className="w-full px-3 py-1 rounded border border-[#9F6496] bg-white focus:ring-2 focus:ring-[#D391B0]"
                  value={newSkillWanted.priority}
                  onChange={e => setNewSkillWanted({ ...newSkillWanted, priority: e.target.value })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-[#9F6496] text-white font-bold px-4 py-1 rounded-lg shadow hover:bg-[#7B466A] mt-2"
                >
                  Add Skill
                </button>
              </form>
            )}
            <div className="space-y-2">
              {user.skillsWanted && user.skillsWanted.length > 0 ? (
                user.skillsWanted.map((skill, idx) => (
                  <div key={skill._id || idx} className="flex items-center gap-3 bg-[#D391B0]/30 rounded-lg px-3 py-2 shadow border border-[#9F6496]">
                    <div className="flex-1">
                      <div className="font-semibold text-[#0C0420]">{skill.name}</div>
                      <div className="text-xs text-[#5D3C64]">{skill.description}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#9F6496] text-white border border-[#5D3C64]">{skill.priority}</span>
                    <button
                      className="ml-2 text-xs text-[#BA6E8F] hover:text-[#0C0420] font-bold"
                      onClick={() => handleRemoveSkillWanted(skill._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-[#5D3C64]">No skills wanted yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Verified Skill Portfolio Section */}
        <div className="bg-white dark:bg-[#1A1625] rounded-2xl p-6 mt-6 border border-[#7B466A]/20 dark:border-[#2D263B] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-[#0C0420] dark:text-[#F5F2FA]">Verified Skill Portfolio</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Showcase tangible projects and verified artifacts demonstrating your skills.</p>
            </div>
            <button
              onClick={() => setShowAddPortfolio(v => !v)}
              className="bg-[#7B466A] text-white px-3 py-1.5 rounded-lg shadow hover:bg-[#5D3C64] text-xs font-bold"
            >
              {showAddPortfolio ? 'Cancel' : '+ Add Project'}
            </button>
          </div>

          {showAddPortfolio && (
            <form onSubmit={handleAddPortfolio} className="bg-gray-50 dark:bg-[#13111C] p-4 rounded-xl mb-4 space-y-3 border border-gray-200 dark:border-[#2D263B]">
              <input
                type="text"
                placeholder="Project Title (e.g. Full-Stack E-Commerce App)"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#1A1625] text-gray-900 dark:text-[#F5F2FA] text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newPortfolioItem.title}
                onChange={e => setNewPortfolioItem({ ...newPortfolioItem, title: e.target.value })}
                required
              />
              <textarea
                rows="2"
                placeholder="Brief project description and outcomes..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#1A1625] text-gray-900 dark:text-[#F5F2FA] text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newPortfolioItem.description}
                onChange={e => setNewPortfolioItem({ ...newPortfolioItem, description: e.target.value })}
              />
              <input
                type="url"
                placeholder="External Demo / GitHub URL (https://...)"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#1A1625] text-gray-900 dark:text-[#F5F2FA] text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newPortfolioItem.projectUrl}
                onChange={e => setNewPortfolioItem({ ...newPortfolioItem, projectUrl: e.target.value })}
              />
              <input
                type="text"
                placeholder="Skills Used (comma-separated, e.g. React, Node.js, Tailwind)"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#1A1625] text-gray-900 dark:text-[#F5F2FA] text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newPortfolioItem.skillsUsed}
                onChange={e => setNewPortfolioItem({ ...newPortfolioItem, skillsUsed: e.target.value })}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#7B466A] text-white font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-[#5D3C64]"
                >
                  Save Project
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(user?.portfolio || []).length === 0 ? (
              <p className="text-xs text-gray-400 italic">No portfolio projects added yet. Click "+ Add Project" to showcase your work.</p>
            ) : (
              user.portfolio.map((item, idx) => (
                <div key={item._id || idx} className="p-4 rounded-xl border border-gray-200 dark:border-[#2D263B] bg-gray-50 dark:bg-[#13111C] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900 dark:text-purple-200 text-sm">{item.title}</h4>
                      <button
                        onClick={() => handleRemovePortfolio(item._id)}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold"
                      >
                        ×
                      </button>
                    </div>
                    {item.description && <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{item.description}</p>}
                    {item.projectUrl && (
                      <a
                        href={item.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold block mb-2"
                      >
                        View Project Link ↗
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
              ))
            )}
          </div>
        </div>

        {/* Availability Section */}
        <div className="bg-[#D391B0]/20 dark:bg-purple-950/30 rounded-2xl p-6 mt-6 border border-[#7B466A]/20 dark:border-[#2D263B]">
          <h3 className="text-xl font-bold text-[#0C0420] dark:text-[#F5F2FA] mb-4">Availability</h3>
          {editing ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-[#0C0420] font-semibold">
                  <input
                    type="checkbox"
                    checked={profileData.availability.weekdays}
                    onChange={e => setProfileData({
                      ...profileData,
                      availability: { ...profileData.availability, weekdays: e.target.checked }
                    })}
                  />
                  Weekdays
                </label>
                <label className="flex items-center gap-2 text-[#0C0420] font-semibold">
                  <input
                    type="checkbox"
                    checked={profileData.availability.weekends}
                    onChange={e => setProfileData({
                      ...profileData,
                      availability: { ...profileData.availability, weekends: e.target.checked }
                    })}
                  />
                  Weekends
                </label>
                <label className="flex items-center gap-2 text-[#0C0420] font-semibold">
                  <input
                    type="checkbox"
                    checked={profileData.availability.evenings}
                    onChange={e => setProfileData({
                      ...profileData,
                      availability: { ...profileData.availability, evenings: e.target.checked }
                    })}
                  />
                  Evenings
                </label>
                <label className="flex items-center gap-2 text-[#0C0420] font-semibold">
                  <input
                    type="checkbox"
                    checked={profileData.availability.mornings}
                    onChange={e => setProfileData({
                      ...profileData,
                      availability: { ...profileData.availability, mornings: e.target.checked }
                    })}
                  />
                  Mornings
                </label>
              </div>
              <div>
                <label className="block text-[#0C0420] font-semibold mb-1">Custom Schedule <span className="text-xs text-[#9F6496]">(optional)</span></label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-[#7B466A] focus:ring-2 focus:ring-[#D391B0] outline-none bg-white"
                  value={profileData.availability.customSchedule}
                  onChange={e => setProfileData({
                    ...profileData,
                    availability: { ...profileData.availability, customSchedule: e.target.value }
                  })}
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="bg-[#7B466A] text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-[#5D3C64] transition-colors disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="bg-white text-[#0C0420] font-bold px-6 py-2 rounded-lg border border-[#7B466A] shadow hover:bg-[#D391B0] transition-colors"
                  onClick={() => setEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex flex-wrap gap-6 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${user.availability?.weekdays ? 'bg-[#D391B0] text-[#0C0420] border-[#7B466A]' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>Weekdays: {user.availability?.weekdays ? 'Yes' : 'No'}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${user.availability?.weekends ? 'bg-[#D391B0] text-[#0C0420] border-[#7B466A]' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>Weekends: {user.availability?.weekends ? 'Yes' : 'No'}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${user.availability?.evenings ? 'bg-[#D391B0] text-[#0C0420] border-[#7B466A]' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>Evenings: {user.availability?.evenings ? 'Yes' : 'No'}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${user.availability?.mornings ? 'bg-[#D391B0] text-[#0C0420] border-[#7B466A]' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>Mornings: {user.availability?.mornings ? 'Yes' : 'No'}</span>
              </div>
              <div className="text-[#0C0420] dark:text-gray-200 mb-2">Custom: {user.availability?.customSchedule || <span className="text-gray-400">None</span>}</div>
            </>
          )}
        </div>

        {/* Appearance & Theme Preference Section */}
        <div className="bg-purple-50/70 dark:bg-[#13111C] rounded-2xl p-6 mt-6 border border-purple-100 dark:border-[#2D263B] transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-brand-plum dark:text-purple-200">Appearance & Theme</h3>
              <p className="text-xs text-brand-orchid dark:text-purple-300 mt-1">
                Customize Skillzy's appearance. Switch between standard Light Mode (White & Purple) and comfortable Dark Mode.
              </p>
            </div>
            <ThemeToggle variant="segmented" />
          </div>
        </div>

        <div className="flex w-full justify-between items-end mt-8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-[#5D3C64] hover:bg-[#4A2F4F] text-white rounded-lg font-semibold shadow-md transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;