import React, { useState } from 'react';
import { Phone, Copy, CheckCircle, AlertCircle, X, Sigma as Sim } from 'lucide-react';
import { dialUSSD, copyToClipboard } from '../utils/ussdDialer';

interface USSDDialerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ussdCode: string;
  transactionType: string;
  amount: string;
  phoneNumber: string;
  network: string;
  simSlot?: number;
}

export const USSDDialerModal: React.FC<USSDDialerModalProps> = ({
  isOpen,
  onClose,
  ussdCode,
  transactionType,
  amount,
  phoneNumber,
  network,
  simSlot = 1
}) => {
  const [isDialing, setIsDialing] = useState(false);
  const [dialResult, setDialResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Opens the Android dialer with the USSD code (works in browsers as much as possible)
  const handleDial = async () => {
    setIsDialing(true);
    setDialResult(null);

    try {
      // Try native dial first (if available, e.g. in a hybrid app)
      if (typeof dialUSSD === 'function') {
        const result = await dialUSSD(ussdCode, simSlot);
        setDialResult(result);
      }
      // Always open the dialer in browser (web fallback)
      const encodedUSSD = ussdCode.replace(/#/g, '%23');
      window.location.href = `tel:${encodedUSSD}`;
    } catch (error) {
      setDialResult({
        success: false,
        message: 'Failed to dial USSD code'
      });
    } finally {
      setIsDialing(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(ussdCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTransactionType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Dial USSD Code</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction:</span>
              <span className="font-medium text-gray-900">{formatTransactionType(transactionType)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium text-gray-900">GHS {amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium text-gray-900">{phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Network:</span>
              <span className="font-medium text-blue-600">{network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SIM Slot:</span>
              <div className="flex items-center space-x-1">
                <Sim className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-600">SIM {simSlot}</span>
              </div>
            </div>
          </div>
        </div>

        {/* USSD Code Display */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">USSD Code:</span>
            <button
              onClick={handleCopy}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="font-mono text-lg font-bold text-blue-900 break-all">
            {ussdCode}
          </div>
          {copied && (
            <div className="text-xs text-green-600 mt-1">Copied to clipboard!</div>
          )}
        </div>

        {/* Dial Result */}
        {dialResult && (
          <div className={`rounded-lg p-4 mb-4 flex items-start space-x-3 ${
            dialResult.success ? 'bg-green-50' : 'bg-red-50'
          }`}>
            {dialResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-medium ${
                dialResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {dialResult.success ? 'Success!' : 'Error'}
              </p>
              <p className={`text-sm ${
                dialResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {dialResult.message}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleDial}
            disabled={isDialing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Phone className="w-5 h-5" />
            <span>{isDialing ? 'Dialing...' : 'Dial Now'}</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Instructions:</strong> Click "Dial Now" to automatically open your phone's dialer with the USSD code 
            using SIM {simSlot}. If your device doesn't support automatic SIM selection, copy the code and dial manually 
            using the correct SIM.
          </p>
        </div>
      </div>
    </div>
  );
};