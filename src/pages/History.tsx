import React from 'react';
import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DateRangeClearModal } from '../components/DateRangeClearModal';
import { formatDistanceToNow } from '../utils/date';
import { CheckCircle, XCircle, Clock, ArrowDownCircle, ArrowUpCircle, Radio, Code, CreditCard, Percent, Wallet, Trash2, Calendar, Filter, X } from 'lucide-react';

export const History: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
    transactionType: 'all',
    status: 'all'
  });

  const handleClearHistory = (startDate: Date, endDate: Date) => {
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

  const filteredTransactions = useMemo(() => {
    let filtered = [...state.transactions];

    // Date filtering
    if (dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(t => new Date(t.timestamp) >= startDate);
    }

    if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.timestamp) <= endDate);
    }

    // Transaction type filtering
    if (dateFilter.transactionType !== 'all') {
      filtered = filtered.filter(t => t.type === dateFilter.transactionType);
    }

    // Status filtering
    if (dateFilter.status !== 'all') {
      filtered = filtered.filter(t => t.status === dateFilter.status);
    }

    return filtered;
  }, [state.transactions, dateFilter]);

  const clearFilters = () => {
    setDateFilter({
      startDate: '',
      endDate: '',
      transactionType: 'all',
      status: 'all'
    });
  };

  const hasActiveFilters = dateFilter.startDate || dateFilter.endDate || 
    dateFilter.transactionType !== 'all' || dateFilter.status !== 'all';
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'cash_in': return ArrowDownCircle;
      case 'cash_out': return ArrowUpCircle;
      case 'airtime_transfer': return Radio;
      case 'custom_ussd': return Code;
      case 'pay_merchant': return CreditCard;
      case 'commission': return Percent;
      case 'balance': return Wallet;
      default: return Clock;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const formatTransactionType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="px-4 py-6 pb-24 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        <div className="flex items-center space-x-2">
          {state.transactions.length > 0 && (
            <>
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  hasActiveFilters 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button
                onClick={() => setShowClearModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Date Filter Panel */}
      {showDateFilter && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter Transactions</h3>
            <button
              onClick={() => setShowDateFilter(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date:
                </label>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date:
                </label>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={dateFilter.startDate}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type:
                </label>
                <select
                  value={dateFilter.transactionType}
                  onChange={(e) => setDateFilter({ ...dateFilter, transactionType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="cash_in">Cash In</option>
                  <option value="cash_out">Cash Out</option>
                  <option value="airtime_transfer">Airtime Transfer</option>
                  <option value="pay_merchant">Pay Merchant</option>
                  <option value="commission">Commission</option>
                  <option value="balance">Balance</option>
                  <option value="custom_ussd">Custom USSD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status:
                </label>
                <select
                  value={dateFilter.status}
                  onChange={(e) => setDateFilter({ ...dateFilter, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
          
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Showing {filteredTransactions.length} of {state.transactions.length} transactions
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {dateFilter.startDate && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    From: {new Date(dateFilter.startDate).toLocaleDateString()}
                  </span>
                )}
                {dateFilter.endDate && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    To: {new Date(dateFilter.endDate).toLocaleDateString()}
                  </span>
                )}
                {dateFilter.transactionType !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Type: {formatTransactionType(dateFilter.transactionType)}
                  </span>
                )}
                {dateFilter.status !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Status: {dateFilter.status}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {state.transactions.length === 0 ? 'No transactions yet' : 'No transactions match your filters'}
          </p>
          <p className="text-gray-400 text-sm">
            {state.transactions.length === 0 
              ? 'Start processing transactions to see them here' 
              : 'Try adjusting your filter criteria'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => {
            const TransactionIcon = getTransactionIcon(transaction.type);
            const StatusIcon = getStatusIcon(transaction.status);
            
            return (
              <div key={transaction.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TransactionIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {formatTransactionType(transaction.type)}
                      </h3>
                      <p className="text-sm text-gray-600">{transaction.phoneNumber}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(transaction.timestamp)} ago
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      GHS {transaction.amount.toFixed(2)}
                    </p>
                    <div className={`flex items-center space-x-1 ${getStatusColor(transaction.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium capitalize">{transaction.status}</span>
                    </div>
                    {transaction.commission && (
                      <p className="text-xs text-green-600">
                        Commission: GHS {transaction.commission.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                
                {transaction.reference && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Reference: {transaction.reference}
                    </p>
                    {transaction.isPorted && (
                      <p className="text-xs text-blue-600 mt-1">
                        Ported number
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Clear History Modal */}
      <DateRangeClearModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onClear={handleClearHistory}
        title="Clear Transaction History"
        description="This will permanently delete transaction records from the selected date range. This action cannot be undone."
      />
    </div>
  );
};