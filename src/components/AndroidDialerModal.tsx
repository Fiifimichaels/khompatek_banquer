import React, { useState, useEffect } from 'react';
import { Phone, X, ArrowLeft } from 'lucide-react';

interface AndroidDialerModalProps {
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

interface USSDStep {
  id: string;
  prompt: string;
  options?: string[];
  response?: string;
  isInput?: boolean;
  inputType?: 'phone' | 'amount' | 'pin' | 'confirmation';
  requiresRepeat?: boolean;
}

export const AndroidDialerModal: React.FC<AndroidDialerModalProps> = ({
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
  const [currentInput, setCurrentInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

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
          { 
            id: '1', 
            prompt: 'Cash In\n1) Mobile Money User\n2) Money Transfer\n0) Back',
            options: ['1', '2', '0']
          },
          { 
            id: '2', 
            prompt: 'Mobile Money User\n1) Send Money\n2) Request Money\n0) Back',
            options: ['1', '2', '0']
          },
          { 
            id: '3', 
            prompt: 'Enter recipient number:',
            isInput: true,
            inputType: 'phone'
          },
          { 
            id: '4', 
            prompt: 'Re-enter recipient number:',
            isInput: true,
            inputType: 'phone',
            requiresRepeat: true
          },
          { 
            id: '5', 
            prompt: 'Enter amount:',
            isInput: true,
            inputType: 'amount'
          },
          { 
            id: '6', 
            prompt: `Confirm Cash In:\nAmount: GHS ${amount}\nTo: ${phoneNumber}\n\n1) Confirm\n2) Cancel`,
            options: ['1', '2']
          },
          { 
            id: '7', 
            prompt: 'Enter your PIN:',
            isInput: true,
            inputType: 'pin'
          }
        ];
        break;
      case 'cash_out':
        initialSteps = [
          { 
            id: '1', 
            prompt: 'Cash Out\n1) Withdraw from Agent\n2) ATM Withdrawal\n0) Back',
            options: ['1', '2', '0']
          },
          { 
            id: '2', 
            prompt: 'Enter sender number:',
            isInput: true,
            inputType: 'phone'
          },
          { 
            id: '3', 
            prompt: 'Re-enter sender number:',
            isInput: true,
            inputType: 'phone',
            requiresRepeat: true
          },
          { 
            id: '4', 
            prompt: 'Enter amount:',
            isInput: true,
            inputType: 'amount'
          },
          { 
            id: '5', 
            prompt: `Confirm Cash Out:\nAmount: GHS ${amount}\nFrom: ${phoneNumber}\n\n1) Confirm\n2) Cancel`,
            options: ['1', '2']
          },
          { 
            id: '6', 
            prompt: 'Enter your PIN:',
            isInput: true,
            inputType: 'pin'
          }
        ];
        break;
      case 'airtime_transfer':
        initialSteps = [
          { 
            id: '1', 
            prompt: 'Airtime & Bundle\n1) Buy Airtime\n2) Buy Bundle\n3) Transfer Airtime\n0) Back',
            options: ['1', '2', '3', '0']
          },
          { 
            id: '2', 
            prompt: 'Enter recipient number:',
            isInput: true,
            inputType: 'phone'
          },
          { 
            id: '3', 
            prompt: 'Re-enter recipient number:',
            isInput: true,
            inputType: 'phone',
            requiresRepeat: true
          },
          { 
            id: '4', 
            prompt: 'Enter amount:',
            isInput: true,
            inputType: 'amount'
          },
          { 
            id: '5', 
            prompt: `Confirm Airtime Transfer:\nAmount: GHS ${amount}\nTo: ${phoneNumber}\n\n1) Confirm\n2) Cancel`,
            options: ['1', '2']
          },
          { 
            id: '6', 
            prompt: 'Enter your PIN:',
            isInput: true,
            inputType: 'pin'
          }
        ];
        break;
      case 'balance':
        initialSteps = [
          { 
            id: '1', 
            prompt: 'Financial Services\n1) Check Balance\n2) Mini Statement\n3) Change PIN\n0) Back',
            options: ['1', '2', '3', '0']
          },
          { 
            id: '2', 
            prompt: 'Your account balance is:\nGHS 1,250.75\n\nCommission: GHS 127.50\n\n0) Back to main menu'
          }
        ];
        break;
      case 'commission':
        initialSteps = [
          { 
            id: '1', 
            prompt: 'Financial Services\n1) Check Balance\n2) Mini Statement\n3) Change PIN\n0) Back',
            options: ['1', '2', '3', '0']
          },
          { 
            id: '2', 
            prompt: 'Commission Summary:\nToday: GHS 45.20\nThis Week: GHS 127.50\nThis Month: GHS 485.75\n\n0) Back to main menu'
          }
        ];
        break;
      default:
        initialSteps = [
          { id: '1', prompt: 'USSD session active' }
        ];
    }

    setSteps(initialSteps);
    setCurrentStep(0);
    setSessionActive(true);
  };

  const handleOptionSelect = (option: string) => {
    const step = steps[currentStep];
    
    // Update current step with response
    setSteps(prev => prev.map((s, i) => 
      i === currentStep ? { ...s, response: option } : s
    ));

    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete transaction
      completeTransaction();
    }
  };

  const handleInputSubmit = () => {
    const step = steps[currentStep];
    let inputValue = currentInput;

    // Handle different input types
    if (step.inputType === 'amount') {
      inputValue = amount;
    } else if (step.inputType === 'phone' && !step.requiresRepeat) {
      inputValue = phoneNumber;
    } else if (step.inputType === 'phone' && step.requiresRepeat) {
      if (currentInput !== phoneNumber) {
        alert('Phone numbers do not match. Please try again.');
        setCurrentInput('');
        return;
      }
    } else if (step.inputType === 'pin') {
      inputValue = '****';
    }

    // Update current step with response
    setSteps(prev => prev.map((s, i) => 
      i === currentStep ? { ...s, response: inputValue } : s
    ));

    setCurrentInput('');

    // Move to next step or complete
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTransaction();
    }
  };

  const completeTransaction = () => {
    setProcessing(true);
    
    setTimeout(() => {
      const success = Math.random() > 0.05; // 95% success rate
      const reference = `KHM${Date.now()}`;
      setProcessing(false);
      onComplete(success, reference);
    }, 2000);
  };

  const handleCancel = () => {
    setSessionActive(false);
    onClose();
  };

  const handleSend = () => {
    if (steps[currentStep]?.isInput) {
      handleInputSubmit();
    } else {
      // Auto-select appropriate option based on transaction type
      let autoOption = '1';
      if (currentStep === 0) {
        switch (transactionType) {
          case 'cash_in': autoOption = '1'; break;
          case 'cash_out': autoOption = '1'; break;
          case 'airtime_transfer': autoOption = '3'; break;
          case 'balance': autoOption = '1'; break;
          case 'commission': autoOption = '2'; break;
        }
      }
      handleOptionSelect(autoOption);
    }
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-end justify-center z-50">
      {/* Android Dialer Interface */}
      <div className="bg-gray-800 bg-opacity-95 backdrop-blur-sm rounded-t-3xl w-full max-w-md mx-auto pb-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <button
            onClick={handleCancel}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <p className="text-white font-medium">*171#</p>
            <p className="text-gray-400 text-sm">SIM {simSlot} - {network}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* USSD Content */}
        <div className="p-6 min-h-64">
          {processing ? (
            <div className="text-center text-white">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Processing transaction...</p>
            </div>
          ) : (
            <div className="text-white">
              <div className="mb-6">
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                  {currentStepData?.prompt}
                </p>
              </div>

              {/* Input Field */}
              {currentStepData?.isInput && (
                <div className="mb-6">
                  <div className="border-b border-blue-400 pb-2">
                    <input
                      type={currentStepData.inputType === 'pin' ? 'password' : 'text'}
                      value={
                        currentStepData.inputType === 'amount' ? amount :
                        currentStepData.inputType === 'phone' && !currentStepData.requiresRepeat ? phoneNumber :
                        currentInput
                      }
                      onChange={(e) => setCurrentInput(e.target.value)}
                      className="bg-transparent text-white text-lg w-full outline-none placeholder-gray-400"
                      placeholder={
                        currentStepData.inputType === 'pin' ? 'Enter PIN' :
                        currentStepData.inputType === 'amount' ? 'Amount' :
                        'Enter here...'
                      }
                      readOnly={
                        currentStepData.inputType === 'amount' || 
                        (currentStepData.inputType === 'phone' && !currentStepData.requiresRepeat)
                      }
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!processing && (
          <div className="flex justify-center space-x-16 px-6">
            <button
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};