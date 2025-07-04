import React, { useState, useEffect } from 'react';
import { Phone, Copy, CheckCircle, AlertCircle, X, Sigma as Sim, ArrowRight, RotateCcw } from 'lucide-react';
import { copyToClipboard } from '../utils/ussdDialer';

interface USSDStep {
  id: string;
  prompt: string;
  response?: string;
  isConfirmation?: boolean;
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
          { id: '1', prompt: `Dialing ${ussdCode}...` },
          { id: '2', prompt: 'Enter amount:', expectedInput: 'amount' },
          { id: '3', prompt: 'Enter recipient number:', expectedInput: 'phone' },
          { id: '4', prompt: 'Confirm transaction details:', isConfirmation: true },
          { id: '5', prompt: 'Enter your PIN:', expectedInput: 'pin' },
          { id: '6', prompt: 'Transaction processing...' }
        ];
        break;
      case 'cash_out':
        initialSteps = [
          { id: '1', prompt: `Dialing ${ussdCode}...` },
          { id: '2', prompt: 'Enter amount:', expectedInput: 'amount' },
          { id: '3', prompt: 'Enter sender number:', expectedInput: 'phone' },
          { id: '4', prompt: 'Confirm transaction details:', isConfirmation: true },
          { id: '5', prompt: 'Enter your PIN:', expectedInput: 'pin' },
          { id: '6', prompt: 'Transaction processing...' }
        ];
        break;
      case 'airtime_transfer':
        initialSteps = [
          { id: '1', prompt: `Dialing ${ussdCode}...` },
          { id: '2', prompt: 'Enter amount:', expectedInput: 'amount' },
          { id: '3', prompt: 'Enter recipient number:', expectedInput: 'phone' },
          { id: '4', prompt: 'Confirm airtime transfer:', isConfirmation: true },
          { id: '5', prompt: 'Enter your PIN:', expectedInput: 'pin' },
          { id: '6', prompt: 'Transfer processing...' }
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
      setCurrentStep(1);
    }, 1500);
  };

  const handleStepResponse = () => {
    const step = steps[currentStep];
    
    if (step.expectedInput === 'amount') {
      setSteps(prev => prev.map((s, i) => 
        i === currentStep ? { ...s, response: amount } : s
      ));
      setCurrentInput('');
      setCurrentStep(prev => prev + 1);
    } else if (step.expectedInput === 'phone') {
      setSteps(prev => prev.map((s, i) => 
        i === currentStep ? { ...s, response: phoneNumber } : s
      ));
      setCurrentInput('');
      setCurrentStep(prev => prev + 1);
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
                    <span className="text-yellow-400">></span>
                    <input
                      type={currentStepData.expectedInput === 'pin' ? 'password' : 'text'}
                      value={currentStepData.expectedInput === 'amount' ? amount : 
                             currentStepData.expectedInput === 'phone' ? phoneNumber : 
                             currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      className="bg-transparent border-none outline-none text-green-400 flex-1"
                      placeholder={currentStepData.expectedInput === 'pin' ? 'Enter PIN' : 'Type here...'}
                      readOnly={currentStepData.expectedInput === 'amount' || currentStepData.expectedInput === 'phone'}
                      autoFocus
                    />
                  </div>
                )}
                {index === currentStep && currentStepData?.isConfirmation && (
                  <div className="mt-2 p-2 bg-gray-800 rounded">
                    <div className="text-yellow-400 text-xs mb-2">Confirm transaction:</div>
                    <div className="text-white text-xs">
                      Amount: GHS {amount}<br/>
                      Number: {phoneNumber}<br/>
                      Network: {network}
                    </div>
                    <div className="text-green-400 mt-2">Press 1 to confirm, 2 to cancel</div>
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
          {currentStepData?.expectedInput || currentStepData?.isConfirmation ? (
            <button
              onClick={handleStepResponse}
              disabled={processing}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowRight className="w-5 h-5" />
              <span>Send</span>
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
            <strong>Simulated USSD:</strong> This simulates the actual USSD flow. In production, 
            this would interface with the device's USSD capabilities using SIM {simSlot}.
          </p>
        </div>
      </div>
    </div>
  );
};