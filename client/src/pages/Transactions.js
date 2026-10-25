import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  Coins
} from 'lucide-react';
import api from '../config/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const response = await api.get('/transactions/my-transactions');

      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);

      toast.error(
        error.response?.data?.message ||
        'Failed to load transaction history'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalEarned = transactions
    .filter(transaction => transaction.type === 'earned')
    .reduce((total, transaction) => total + transaction.credits, 0);

  const totalSpent = transactions
    .filter(transaction => transaction.type === 'spent')
    .reduce((total, transaction) => total + transaction.credits, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orchid border-t-transparent mx-auto mb-4"></div>

          <p className="text-brand-plum font-semibold">
            Loading transaction history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4 animate-fade-in">

      <div className="w-full max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <History className="w-9 h-9 text-brand-plum" />

            <h1 className="text-4xl font-extrabold text-brand-plum">
              Transaction History
            </h1>
          </div>

          <p className="text-lg text-brand-orchid">
            Track all your earned and spent time credits
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          {/* Total Transactions */}
          <div className="bg-white rounded-2xl shadow-card-lg border border-brand-plum/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-orchid">
                  Total Transactions
                </p>

                <p className="text-3xl font-extrabold text-brand-plum mt-2">
                  {transactions.length}
                </p>
              </div>

              <History className="w-10 h-10 text-brand-orchid" />
            </div>
          </div>

          {/* Total Earned */}
          <div className="bg-white rounded-2xl shadow-card-lg border border-green-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700">
                  Credits Earned
                </p>

                <p className="text-3xl font-extrabold text-green-600 mt-2">
                  +{totalEarned}
                </p>
              </div>

              <ArrowDownCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white rounded-2xl shadow-card-lg border border-red-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-600">
                  Credits Spent
                </p>

                <p className="text-3xl font-extrabold text-red-500 mt-2">
                  -{totalSpent}
                </p>
              </div>

              <ArrowUpCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>

        </div>

        {/* Transaction List */}
        {transactions.length === 0 ? (

          <div className="bg-white rounded-3xl shadow-card-lg border border-brand-plum/30 p-12 text-center">

            <Coins className="w-16 h-16 mx-auto text-brand-orchid mb-5" />

            <h2 className="text-2xl font-bold text-brand-plum mb-2">
              No transactions yet
            </h2>

            <p className="text-brand-orchid">
              Complete a skill exchange to start building your transaction history.
            </p>

          </div>

        ) : (

          <div className="bg-white rounded-3xl shadow-card-lg border border-brand-plum/30 overflow-hidden">

            <div className="p-6 border-b border-brand-orchid/30">
              <h2 className="text-xl font-bold text-brand-plum">
                Recent Transactions
              </h2>
            </div>

            <div className="divide-y divide-gray-100">

              {transactions.map((transaction) => {

                const earned = transaction.type === 'earned';

                return (
                  <div
                    key={transaction._id}
                    className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >

                    {/* Left */}
                    <div className="flex items-center gap-5">

                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          earned
                            ? 'bg-green-100'
                            : 'bg-red-100'
                        }`}
                      >
                        {earned ? (
                          <ArrowDownCircle className="w-7 h-7 text-green-600" />
                        ) : (
                          <ArrowUpCircle className="w-7 h-7 text-red-500" />
                        )}
                      </div>

                      <div>

                        <h3 className="font-bold text-brand-plum text-lg">
                          {earned
                            ? 'Credits Earned'
                            : 'Credits Spent'}
                        </h3>

                        <p className="text-gray-600 mt-1">
                          {transaction.reason}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                          <Clock className="w-4 h-4" />

                          {new Date(
                            transaction.createdAt
                          ).toLocaleString()}
                        </div>

                      </div>

                    </div>

                    {/* Right */}
                    <div className="text-right">

                      <p
                        className={`text-2xl font-extrabold ${
                          earned
                            ? 'text-green-600'
                            : 'text-red-500'
                        }`}
                      >
                        {earned ? '+' : '-'}
                        {transaction.credits}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Balance: {transaction.balanceAfter}
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Transactions;