import React, { useState } from 'react';
import { Smartphone, Sigma as Sim, CheckCircle, X } from 'lucide-react';
import { getNetworkColor, getNetworkDisplayName } from '../utils/networkDetection';

interface NetworkSIMSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (network: string, simSlot: number) => void;
  detectedNetwork: string;
  availableNetworks: string[];
  phoneNumber: string;
  isPorted: boolean;
}

export const NetworkSIMSelector: React.FC<NetworkSIMSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  detectedNetwork,
  availableNetworks,
  phoneNumber,
  isPorted
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState(detectedNetwork);
  const [selectedSIM, setSelectedSIM] = useState(1);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelect(selectedNetwork, selectedSIM);
    onClose();
  };

  const networks = ['MTN', 'VODAFONE', 'AIRTELTIGO'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl p-3 max-w-xs w-full shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Select Network & SIM</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phone Number Info */}
        <div className="bg-gray-50 rounded-lg p-2 mb-3">
          <div className="flex items-center space-x-1 mb-1">
            <Smartphone className="w-3 h-3 text-blue-500" />
            <span className="text-xs font-medium text-gray-700">Phone:</span>
          </div>
          <p className="font-mono text-base font-bold text-gray-900">{phoneNumber}</p>
          {!isPorted && detectedNetwork !== 'UNKNOWN' && (
            <p className={`text-xs mt-1 font-medium ${getNetworkColor(detectedNetwork)}`}>
              Auto: {getNetworkDisplayName(detectedNetwork)}
            </p>
          )}
          {isPorted && (
            <p className="text-xs text-orange-600 mt-1 font-medium">
              ⚠️ Ported - select correct network
            </p>
          )}
        </div>

        {/* Network Selection */}
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-700 mb-1">Network:</h4>
          <div className="space-y-1">
            {networks.map((network) => {
              let circleColor = '';
              if (network === 'MTN') circleColor = 'bg-yellow-400';
              else if (network === 'VODAFONE') circleColor = 'bg-red-500';
              else if (network === 'AIRTELTIGO') circleColor = 'bg-blue-500';

              return (
                <button
                  key={network}
                  onClick={() => setSelectedNetwork(network)}
                  className={`w-full p-2 rounded-lg border transition-all duration-200 flex items-center justify-between text-xs ${
                    selectedNetwork === network
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${circleColor}`} />
                    <span className="font-medium text-gray-900">
                      {getNetworkDisplayName(network)}
                    </span>
                  </div>
                  {selectedNetwork === network && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SIM Selection */}
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-700 mb-1">SIM Slot:</h4>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2].map((simSlot) => (
              <button
                key={simSlot}
                onClick={() => setSelectedSIM(simSlot)}
                className={`p-2 rounded-lg border transition-all duration-200 flex flex-col items-center space-y-1 text-xs ${
                  selectedSIM === simSlot
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Sim className={`w-4 h-4 ${selectedSIM === simSlot ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={`font-medium ${selectedSIM === simSlot ? 'text-blue-900' : 'text-gray-600'}`}>
                  SIM {simSlot}
                </span>
                {selectedSIM === simSlot && (
                  <CheckCircle className="w-3 h-3 text-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended SIM Info */}
        <div className="bg-blue-50 rounded-lg p-2 mb-3">
          <p className="text-[10px] text-blue-800">
            <strong>Tip:</strong> Use the SIM that matches your network. Try SIM 1 first.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-2 rounded-lg text-xs transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-2 rounded-lg text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};