import React, { useMemo } from 'react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DateRangeClearModal } from '../components/DateRangeClearModal';
import { TrendingUp, DollarSign, Users, Target, Calendar, Clock, Smartphone, Trash2 } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showClearModal, setShowClearModal] = useState(false);

  const handleClearAnalytics = (startDate: Date, endDate: Date) => {
    // Filter out transactions within the date range
    const filteredTransactions = state.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.timestamp);
      return transactionDate < startDate || transactionDate > endDate;
    });

    // Update state with filtered transactions
    dispatch({
      type: 'LOAD_STATE',
      payload: {
        ...state,
        transactions: filteredTransactions
      }
    });
  };

  const analytics = useMemo(() => {
    const transactions = state.transactions;
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalCommission = transactions.reduce((sum, t) => sum + (t.commission || 0), 0);
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const successRate = totalTransactions > 0 ? (completedTransactions.length / totalTransactions) * 100 : 0;

    // Today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.timestamp);
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate.getTime() === today.getTime();
    });

    const todayAmount = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const todayCommission = todayTransactions.reduce((sum, t) => sum + (t.commission || 0), 0);

    // This week's transactions
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekTransactions = transactions.filter(t => new Date(t.timestamp) >= weekStart);
    const weekAmount = weekTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Average transaction amount
    const avgTransactionAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

    // Transaction types breakdown
    const transactionsByType = transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Network distribution (based on phone numbers)
    const networkDistribution = transactions.reduce((acc, t) => {
      const prefix = t.phoneNumber.substring(0, 4);
      let network = 'Unknown';
      
      if (['0244', '0254', '0204', '0294'].includes(prefix)) network = 'MTN';
      else if (['0202', '0232', '0292'].includes(prefix)) network = 'Vodafone';
      else if (['0207', '0257', '0277', '0297'].includes(prefix)) network = 'AirtelTigo';
      
      acc[network] = (acc[network] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Peak hours analysis
    const hourlyDistribution = transactions.reduce((acc, t) => {
      const hour = new Date(t.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakHour = Object.entries(hourlyDistribution).reduce((peak, [hour, count]) => {
      return count > peak.count ? { hour: parseInt(hour), count } : peak;
    }, { hour: 0, count: 0 });

    return {
      totalTransactions,
      totalAmount,
      totalCommission,
      successRate,
      todayTransactions: todayTransactions.length,
      todayAmount,
      todayCommission,
      weekTransactions: weekTransactions.length,
      weekAmount,
      avgTransactionAmount,
      transactionsByType,
      networkDistribution,
      peakHour
    };
  }, [state.transactions]);

  const formatTransactionType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }: {
    icon: React.ComponentType<any>;
    title: string;
    value: string;
    subtitle: string;
    color?: string;
    trend?: string;
  }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-1 font-medium">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100 ml-4`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-6 pb-24 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        {state.transactions.length > 0 && (
          <button
            onClick={() => setShowClearModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>
      
      {/* Today's Performance */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Today's Performance
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <StatCard
            icon={TrendingUp}
            title="Today's Transactions"
            value={analytics.todayTransactions.toString()}
            subtitle={`GHS ${analytics.todayAmount.toFixed(2)} processed`}
            color="blue"
            trend={analytics.todayTransactions > 0 ? `+${analytics.todayCommission.toFixed(2)} commission` : undefined}
          />
        </div>
      </div>

      {/* Overall Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Statistics</h2>
        <div className="grid grid-cols-1 gap-4">
          <StatCard
            icon={DollarSign}
            title="Total Volume"
            value={`GHS ${analytics.totalAmount.toFixed(2)}`}
            subtitle={`${analytics.totalTransactions} transactions`}
            color="green"
            trend={`Avg: GHS ${analytics.avgTransactionAmount.toFixed(2)}`}
          />
          <StatCard
            icon={Users}
            title="Commission Earned"
            value={`GHS ${analytics.totalCommission.toFixed(2)}`}
            subtitle="Total earnings"
            color="yellow"
            trend={analytics.totalTransactions > 0 ? `${(analytics.totalCommission/analytics.totalAmount*100).toFixed(2)}% rate` : undefined}
          />
          <StatCard
            icon={Target}
            title="Success Rate"
            value={`${analytics.successRate.toFixed(1)}%`}
            subtitle="Completed transactions"
            color="purple"
            trend={analytics.successRate === 100 ? "Perfect score!" : undefined}
          />
        </div>
      </div>

      {/* Transaction Types */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Types</h2>
        {Object.keys(analytics.transactionsByType).length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transaction data available</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(analytics.transactionsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">
                  {formatTransactionType(type)}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(count / analytics.totalTransactions) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 min-w-[2rem] text-right font-medium">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network Distribution */}
      {Object.keys(analytics.networkDistribution).length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
            Network Distribution
          </h2>
          <div className="space-y-4">
            {Object.entries(analytics.networkDistribution).map(([network, count]) => (
              <div key={network} className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">{network}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(count / analytics.totalTransactions) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 min-w-[2rem] text-right font-medium">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Peak Activity */}
      {analytics.peakHour.count > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Peak Activity
          </h2>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {analytics.peakHour.hour}:00
            </p>
            <p className="text-sm text-gray-600">
              Busiest hour with {analytics.peakHour.count} transactions
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl shadow-md p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Account Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">GHS {state.agent.balance.toFixed(2)}</p>
            <p className="text-sm text-blue-100">Current Balance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">GHS {state.agent.commission.toFixed(2)}</p>
            <p className="text-sm text-blue-100">Total Commission</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-400">
          <div className="text-center">
            <p className="text-lg font-semibold">{state.agent.totalTransactions}</p>
            <p className="text-sm text-blue-100">Lifetime Transactions</p>
          </div>
        </div>
      </div>

      {/* Clear Analytics Modal */}
      <DateRangeClearModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onClear={handleClearAnalytics}
        title="Clear Analytics Data"
        description="This will permanently delete transaction data used for analytics from the selected date range. This action cannot be undone."
      />
    </div>
  );
};