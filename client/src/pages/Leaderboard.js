import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Star,
  CheckCircle,
  Shield,
  Medal,
  Compass,
  Repeat,
  Sparkles
} from 'lucide-react';

const BADGE_ICONS = {
  sparkles: Sparkles,
  compass: Compass,
  repeat: Repeat,
  award: Award,
  shield: Shield,
  star: Star,
  'check-circle': CheckCircle
};

const Leaderboard = () => {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const [statsRes, leadRes, badgeRes] = await Promise.all([
        api.get('/gamification/me'),
        api.get('/gamification/leaderboard'),
        api.get('/gamification/badges')
      ]);

      setStats(statsRes.data);
      setLeaderboard(leadRes.data || []);
      setBadges(badgeRes.data || []);
    } catch (err) {
      toast.error('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0D15] text-gray-900 dark:text-[#F5F2FA] pt-20 pb-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* User Progress Header Card */}
        {stats && (
          <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100 dark:border-[#2D263B]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              {/* Level & XP */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 text-[#5D3C64] dark:text-[#A78BFA] text-xs uppercase font-extrabold tracking-wider mb-2">
                  <Zap className="w-4 h-4 text-brand-orchid dark:text-purple-300" />
                  <span>Skillzy Reputation Level</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-plum dark:text-[#F5F2FA] tracking-tight mb-3">
                  Level {stats.level} Swapper
                </h1>

                {/* Progress bar */}
                <div className="w-full bg-purple-100 dark:bg-[#262035] h-3 rounded-full overflow-hidden p-0.5 mb-2">
                  <div
                    className="bg-[#5D3C64] dark:bg-[#A78BFA] h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${stats.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-brand-orchid dark:text-purple-300 font-medium">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{stats.xp} Total XP</span>
                  <span>{stats.progressPercent}% to Level {stats.level + 1}</span>
                </div>
              </div>

              {/* Streak Counter */}
              <div className="bg-purple-50/50 dark:bg-[#262035]/50 rounded-2xl p-4 border border-purple-100 dark:border-[#2D263B] text-center">
                <div className="flex items-center justify-center space-x-1 text-amber-500 mb-1">
                  <Flame className="w-6 h-6 fill-amber-400" />
                  <span className="text-2xl font-black text-gray-900 dark:text-[#F5F2FA]">{stats.streak} Days</span>
                </div>
                <div className="text-xs text-brand-orchid dark:text-gray-300 font-semibold">Active Daily Learning Streak</div>
              </div>

              {/* Swaps Completed */}
              <div className="bg-purple-50/50 dark:bg-[#262035]/50 rounded-2xl p-4 border border-purple-100 dark:border-[#2D263B] text-center">
                <div className="flex items-center justify-center space-x-1 text-[#5D3C64] dark:text-[#A78BFA] mb-1">
                  <Medal className="w-6 h-6 text-brand-orchid dark:text-purple-300" />
                  <span className="text-2xl font-black text-gray-900 dark:text-[#F5F2FA]">{stats.swapsCompleted}</span>
                </div>
                <div className="text-xs text-brand-orchid dark:text-gray-300 font-semibold">Verified Exchanges Completed</div>
              </div>
            </div>
          </div>
        )}

        {/* Grid: Badges Showcase & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Badges Showcase */}
          <div className="bg-white dark:bg-[#1A1625] rounded-3xl border border-purple-100 dark:border-[#2D263B] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brand-plum dark:text-[#F5F2FA] flex items-center space-x-2">
                <Award className="w-5 h-5 text-[#5D3C64] dark:text-[#A78BFA]" />
                <span>Achievement Badges</span>
              </h3>
              <span className="text-xs bg-purple-50 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] px-2.5 py-1 rounded-full font-bold border border-purple-100 dark:border-[#2D263B]">
                {badges.filter(b => b.unlocked).length} / {badges.length}
              </span>
            </div>

            <div className="space-y-3">
              {badges.map((b) => {
                const IconComponent = BADGE_ICONS[b.icon] || Award;
                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-2xl border flex items-start space-x-3 transition ${
                      b.unlocked
                        ? 'bg-purple-50/40 dark:bg-[#262035]/40 border-purple-200 dark:border-[#2D263B]'
                        : 'bg-gray-50/40 dark:bg-[#151221]/40 border-gray-100 dark:border-[#2D263B] opacity-60'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        b.unlocked
                          ? 'bg-[#5D3C64] text-white shadow-sm'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-[#F5F2FA]">{b.name}</h4>
                        {b.unlocked && (
                          <span className="text-[10px] bg-purple-100 dark:bg-purple-900/50 text-[#5D3C64] dark:text-[#A78BFA] px-1.5 py-0.5 rounded font-bold">
                            UNLOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{b.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Platform Leaderboard */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1A1625] rounded-3xl border border-purple-100 dark:border-[#2D263B] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-bold text-brand-plum dark:text-[#F5F2FA]">Community Leaderboard</h3>
              </div>
              <span className="text-xs text-brand-orchid dark:text-gray-300 font-medium">Ranked by Lifetime XP</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-purple-50 dark:border-[#2D263B] text-xs uppercase font-extrabold text-gray-400 dark:text-gray-400">
                    <th className="pb-3 px-3">Rank</th>
                    <th className="pb-3 px-3">Member</th>
                    <th className="pb-3 px-3 text-center">Level</th>
                    <th className="pb-3 px-3 text-center">Streak</th>
                    <th className="pb-3 px-3 text-center">Swaps</th>
                    <th className="pb-3 px-3 text-right">XP Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-[#2D263B]">
                  {leaderboard.map((item) => (
                    <tr key={item._id} className="hover:bg-purple-50/30 dark:hover:bg-[#262035]/30 transition">
                      <td className="py-3.5 px-3">
                        {item.rank === 1 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">1</span>
                        ) : item.rank === 2 ? (
                          <span className="w-6 h-6 rounded-full bg-gray-300 text-gray-800 font-black text-xs flex items-center justify-center">2</span>
                        ) : item.rank === 3 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center">3</span>
                        ) : (
                          <span className="text-xs font-bold text-gray-400 pl-1.5">{item.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={item.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}`}
                            alt={item.name}
                            className="w-8 h-8 rounded-full object-cover border border-purple-100 dark:border-[#2D263B]"
                          />
                          <div>
                            <div className="font-bold text-gray-900 dark:text-[#F5F2FA] text-xs flex items-center space-x-1">
                              <span>{item.name}</span>
                              {item.membership === 'premium' && (
                                <span className="bg-purple-50 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] border border-purple-200 dark:border-[#2D263B] text-[9px] font-bold px-1 rounded">
                                  PRO
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="bg-purple-100 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] text-xs font-bold px-2 py-0.5 rounded-full">
                          Lv {item.level}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs flex items-center justify-center">
                          <Flame className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                          {item.streak}d
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300">
                        {item.swapsCompleted}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-gray-900 dark:text-[#F5F2FA] text-xs">
                        {item.xp} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
