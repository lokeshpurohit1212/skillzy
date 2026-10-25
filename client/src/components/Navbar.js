import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon,
  CheckCircle
} from 'lucide-react';
import api from '../config/api';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifications(false);
  }, [location.pathname]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // Silently catch to avoid spam
    }
  }, [isAuthenticated]);

  // Fetch full notifications list when dropdown is opened
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setNotifLoading(true);
      const res = await api.get('/notifications?limit=10');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 25000); // 25s poll
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  const toggleNotifications = () => {
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const handleMarkAsRead = async (notifId, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === notifId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';
  const navBg = isHome
    ? (scrolled ? 'bg-brand-night/95 backdrop-blur-md shadow-md' : 'bg-transparent')
    : 'bg-white/95 dark:bg-[#1A1625]/95 backdrop-blur-md shadow-md border-b border-brand-pink/30 dark:border-purple-900/40';
  const navText = isHome ? 'text-white' : 'text-brand-plum dark:text-purple-200';
  const navAccent = isHome ? 'hover:text-brand-pink' : 'hover:text-brand-orchid dark:hover:text-purple-300';
  const navLogo = isHome ? 'text-white' : 'text-brand-plum dark:text-purple-200';

  const getNavLinkClass = (path) => {
    const isActive = location.pathname === path;
    if (isActive) {
      return isHome 
        ? 'text-brand-pink font-bold' 
        : 'text-brand-plum dark:text-purple-300 font-bold border-b-2 border-brand-plum dark:border-purple-400 pb-0.5';
    }
    return navAccent;
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <span className={`text-2xl font-black tracking-tight ${navLogo} transition-transform group-hover:scale-105`}>
              Skillzy
            </span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className={`flex items-center space-x-6 text-sm font-semibold ${navText}`}>
            <Link 
              to="/" 
              className={`${getNavLinkClass('/')} transition-colors whitespace-nowrap`}
            >
              Home
            </Link>
            <Link 
              to="/browse" 
              className={`${getNavLinkClass('/browse')} transition-colors whitespace-nowrap`}
            >
              Browse
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/matchmaker" 
                  className={`${getNavLinkClass('/matchmaker')} transition-colors whitespace-nowrap`}
                >
                  AI Matches
                </Link>
                <Link 
                  to="/sessions" 
                  className={`${getNavLinkClass('/sessions')} transition-colors whitespace-nowrap`}
                >
                  Sessions
                </Link>
                <Link 
                  to="/copilot" 
                  className={`${getNavLinkClass('/copilot')} transition-colors whitespace-nowrap`}
                >
                  AI Copilot
                </Link>
                <Link 
                  to="/swaps" 
                  className={`${getNavLinkClass('/swaps')} transition-colors whitespace-nowrap`}
                >
                  Swaps
                </Link>
              </>
            )}
            <Link 
              to="/communities" 
              className={`${getNavLinkClass('/communities')} transition-colors whitespace-nowrap`}
            >
              Clubs
            </Link>
            <Link 
              to="/leaderboard" 
              className={`${getNavLinkClass('/leaderboard')} transition-colors whitespace-nowrap`}
            >
              Leaderboard
            </Link>
            <Link 
              to="/premium" 
              className={`font-bold transition-all whitespace-nowrap text-xs px-2.5 py-1 rounded-full border shadow-xs ${
                location.pathname === '/premium'
                  ? 'bg-brand-plum text-white border-brand-plum dark:bg-purple-600 dark:border-purple-500'
                  : 'text-brand-plum dark:text-purple-200 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border-purple-200 dark:border-purple-800/40'
              }`}
            >
              ★ Pro
            </Link>
          </div>
        </div>

        {/* Right Section: Theme Toggle, Notifications & Profile/Login */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle isHeaderTransparent={isHome && !scrolled} />
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotifications}
                  aria-label="Notifications"
                  className={`p-2 rounded-full relative transition-colors ${
                    isHome 
                      ? 'text-white hover:bg-white/10' 
                      : 'text-brand-plum hover:bg-brand-pink/10'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1A1625] rounded-2xl shadow-2xl border border-brand-pink/30 dark:border-purple-900/40 py-3 z-50 text-brand-night dark:text-purple-100 animate-slide-up">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100 dark:border-[#2D263B]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-plum dark:text-purple-200 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-brand-pink/20 dark:bg-purple-900/40 text-brand-plum dark:text-purple-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-brand-orchid dark:text-purple-300 hover:underline font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-[#2D263B]">
                      {notifLoading ? (
                        <div className="p-4 text-center text-xs text-gray-400">Loading alerts...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-400">No notifications yet.</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n._id}
                            onClick={() => {
                              if (!n.read) handleMarkAsRead(n._id);
                              if (n.link) navigate(n.link);
                              setShowNotifications(false);
                            }}
                            className={`p-3 text-left hover:bg-brand-pink/5 dark:hover:bg-purple-900/20 cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                              !n.read ? 'bg-brand-pink/10 dark:bg-purple-950/40 font-medium' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-brand-plum dark:text-purple-200 truncate">{n.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {!n.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(n._id, e)}
                                title="Mark as read"
                                className="text-brand-orchid dark:text-purple-300 hover:text-brand-plum p-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar / Link */}
              <Link to="/profile" className="flex items-center gap-2 group">
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name || 'Profile'}
                    className="w-9 h-9 rounded-full object-cover border-2 border-brand-orchid shadow transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-orchid flex items-center justify-center text-white font-bold text-sm shadow transition-transform group-hover:scale-105">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                )}
              </Link>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className={`px-4 py-1.5 rounded-lg border font-semibold text-sm transition-colors ${
                  isHome 
                    ? 'border-brand-orchid text-white hover:bg-brand-orchid hover:text-white' 
                    : 'border-brand-plum dark:border-purple-400 text-brand-plum dark:text-purple-200 hover:bg-brand-plum dark:hover:bg-purple-900/40 hover:text-white'
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-lg bg-brand-pink text-brand-night font-bold text-sm shadow hover:bg-white transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isHome ? 'text-white hover:bg-white/10' : 'text-brand-plum dark:text-purple-200 hover:bg-gray-100 dark:hover:bg-purple-950/40'
            }`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#1A1625] border-b border-brand-pink/30 dark:border-purple-900/40 px-6 py-4 shadow-xl text-brand-plum dark:text-purple-200 animate-slide-up">
          {/* Theme Switch Row in Mobile Drawer */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#2D263B] mb-3">
            <span className="text-sm font-bold text-brand-plum dark:text-purple-200">Theme Preference</span>
            <ThemeToggle variant="segmented" />
          </div>

          <div className="flex flex-col space-y-3 font-semibold text-base">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-brand-orchid dark:hover:text-purple-300 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-brand-orchid dark:hover:text-purple-300 transition-colors"
            >
              Browse Skills
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/matchmaker"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-brand-orchid dark:hover:text-purple-300 transition-colors font-semibold text-brand-plum dark:text-purple-200"
                >
                  AI Matchmaker
                </Link>
                <Link
                  to="/sessions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-brand-orchid dark:hover:text-purple-300 transition-colors"
                >
                  Live Sessions
                </Link>
                <Link
                  to="/copilot"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-brand-orchid dark:hover:text-purple-300 transition-colors"
                >
                  AI Learning Copilot
                </Link>
                <Link
                  to="/swaps"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-brand-orchid dark:hover:text-purple-300 transition-colors"
                >
                  My Swap Requests
                </Link>
                <Link
                  to="/communities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-brand-orchid dark:hover:text-purple-300 transition-colors"
                >
                  Skill Clubs & Workshops
                </Link>
                <Link
                  to="/leaderboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-brand-orchid dark:hover:text-purple-300 transition-colors"
                >
                  Gamification Leaderboard
                </Link>
                <Link
                  to="/premium"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-brand-orchid dark:hover:text-purple-300 transition-colors text-brand-plum dark:text-purple-200 font-bold"
                >
                  ★ Upgrade to Pro
                </Link>
                <Link
                  to="/transactions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-brand-orchid dark:hover:text-purple-300 transition-colors"
                >
                  Transaction History & Credits
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-brand-orchid dark:hover:text-purple-300 transition-colors"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 py-2 text-red-500 hover:text-red-400 text-left font-bold"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-lg border border-brand-plum dark:border-purple-400 text-brand-plum dark:text-purple-200 font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-lg bg-brand-pink text-brand-night font-bold shadow"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;