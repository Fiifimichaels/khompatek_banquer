import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Transaction, USSDCode, Agent, TransactionTypeConfig } from '../types';

interface AppState {
  transactions: Transaction[];
  ussdCodes: USSDCode[];
  agent: Agent;
  currentTransaction: Partial<Transaction> | null;
  transactionTypeConfigs: TransactionTypeConfig[];
}

type AppAction = 
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'CLEAR_TRANSACTIONS_BY_DATE'; payload: { startDate: Date; endDate: Date } }
  | { type: 'SET_CURRENT_TRANSACTION'; payload: Partial<Transaction> | null }
  | { type: 'ADD_USSD_CODE'; payload: USSDCode }
  | { type: 'UPDATE_USSD_CODE'; payload: { id: string; updates: Partial<USSDCode> } }
  | { type: 'DELETE_USSD_CODE'; payload: string }
  | { type: 'UPDATE_AGENT'; payload: Partial<Agent> }
  | { type: 'UPDATE_TRANSACTION_TYPE_CONFIG'; payload: { id: string; updates: Partial<TransactionTypeConfig> } }
  | { type: 'LOAD_STATE'; payload: AppState };

const initialState: AppState = {
  transactions: [],
  ussdCodes: [
    {
      id: '1',
      name: 'MTN Cash In',
      code: '*170*01*1*{amount}*{phone}#',
      description: 'MTN mobile money cash in',
      network: 'MTN',
      isActive: true,
      category: 'cash_in',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Vodafone Cash Out',
      code: '*110*01*2*{amount}*{phone}#',
      description: 'Vodafone cash out service',
      network: 'VODAFONE',
      isActive: true,
      category: 'cash_out',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'AirtelTigo Airtime',
      code: '*133*{amount}*{phone}#',
      description: 'AirtelTigo airtime transfer',
      network: 'AIRTELTIGO',
      isActive: true,
      category: 'airtime_transfer',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      name: 'MTN Balance Check',
      code: '*170*7#',
      description: 'Check MTN mobile money balance',
      network: 'MTN',
      isActive: true,
      category: 'balance',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  agent: {
    id: '1',
    name: 'Agent User',
    phoneNumber: '0244123456',
    balance: 5000,
    commission: 127.50,
    totalTransactions: 23
  },
  currentTransaction: null,
  transactionTypeConfigs: [
    {
      id: 'cash_in',
      type: 'cash_in',
      name: 'Cash In',
      networks: {
        MTN: '*171*3*1*{phone}*{phone}*{amount}#',
        VODAFONE: '*110*01*1*{amount}*{phone}#',
        AIRTELTIGO: '*133*01*1*{amount}*{phone}#'
      },
      isActive: true
    },
    {
      id: 'cash_out',
      type: 'cash_out',
      name: 'Cash Out',
      networks: {
        MTN: '*171*2*1*{phone}*{phone}*{amount}#',
        VODAFONE: '*110*01*2*{amount}*{phone}#',
        AIRTELTIGO: '*133*01*2*{amount}*{phone}#'
      },
      isActive: true
    },
    {
      id: 'airtime_transfer',
      type: 'airtime_transfer',
      name: 'Airtime Transfer',
      networks: {
        MTN: '*170*02*{amount}*{phone}#',
        VODAFONE: '*110*02*{amount}*{phone}#',
        AIRTELTIGO: '*133*02*{amount}*{phone}#'
      },
      isActive: true
    },
    {
      id: 'pay_merchant',
      type: 'pay_merchant',
      name: 'Pay to Merchant',
      networks: {
        MTN: '*170*03*{amount}*{merchant}#',
        VODAFONE: '*110*03*{amount}*{merchant}#',
        AIRTELTIGO: '*133*03*{amount}*{merchant}#'
      },
      isActive: true
    },
    {
      id: 'commission',
      type: 'commission',
      name: 'Commission Check',
      networks: {
        MTN: '*170*8#',
        VODAFONE: '*110*8#',
        AIRTELTIGO: '*133*8#'
      },
      isActive: true
    },
    {
      id: 'balance',
      type: 'balance',
      name: 'Balance Check',
      networks: {
        MTN: '*170*7#',
        VODAFONE: '*110*7#',
        AIRTELTIGO: '*133*7#'
      },
      isActive: true
    }
  ]
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        agent: {
          ...state.agent,
          totalTransactions: state.agent.totalTransactions + 1,
          commission: state.agent.commission + (action.payload.commission || 0)
        }
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        )
      };
    case 'CLEAR_TRANSACTIONS_BY_DATE':
      return {
        ...state,
        transactions: state.transactions.filter(t => {
          const transactionDate = new Date(t.timestamp);
          return transactionDate < action.payload.startDate || transactionDate > action.payload.endDate;
        })
      };
    case 'SET_CURRENT_TRANSACTION':
      return {
        ...state,
        currentTransaction: action.payload
      };
    case 'ADD_USSD_CODE':
      return {
        ...state,
        ussdCodes: [...state.ussdCodes, action.payload]
      };
    case 'UPDATE_USSD_CODE':
      return {
        ...state,
        ussdCodes: state.ussdCodes.map(code => 
          code.id === action.payload.id ? { ...code, ...action.payload.updates, updatedAt: new Date() } : code
        )
      };
    case 'DELETE_USSD_CODE':
      return {
        ...state,
        ussdCodes: state.ussdCodes.filter(code => code.id !== action.payload)
      };
    case 'UPDATE_AGENT':
      return {
        ...state,
        agent: { ...state.agent, ...action.payload }
      };
    case 'UPDATE_TRANSACTION_TYPE_CONFIG':
      return {
        ...state,
        transactionTypeConfigs: state.transactionTypeConfigs.map(config => 
          config.id === action.payload.id ? { ...config, ...action.payload.updates } : config
        )
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedState = localStorage.getItem('khompatek-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Ensure backward compatibility
        if (!parsedState.transactionTypeConfigs) {
          parsedState.transactionTypeConfigs = initialState.transactionTypeConfigs;
        }
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('khompatek-state', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};