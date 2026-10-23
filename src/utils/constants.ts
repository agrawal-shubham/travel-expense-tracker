import { CategoryConfig, CurrencyInfo, ExpenseCategory, PaymentMethod } from '../types';

export const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', rateToUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', rateToUSD: 0.92 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', rateToUSD: 154.5 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', rateToUSD: 0.79 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦', rateToUSD: 1.39 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', rateToUSD: 1.54 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', rateToUSD: 0.88 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', rateToUSD: 1.34 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', rateToUSD: 84.4 },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭', rateToUSD: 34.6 },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪', rateToUSD: 3.67 },
  MXN: { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', flag: '🇲🇽', rateToUSD: 19.8 },
};

export const CATEGORIES: Record<ExpenseCategory, CategoryConfig> = {
  flight: {
    id: 'flight',
    name: 'Flights',
    iconName: 'Plane',
    color: '#3B82F6', // blue
    bgLight: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
    placeholderExamples: [
      'Roundtrip tickets NYC ⇄ Tokyo',
      'Seat upgrade & baggage fee',
      'In-flight WiFi & meals',
      'Domestic connector flight',
    ],
  },
  transfer: {
    id: 'transfer',
    name: 'Transfers & Transit',
    iconName: 'TrainFront',
    color: '#8B5CF6', // purple
    bgLight: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
    placeholderExamples: [
      'Shinkansen bullet train pass',
      'Airport express train ticket',
      'Uber / Grab ride to hotel',
      'Metro 7-day transit card',
      'Ferry transfer to island',
    ],
  },
  hotel: {
    id: 'hotel',
    name: 'Hotels & Stays',
    iconName: 'Hotel',
    color: '#EC4899', // pink/rose
    bgLight: 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300',
    borderColor: 'border-pink-200 dark:border-pink-800',
    textColor: 'text-pink-600 dark:text-pink-400',
    badgeBg: 'bg-pink-100 text-pink-800 dark:bg-pink-900/60 dark:text-pink-200',
    placeholderExamples: [
      'Ryokan with private Onsen (2 nights)',
      'Boutique City Center Hotel',
      'Airbnb Beachfront Villa',
      'City tourist city tax',
      'Early check-in fee',
    ],
  },
  food: {
    id: 'food',
    name: 'Food & Dining',
    iconName: 'UtensilsCrossed',
    color: '#F97316', // orange
    bgLight: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-600 dark:text-orange-400',
    badgeBg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200',
    placeholderExamples: [
      'Ramen dinner in Shibuya',
      'Matcha latte & fluffy soufflé pancakes',
      'Tsukiji outer market street food',
      'Convenience store snacks (7-Eleven)',
      'Fine dining tasting menu',
    ],
  },
  activity: {
    id: 'activity',
    name: 'Activities & Tours',
    iconName: 'Compass',
    color: '#10B981', // emerald
    bgLight: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
    placeholderExamples: [
      'teamLab Planets digital art ticket',
      'Mount Fuji guided day tour',
      'Scuba diving lesson & gear rental',
      'Cooking masterclass with local chef',
      'Museum admission & audio guide',
    ],
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping & Gifts',
    iconName: 'ShoppingBag',
    color: '#EAB308', // amber
    bgLight: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
    placeholderExamples: [
      'Handmade Japanese ceramic tea set',
      'Duty-free skincare & perfumes',
      'Local artisan gifts & souvenirs',
      'Vintage clothing finds',
    ],
  },
  insurance: {
    id: 'insurance',
    name: 'Travel Insurance & Health',
    iconName: 'ShieldCheck',
    color: '#06B6D4', // cyan
    bgLight: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200',
    placeholderExamples: [
      'Comprehensive Travel Health Insurance',
      'eSIM international data plan',
      'Emergency travel medication',
    ],
  },
  other: {
    id: 'other',
    name: 'Other & Miscellaneous',
    iconName: 'Receipt',
    color: '#64748B', // slate
    bgLight: 'bg-slate-50 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300',
    borderColor: 'border-slate-200 dark:border-slate-700',
    textColor: 'text-slate-600 dark:text-slate-400',
    badgeBg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    placeholderExamples: [
      'Luggage storage locker fee',
      'Currency exchange fee',
      'SIM card replacement',
      'Tips & gratuities',
    ],
  },
};

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'credit_card', label: 'Credit Card', icon: 'CreditCard' },
  { id: 'debit_card', label: 'Debit Card', icon: 'CreditCard' },
  { id: 'cash', label: 'Cash', icon: 'Banknote' },
  { id: 'mobile_pay', label: 'Apple / Google Pay', icon: 'Smartphone' },
  { id: 'forex', label: 'Forex Travel Card', icon: 'Wallet' },
];

export function convertAmount(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = CURRENCIES[fromCurrency]?.rateToUSD ?? 1;
  const toRate = CURRENCIES[toCurrency]?.rateToUSD ?? 1;
  
  // Convert from origin to USD, then USD to target
  const inUSD = amount / fromRate;
  const targetAmount = inUSD * toRate;
  return Math.round(targetAmount * 100) / 100;
}

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const currency = CURRENCIES[currencyCode];
  const symbol = currency?.symbol || currencyCode;
  
  // Format with commas and 2 decimals or 0 decimals for JPY
  const isNoDecimals = currencyCode === 'JPY';
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: isNoDecimals ? 0 : 2,
    maximumFractionDigits: isNoDecimals ? 0 : 2,
  }).format(amount);

  return `${symbol}${formattedNumber}`;
}
