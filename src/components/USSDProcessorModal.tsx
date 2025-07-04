import React, { useState, useEffect } from 'react';
import { Phone, Copy, CheckCircle, AlertCircle, X, Sigma as Sim, ArrowRight, RotateCcw } from 'lucide-react';
import { copyToClipboard } from '../utils/ussdDialer';

interface USSDStep {
  id: string;
  prompt: string;
  response?: string;
  isConfirmation?: boolean;
  requiresRepeat?: boolean;
  expectedInput?: 'amount' | 'phone' | 'pin' | 'confirmation';
}

interface USSDProcessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  ussdCode: string;
  transactionType: string;
  amount: string;
  phoneNumber: string;
  network: string;
  simSlot?: number;
  onComplete: (success: boolean, reference?: string) => void;
}

export const USSDProcessorModal: React.FC<USSDProcessorModalProps> = ({
  isOpen,
  onClose,
  ussdCode,
  transactionType,
  amount,
  phoneNumber,
  network,
  simSlot = 1,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<USSDStep[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [repeatPhoneNumber, setRepeatPhoneNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      initializeUSSDSession();
    }
  }, [isOpen, transactionType]);

  const initializeUSSDSession = () => {
    let initialSteps: USSDStep[] = [];

    // Generate steps based on transaction type
    switch (transactionType) {
      case 'cash_in':
        initialSteps = [
          { id: '1', prompt: `Dialing *171#...` },
          { id: '2', prompt: 'Welcome to MTN Mobile Money\n1. Transfer Money\n2. Cash Out\n3. Merchant Payment\n4. Airtime & Bundle\n5. Financial Services\n\nSelect option:', expectedInput: 'menu' },
          { id: '3', prompt: 'Merchant Payment\n1. Pay Bill\n2. Buy Goods\n3. Send Money\n\nSelect option:', expectedInput: 'menu' },
          { id: '4', prompt: 'Enter recipient number:', expectedInput: 'phone' },
          { id: '5', prompt: 'Re-enter recipient number:', expectedInput: 'phone', requiresRepeat: true },
          { id: '6', prompt: 'Enter amount:', expectedInput: 'amount' },
          { id: '7', prompt: `Confirm Cash In:\nAmount: GHS ${amount}\nTo: ${phoneNumber}\n\n1. Confirm\n2. Cancel`, isConfirmation: true },
          { id: '8', prompt: 'Enter your PIN:', expectedInput: 'pin' },
          { id: '9', prompt: 'Transaction processing...' }
        ];
        break;
      case 'cash_out':
        initialSteps = [
          { id: '1', prompt: `Dialing *171#...` },
          { id: '2', prompt: 'Welcome to MTN Mobile Money\n1. Transfer Money\n2. Cash Out\n3. Merchant Payment\n4. Airtime & Bundle\n5. Financial Services\n\nSelect option:', expectedInput: 'menu' },
          { id: '3', prompt: 'Cash Out\n1. Withdraw from Agent\n2. ATM Withdrawal\n\nSelect option:', expectedInput: 'menu' },
          { id: '4', prompt: 'Enter sender number:', expectedInput: 'phone' },
          { id: '5', prompt: 'Re-enter sender number:', expectedInput: 'phone', requiresRepeat: true },
          { id: '6', prompt: 'Enter amount:', expectedInput: 'amount' },
          { id: '7', prompt: `Confirm Cash Out:\nAmount: GHS ${amount}\nFrom: ${phoneNumber}\n\n1. Confirm\n2. Cancel`, isConfirmation: true },
          { id: '8', prompt: 'Enter your PIN:', expectedInput: 'pin' },
          { id: '9', prompt: 'Transaction processing...' }
        ];
        break;
      case 'airtime_transfer':
        initialSteps = [
          { id: '1', prompt: `Dialing *171#...` },
          { id: '2', prompt: 'Welcome to MTN Mobile Money\n1. Transfer Money\n2. Cash Out\n3. Merchant Payment\n4. Airtime & Bundle\n5. Financial Services\n\nSelect option:', expectedInput: 'menu' },
          { id: '3', prompt: 'Airtime & Bundle\n1. Buy Airtime\n2. Buy Bundle\n3. Transfer Airtime\n\nSelect option:', expectedInput: 'menu' },
          { id: '4', prompt: 'Enter recipient number:', expectedInput: 'phone' },
          { id: '5', prompt: 'Re-enter recipient number:', expectedInput: 'phone', requiresRepeat: true },
          { id: '6', prompt: 'Enter amount:', expectedInput: 'amount' },
          { id: '7', prompt: `Confirm Airtime Transfer:\nAmount: GHS ${amount}\nTo: ${phoneNumber}\n\n1. Confirm\n2. Cancel`, isConfirmation: true },
          { id: '8', prompt: 'Enter your PIN:', expectedInput: 'pin' },
          { id: '9', prompt: 'Transfer processing...' }
        ];
        break;
      case 'pay_merchant':
        initialSteps = [
          { id: '1', prompt: `Dialing *171#...` },
          { id: '2', prompt: 'Welcome to MTN Mobile Money\n1. Transfer Money\n2. Cash Out\n3. Merchant Payment\n4. Airtime & Bundle\n5. Financial Services\n\nSelect option:', expectedInput: 'menu' },
          { id: '3', prompt: 'Merchant Payment\n1. Pay Bill\n2. Buy Goods\n\nSelect option:', expectedInput: 'menu' },
          { id: '4', prompt: 'Enter merchant code:', expectedInput: 'phone' },
          { id: '5', prompt: 'Enter amount:', expectedInput: 'amount' },
          { id: '6', prompt: `Confirm Payment:\nAmount: GHS ${amount}\nMerchant: ${phoneNumber}\n\n1. Confirm\n2. Cancel`, isConfirmation: true },
          { id: '7', prompt: 'Enter your PIN:', expectedInput: 'pin' },
          { id: '8', prompt: 'Payment processing...' }
        ];
        break;
      case 'balance':
        initialSteps = [
          { id: '1', prompt: `Dialing *171#...` },
          { id: '2', prompt: 'Welcome to MTN Mobile Money\n1. Transfer Money\n2. Cash Out\n3. Merchant Payment\n4. Airtime & Bundle\n5. Financial Services\n\nSelect option:', expectedInput: 'menu' },
          { id: '3', prompt: 'Financial Services\n1. Check Balance\n2. Mini Statement\n3. Change PIN\n\nSelect option:', expectedInput: 'menu' },
          { id: '4', prompt: 'Your account balance is:\nGHS 1,250.75\n\nCommission: GHS 127.50\nPress 0 to return to main menu' }
        ];
        break;
      case 'commission':
        initialSteps = [
          { id: '1', prompt: `Dialing *171#...` },
          { id: '2', prompt: 'Welcome to MTN Mobile Money\n1. Transfer Money\n2. Cash Out\n3. Merchant Payment\n4. Airtime & Bundle\n5. Financial Services\n\nSelect option:', expectedInput: 'menu' },
          { id: '3', prompt: 'Financial Services\n1. Check Balance\n2. Mini Statement\n3. Change PIN\n\nSelect option:', expectedInput: 'menu' },
          { id: '4', prompt: 'Commission Summary:\nToday: GHS 45.20\nThis Week: GHS 127.50\nThis Month: GHS 485.75\n\nPress 0 to return to main menu' }
        ];
        break;
      default:
        initialSteps = [
          { id: '1', prompt: `Dialing ${ussdCode}...` },
          { id: '2', prompt: 'USSD session active' }
        ];
    }

    setSteps(initialSteps);
    setCurrentStep(0);
    setSessionActive(true);
    
    // Auto-advance to first input step
    setTimeout(() => {
      if (transactionType === 'balance' || transactionType === 'commission') {
        setCurrentStep(1);
        // Start the menu navigation for balance/commission
      } else {
        setCurrentStep(1);
      }
    }, 1500);
  };

  const handleStepResponse = () => {
    const step = steps[currentStep];
    
    // Handle menu selections
    if (step.expectedInput === 'menu') {
      let menuResponse = '1'; // Default selection
      
      // Determine correct menu response based on transaction type and step
      if (currentStep === 1) { // Main menu
        switch (transactionType) {
          case 'cash_in': menuResponse = '3'; break; // Merchant Payment
          case 'cash_out': menuResponse = '2'; break; // Cash Out
          case 'airtime_transfer': menuResponse = '4'; break; // Airtime & Bundle
          case 'pay_merchant': menuResponse = '3'; break; // Merchant Payment
          case 'balance':
          case 'commission': menuResponse = '5'; break; // Financial Services
        }
      } else if (currentStep === 2) { // Sub menu
        switch (transactionType) {
          case 'cash_in': menuResponse = '3'; break; // Send Money
          case 'cash_out': menuResponse = '1'; break; // Withdraw from Agent
          case 'airtime_transfer': menuResponse = '3'; break; // Transfer Airtime
          case 'pay_merchant': menuResponse = '2'; break; // Buy Goods
          case 'balance': menuResponse = '1'; break; // Check Balance
          case 'commission': menuResponse = '2'; break; // Mini Statement (for commission)
        }
      }
      
      setSteps(prev => prev.map((s, i) => 
        i === currentStep ? { ...s, response: menuResponse } : s
      ));
      setCurrentInput('');
      setCurrentStep(prev => prev + 1);
      
      // Auto-complete for balance/commission after final menu selection
      if ((transactionType === 'balance' || transactionType === 'commission') && currentStep === 2) {
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setTimeout(() => {
            onComplete(true, `KHM${Date.now()}`);
          }, 2000);
        }, 1500);
      }
    } else if (step.expectedInput === 'amount') {
      setSteps(prev => prev.map((s, i) => 
        i === currentStep ? { ...s, response: amount } : s
      ));
      setCurrentInput('');
      setCurrentStep(prev => prev + 1);
    } else if (step.expectedInput === 'phone' && !step.requiresRepeat) {
      setSteps(prev => prev.map((s, i) => 
        i === currentStep ? { ...s, response: phoneNumber } : s
      ));
      setCurrentInput('');
      setCurrentStep(prev => prev + 1);
    } else if (step.expectedInput === 'phone' && step.requiresRepeat) {
      // Handle repeat number entry
      if (currentInput === phoneNumber) {
        setSteps(prev => prev.map((s, i) => 
          i === currentStep ? { ...s, response: currentInput } : s
        ));
        setCurrentInput('');
        setCurrentStep(prev => prev + 1);
      } else {
        // Numbers don't match - show error and stay on same step
        setSteps(prev => prev.map((s, i) => 
          i === currentStep ? { 
            ...s, 
            prompt: `Numbers don't match!\n\nRe-enter recipient number:`,
            response: undefined 
          } : s
        ));
        setCurrentInput('');
      }
    } else if (step.isConfirmation) {
      setSteps(prev => prev.map((s, i) => 
        i === currentStep ? { ...s, response: '1' } : s
      ));
      setCurrentInput('');
      setCurrentStep(prev => prev + 1);
    } else if (step.expectedInput === 'pin') {
      setSteps(prev => prev.map((s, i) => 
        i === currentStep ? { ...s, response: '****' } : s
      ));
      setCurrentInput('');
      setCurrentStep(prev => prev + 1);
      
      // Start final processing
      setProcessing(true);
      setTimeout(() => {
        const success = Math.random() > 0.05; // 95% success rate
        const reference = `KHM${Date.now()}`;
        setProcessing(false);
        onComplete(success, reference);
        
        if (success) {
          setSteps(prev => [...prev, {
            id: 'success',
            prompt: `✓ Transaction successful! Reference: ${reference}`
          }]);
        } else {
          setSteps(prev => [...prev, {
            id: 'error',
            prompt: '✗ Transaction failed. Please try again.'
          }]);
        }
      }, 3000);
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

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">USSD Processor</h3>
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

        {/* USSD Session Display */}
        <div className="bg-black rounded-lg p-4 mb-6 font-mono text-sm text-green-400 min-h-32">
          <div className="space-y-2">
            {steps.slice(0, currentStep + 1).map((step, index) => (
              <div key={step.id} className="flex flex-col space-y-1">
                <div className="text-white">{step.prompt}</div>
                {step.response && (
                  <div className="text-green-400 ml-2">→ {step.response}</div>
                )}
                {index === currentStep && currentStepData?.expectedInput && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-yellow-400">&gt;</span>
                    <input
                      type={currentStepData.expectedInput === 'pin' ? 'password' : 'text'}
                      value={currentStepData.expectedInput === 'amount' ? amount : 
                             currentStepData.expectedInput === 'phone' ? phoneNumber : 
                             currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      className="bg-transparent border-none outline-none text-green-400 flex-1"
                      placeholder={currentStepData.expectedInput === 'pin' ? 'Enter PIN' : 'Type here...'}
                      readOnly={currentStepData.expectedInput === 'amount' || (currentStepData.expectedInput === 'phone' && !currentStepData.requiresRepeat)}
                      autoFocus
                    />
                  </div>
                )}
                {index === currentStep && currentStepData?.isConfirmation && (
                  <div className="mt-2 p-2 bg-gray-800 rounded">
                    <div className="text-green-400 text-xs">Press 1 to confirm, 2 to cancel</div>
                  </div>
                )}
              </div>
            ))}
            {processing && (
              <div className="flex items-center space-x-2 text-yellow-400">
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {(currentStepData?.expectedInput || currentStepData?.isConfirmation || (currentStep === 1 && !currentStepData?.expectedInput)) ? (
            <button
              onClick={handleStepResponse}
              disabled={processing}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowRight className="w-5 h-5" />
              <span>
                {currentStepData?.expectedInput === 'menu' ? 'Select' :
                 currentStepData?.isConfirmation ? 'Confirm' : 
                 currentStepData?.requiresRepeat ? 'Verify' :
                 'Send'}
              </span>
            </button>
          ) : (
            <button
              onClick={handleCopy}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {copied ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          )}
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
            <strong>Real USSD Flow:</strong> This simulates the exact process of dialing *171# and 
            navigating through the menus step by step, just like on a real device using SIM {simSlot}.
          </p>
        </div>
      </div>
    </div>
  );
};