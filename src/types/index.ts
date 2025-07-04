export interface Transaction {
  id: string;
  type: 'cash_in' | 'cash_out' | 'airtime_transfer' | 'custom_ussd' | 'pay_merchant' | 'commission' | 'balance';
  amount: number;
  phoneNumber: string;
  isPorted: boolean;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  reference?: string;
  commission?: number;
  network?: string;
  ussdCodeId?: string;
}

export interface USSDCode {
  id: string;
  name: string;
  code: string;
  description: string;
  network: 'MTN' | 'VODAFONE' | 'AIRTELTIGO' | 'UNIVERSAL';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: 'cash_in' | 'cash_out' | 'airtime_transfer' | 'custom_ussd' | 'pay_merchant' | 'commission' | 'balance';
}

export interface TransactionTypeConfig {
  id: string;
  type: 'cash_in' | 'cash_out' | 'airtime_transfer' | 'pay_merchant' | 'commission' | 'balance';
  name: string;
  networks: {
    MTN?: string;
    VODAFONE?: string;
    AIRTELTIGO?: string;
    UNIVERSAL?: string;
  };
  isActive: boolean;
}

export interface Agent {
  id: string;
  name: string;
  phoneNumber: string;
  balance: number;
  commission: number;
  totalTransactions: number;
}