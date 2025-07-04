import React from 'react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DateRangeClearModal } from '../components/DateRangeClearModal';
import { formatDistanceToNow } from '../utils/date';
import { CheckCircle, XCircle, Clock, ArrowDownCircle, ArrowUpCircle, Radio, Code, CreditCard, Percent, Wallet, Trash2, Calendar } from 'lucide-react';

export const History: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showClearModal, setShowClearModal] = useState(false);

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
        {state.transactions.length > 0 && (
          <button
            onClick={() => setShowClearModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>
      
      {state.transactions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No transactions yet</p>
          <p className="text-gray-400 text-sm">Start processing transactions to see them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {state.transactions.map((transaction) => {
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