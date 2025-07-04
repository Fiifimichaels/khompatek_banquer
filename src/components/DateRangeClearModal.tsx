import React, { useState } from 'react';
import { Calendar, Trash2, X, AlertTriangle } from 'lucide-react';

interface DateRangeClearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: (startDate: Date, endDate: Date) => void;
  title: string;
  description: string;
}

export const DateRangeClearModal: React.FC<DateRangeClearModalProps> = ({
  isOpen,
  onClose,
  onClear,
  title,
  description
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clearAll, setClearAll] = useState(false);

  if (!isOpen) return null;

  const handleClear = () => {
    if (clearAll) {
      // Clear all data
      onClear(new Date(0), new Date());
    } else if (startDate && endDate) {
      // Clear data in date range
      onClear(new Date(startDate), new Date(endDate));
    }
    onClose();
    setStartDate('');
    setEndDate('');
    setClearAll(false);
  };

  const isValidRange = clearAll || (startDate && endDate && new Date(startDate) <= new Date(endDate));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Warning</p>
              <p className="text-sm text-yellow-700">{description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="clearAll"
                checked={clearAll}
                onChange={(e) => setClearAll(e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="clearAll" className="text-sm font-medium text-gray-700">
                Clear all data
              </label>
            </div>

            {!clearAll && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date:
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date:
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={startDate}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleClear}
            disabled={!isValidRange}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear Data</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};