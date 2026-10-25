import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Sparkles,
  CheckCircle,
  Zap,
  Receipt
} from 'lucide-react';

const Premium = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [userRes, historyRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/payments/history')
      ]);

      setCurrentUser(userRes.data);
      setHistory(historyRes.data || []);
    } catch (err) {
      toast.error('Failed to load payment options');
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

  const isPro = currentUser?.membership === 'premium';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0D15] text-gray-900 dark:text-[#F5F2FA] pt-20 pb-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Top Banner */}
        <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100 dark:border-[#2D263B] text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-purple-50 dark:bg-[#262035] border border-purple-100 dark:border-[#2D263B] px-3 py-1 rounded-full text-[#5D3C64] dark:text-[#A78BFA] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-orchid dark:text-purple-300" />
              <span>Verified Pro & Membership</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-plum dark:text-[#F5F2FA] tracking-tight mb-3">
              Supercharge Your Skill Exchange Journey
            </h1>
            <p className="text-brand-orchid dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              Skill exchanges always remain 100% free with time credits. Upgrade to Skillzy Pro for unlimited AI learning roadmaps, verified Pro badges, and priority matching.
            </p>
          </div>
        </div>

        {/* Pricing Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-8 border border-purple-100 dark:border-[#2D263B] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-brand-plum dark:text-[#F5F2FA]">Skillzy Community</h3>
                <span className="text-xs bg-purple-50 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA] px-3 py-1 rounded-full font-bold border border-purple-100 dark:border-[#2D263B]">
                  Default
                </span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black text-brand-plum dark:text-[#F5F2FA]">₹0</span>
                <span className="text-brand-orchid dark:text-purple-300 text-sm ml-2">Forever Free</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                Our core peer-to-peer barter platform. Learn any skill by teaching in return.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited barter skill swaps using time credits',
                  'Peer-to-peer exchange messaging',
                  'Basic matchmaking compatibility score',
                  'Standard virtual classroom video calls',
                  'Community clubs and discussion forums',
                  'Public profile & review ratings'
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-center space-x-2.5 text-xs text-gray-700 dark:text-gray-200">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#151221] rounded-2xl text-center text-xs font-semibold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-[#2D263B]">
              Included with every account
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white dark:bg-[#1A1625] text-gray-900 dark:text-[#F5F2FA] rounded-3xl p-8 shadow-md flex flex-col justify-between relative border-2 border-[#5D3C64] dark:border-[#A78BFA]">
            <div className="absolute top-4 right-4 bg-[#5D3C64] dark:bg-[#A78BFA] text-white dark:text-gray-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
              Recommended
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-[#5D3C64] dark:text-[#A78BFA]" />
                <h3 className="text-xl font-bold text-brand-plum dark:text-[#F5F2FA]">Skillzy Pro</h3>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-black text-brand-plum dark:text-[#F5F2FA]">₹499</span>
                <span className="text-brand-orchid dark:text-purple-300 text-sm ml-2">/ month</span>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                For ambitious learners and power mentors who want prioritized growth and AI copilot capabilities.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited AI Learning Copilot roadmaps & milestone plans',
                  'Verified PRO badge on public search and browse cards',
                  'Priority ranking boost in the AI Skill Matchmaker',
                  'Automated live session agenda preparation generator',
                  'Extended HD classroom calls with collaborative notes',
                  'Zero platform service fees on paid workshops & tutoring',
                  'Direct support & feature preview access'
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-center space-x-2.5 text-xs text-gray-700 dark:text-gray-200">
                    <CheckCircle className="w-4 h-4 text-[#5D3C64] dark:text-[#A78BFA] flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              {isPro ? (
                <div className="w-full py-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-2xl font-bold text-center text-sm">
                  ✓ Pro Membership Active
                </div>
              ) : (
                <Link
                  to="/checkout"
                  className="w-full py-3.5 bg-[#5D3C64] hover:bg-[#4A2F4F] text-white rounded-2xl font-bold text-sm shadow-md transition duration-200 block text-center"
                >
                  Upgrade to Skillzy Pro (₹499)
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Payment History & Receipts */}
        <div className="bg-white dark:bg-[#1A1625] rounded-3xl border border-purple-100 dark:border-[#2D263B] p-6 shadow-sm">
          <h3 className="text-lg font-bold text-brand-plum dark:text-[#F5F2FA] mb-4 flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-[#5D3C64] dark:text-[#A78BFA]" />
            <span>Payment History & Receipts</span>
          </h3>

          {history.length === 0 ? (
            <p className="text-xs text-brand-orchid dark:text-gray-400 italic">No past transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-purple-50 dark:border-[#2D263B] uppercase text-gray-400 dark:text-gray-400 font-extrabold pb-2">
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3">Order ID</th>
                    <th className="pb-3 px-3">Purpose</th>
                    <th className="pb-3 px-3">Amount</th>
                    <th className="pb-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-[#2D263B]">
                  {history.map((pay) => (
                    <tr key={pay._id} className="hover:bg-purple-50/20 dark:hover:bg-[#262035]/30 transition">
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                        {new Date(pay.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-gray-700 dark:text-gray-300">
                        {pay.orderId}
                      </td>
                      <td className="py-3 px-3 capitalize text-gray-900 dark:text-[#F5F2FA] font-medium">
                        {pay.purpose.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-3 font-bold text-brand-plum dark:text-[#A78BFA]">
                        ₹{pay.amount} {pay.currency}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          pay.status === 'captured'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                            : 'bg-purple-50 dark:bg-[#262035] text-[#5D3C64] dark:text-[#A78BFA]'
                        }`}>
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Premium;
