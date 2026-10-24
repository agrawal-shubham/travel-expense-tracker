export type ExpenseCategory =
  | 'flight'
  | 'transfer'
  | 'hotel'
  | 'food'
  | 'activity'
  | 'shopping'
  | 'insurance'
  | 'other';

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'cash'
  | 'mobile_pay'
  | 'forex';

export interface Expense {
  id: string;
  userId: string;
  tripId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  currency: string; // original currency of transaction
  convertedAmount: number; // in trip's base currency
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  location?: string;
  paymentMethod: PaymentMethod;
  paidBy: string;
  splitWith?: string[];
  notes?: string;
  receiptName?: string;
  createdAt: number;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string; // base currency e.g. "USD", "EUR", "JPY"
  travelers: string[];
  notes?: string;
  categoryBudgets?: Partial<Record<ExpenseCategory, number>>;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rateToUSD: number; // 1 USD = X in this currency
}

export interface CategoryConfig {
  id: ExpenseCategory;
  name: string;
  iconName: string;
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  placeholderExamples: string[];
}
