import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TransactionButton } from '../components/TransactionButton';
import { AndroidDialerModal } from '../components/AndroidDialerModal';
import { NetworkSIMSelector } from '../components/NetworkSIMSelector';
import { PhoneNumberAutocomplete } from '../components/PhoneNumberAutocomplete';
import { Logo } from '../components/Logo';
import { detectNetworkFromNumber, validateGhanaianNumber, getNetworkColor, getNetworkDisplayName } from '../utils/networkDetection';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Radio, 
  Code, 
  CreditCard, 
  Percent, 
  Wallet,
  CheckCircle,
  RotateCcw,
  Smartphone,
  AlertTriangle,
  List,
  X
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { state, dispatch } = useApp();
  const [amount, setAmount] = useState('100');
  const [phoneNumber, setPhoneNumber] = useState('0244123456');
  const [isPorted, setIsPorted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [detectedNetwork, setDetectedNetwork] = useState('');
  const [showUSSDSelector, setShowUSSDSelector] = useState(false);
  const [selectedUSSDCode, setSelectedUSSDCode] = useState<string>('');
  const [showProcessorModal, setShowProcessorModal] = useState(false);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [currentUSSDCode, setCurrentUSSDCode] = useState('');
  const [currentTransactionType, setCurrentTransactionType] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [selectedSIM, setSelectedSIM] = useState(1);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);

  // Get unique phone numbers from transaction history for autocomplete
  const previousPhoneNumbers = React.useMemo(() => {
    const numbers = state.transactions.map(t => t.phoneNumber);
    return [...new Set(numbers)].sort();
  }, [state.transactions]);

  useEffect(() => {
    setDetectedNetwork(detectNetworkFromNumber(phoneNumber));
  }, [phoneNumber]);

  const getUSSDCodeForTransaction = (type: string, network: string) => {
    const config = state.transactionTypeConfigs.find(c => c.type === type);
    if (config && config.networks[network as keyof typeof config.networks]) {
      return config.networks[network as keyof typeof config.networks];
    }
    return null;
  };

  const handleTransaction = async (type: string) => {
    if (!amount || !phoneNumber) return;

    let ussdCode = '';
    let networkToUse = isPorted ? 'UNIVERSAL' : detectedNetwork;

    if (type === 'custom_ussd') {
      if (!selectedUSSDCode) {
        setShowUSSDSelector(true);
        return;
      }
      const selectedCode = state.ussdCodes.find(code => code.id === selectedUSSDCode);
      if (selectedCode) {
        ussdCode = selectedCode.code
          .replace('{amount}', amount)
          .replace('{phone}', phoneNumber);
        networkToUse = selectedCode.network;
      }
    } else {
      const configuredCode = getUSSDCodeForTransaction(type, networkToUse);
      if (configuredCode) {
        ussdCode = configuredCode
          .replace('{amount}', amount)
          .replace('{phone}', phoneNumber);
      } else {
        alert(`No USSD code configured for ${type} on ${networkToUse} network. Please configure in Settings.`);
        return;
      }
    }

    if (!ussdCode) {
      alert('Unable to generate USSD code. Please check your configuration.');
      return;
    }

    // Create transaction record
    const transaction = {
      id: Date.now().toString(),
      type: type as any,
      amount: parseFloat(amount),
      phoneNumber,
      isPorted,
      status: 'pending' as const,
      timestamp: new Date(),
      reference: `KHM${Date.now()}`,
      commission: parseFloat(amount) * 0.015, // 1.5% commission rate
      network: networkToUse,
      ussdCodeId: type === 'custom_ussd' ? selectedUSSDCode : undefined
    };

    // Store transaction for after network/SIM selection
    setPendingTransaction({
      transaction,
      ussdCode,
      type,
      networkToUse
    });

    // Show network and SIM selector
    setShowNetworkSelector(true);
  };

  const handleNetworkSIMSelection = (network: string, simSlot: number) => {
    if (!pendingTransaction) return;

    setSelectedNetwork(network);
    setSelectedSIM(simSlot);
    setCurrentUSSDCode(pendingTransaction.ussdCode);
    setCurrentTransactionType(pendingTransaction.type);

    // Add transaction to state
    dispatch({ type: 'ADD_TRANSACTION', payload: pendingTransaction.transaction });

    // Show the processor modal
    setShowProcessorModal(true);
    setProcessing(true);
  };

  const handleUSSDComplete = (success: boolean, reference?: string) => {
    if (pendingTransaction) {
      dispatch({ 
        type: 'UPDATE_TRANSACTION', 
        payload: { 
          id: pendingTransaction.transaction.id, 
          updates: { 
            status: success ? 'completed' : 'failed',
            reference: reference || pendingTransaction.transaction.reference
          } 
        } 
      });
    }
    
    setProcessing(false);
    if (pendingTransaction) {
      if (pendingTransaction.type === 'custom_ussd') {
        setSelectedUSSDCode('');
        setShowUSSDSelector(false);
      }
      setPendingTransaction(null);
    }
  };

  const clearForm = () => {
    setAmount('');
    setPhoneNumber('');
    setIsPorted(false);
    setSelectedUSSDCode('');
  };

  const isValidNumber = validateGhanaianNumber(phoneNumber);
  const customUSSDCodes = state.ussdCodes.filter(code => code.isActive);

  return (
    <div className="px-4 py-6 space-y-6 pb-24 max-w-md mx-auto">
      {/* SIM Status Indicator */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span className="font-medium">Dual SIM Active</span>
          </div>
          <div className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded-lg">
            2 SIMs
          </div>
        </div>
        <p className="text-xs text-blue-100 mt-2">
          ✓ Multi-network transactions supported
        </p>
      </div>

      {/* Branding Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
        <Logo size="lg" showText={true} className="justify-center mb-3" />
        <p className="text-sm text-gray-600">
          Process more, earn more with automated mobile money transactions
        </p>
      </div>

      {/* Transaction Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount:
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-3xl font-bold border-0 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
                placeholder="100"
                min="1"
                max="10000"
              />
              <div className="text-sm text-gray-500 mt-1">In GHS</div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number:
            </label>
            <PhoneNumberAutocomplete
              value={phoneNumber}
              onChange={setPhoneNumber}
              previousNumbers={previousPhoneNumbers}
              className={`w-full text-2xl font-bold border-0 bg-transparent focus:outline-none ${
                isValidNumber ? 'text-gray-800' : 'text-red-600'
              } placeholder-gray-400`}
              placeholder="0244123456"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm">
                {detectedNetwork && isValidNumber ? (
                  <span className={`font-medium ${getNetworkColor(detectedNetwork)}`}>
                    ✓ {getNetworkDisplayName(detectedNetwork)} detected
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Network will be detected automatically
                  </span>
                )}
              </div>
              {!isValidNumber && phoneNumber.length > 0 && (
                <div className="flex items-center text-red-600 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Invalid format
                </div>
              )}
            </div>
            <div className="text-sm text-red-600 font-medium mt-1">
              Perform phone number operations
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-3">
          <input
            type="checkbox"
            id="ported"
            checked={isPorted}
            onChange={(e) => setIsPorted(e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="ported" className="text-sm font-medium text-blue-600 cursor-pointer">
            Check this box if number is ported
          </label>
        </div>

        <button
          onClick={clearForm}
          className="mt-4 text-red-600 font-medium hover:text-red-700 transition-colors text-sm"
        >
          Clear Form Fields
        </button>
      </div>

      {/* Transaction Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <TransactionButton
          icon={ArrowDownCircle}
          label="CASH IN"
          onClick={() => handleTransaction('cash_in')}
          className="bg-green-500 hover:bg-green-600"
        />
        <TransactionButton
          icon={ArrowUpCircle}
          label="CASH OUT"
          onClick={() => handleTransaction('cash_out')}
          className="bg-red-500 hover:bg-red-600"
        />
      </div>

      <TransactionButton
        icon={Radio}
        label="AIRTIME TRANSFER"
        onClick={() => handleTransaction('airtime_transfer')}
        className="bg-purple-500 hover:bg-purple-600"
      />

      <TransactionButton
        icon={Code}
        label="CUSTOM USSD TRANSACTION"
        onClick={() => handleTransaction('custom_ussd')}
        className="bg-indigo-500 hover:bg-indigo-600"
      />

      <TransactionButton
        icon={CreditCard}
        label="PAY TO MERCHANT"
        onClick={() => handleTransaction('pay_merchant')}
        className="bg-orange-500 hover:bg-orange-600"
      />

      <div className="grid grid-cols-2 gap-4">
        <TransactionButton
          icon={Percent}
          label="COMMISSION"
          onClick={() => handleTransaction('commission')}
          className="bg-yellow-500 hover:bg-yellow-600"
        />
        <TransactionButton
          icon={Wallet}
          label="BALANCE"
          onClick={() => handleTransaction('balance')}
          className="bg-teal-500 hover:bg-teal-600"
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-blue-600">{state.transactions.length}</p>
            <p className="text-xs text-gray-600">Transactions</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-600">
              {state.transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(0)}
            </p>
            <p className="text-xs text-gray-600">Total Volume</p>
          </div>
          <div>
            <p className="text-xl font-bold text-yellow-600">
              {state.transactions.reduce((sum, t) => sum + (t.commission || 0), 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-600">Commission</p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-6">
        A MMAAG and MOMAG partner.
      </div>

      {/* USSD Code Selector Modal */}
      {showUSSDSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select USSD Code</h3>
              <button
                onClick={() => setShowUSSDSelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {customUSSDCodes.length === 0 ? (
              <div className="text-center py-8">
                <List className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No custom USSD codes available</p>
                <p className="text-sm text-gray-400 mt-2">Add codes in Settings to use this feature</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customUSSDCodes.map((code) => (
                  <button
                    key={code.id}
                    onClick={() => {
                      setSelectedUSSDCode(code.id);
                      setShowUSSDSelector(false);
                      handleTransaction('custom_ussd');
                    }}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{code.name}</div>
                    <div className="text-sm text-gray-500">{code.description}</div>
                    <div className="text-xs text-gray-400 font-mono mt-1">{code.code}</div>
                    <div className={`text-xs mt-1 font-medium ${getNetworkColor(code.network)}`}>
                      {getNetworkDisplayName(code.network)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Network & SIM Selector Modal */}
      <NetworkSIMSelector
        isOpen={showNetworkSelector}
        onClose={() => {
          setShowNetworkSelector(false);
          setPendingTransaction(null);
        }}
        onSelect={handleNetworkSIMSelection}
        detectedNetwork={detectedNetwork}
        availableNetworks={['MTN', 'VODAFONE', 'AIRTELTIGO']}
        phoneNumber={phoneNumber}
        isPorted={isPorted}
      />

      {/* USSD Processor Modal */}
      <AndroidDialerModal
        isOpen={showProcessorModal}
        onClose={() => setShowProcessorModal(false)}
        ussdCode={currentUSSDCode}
        transactionType={currentTransactionType}
        amount={amount}
        phoneNumber={phoneNumber}
        network={getNetworkDisplayName(selectedNetwork)}
        simSlot={selectedSIM}
        onComplete={handleUSSDComplete}
      />

      {/* Processing Indicator */}
      {processing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center max-w-sm mx-4">
            <div className="flex items-center justify-between w-full mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Processing Transaction</h3>
              <button
                onClick={() => {
                  setProcessing(false);
                  setShowProcessorModal(false);
                  setPendingTransaction(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-700 font-medium text-center">Processing transaction...</p>
            <p className="text-sm text-gray-500 mt-2 text-center">Please wait while we process your request</p>
          </div>
        </div>
      )}
    </div>
  );
};