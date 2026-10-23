import React from 'react';
import {
  Plane,
  TrainFront,
  Hotel,
  UtensilsCrossed,
  Compass,
  ShoppingBag,
  ShieldCheck,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Filter,
  Download,
  Share2,
  ChevronDown,
  ChevronRight,
  Info,
  Check,
  X,
  PieChart,
  ListFilter,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { ExpenseCategory, PaymentMethod } from '../types';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/constants';

interface CategoryIconProps {
  category: ExpenseCategory;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  className = 'w-5 h-5',
  size,
}) => {
  switch (category) {
    case 'flight':
      return <Plane className={className} size={size} />;
    case 'transfer':
      return <TrainFront className={className} size={size} />;
    case 'hotel':
      return <Hotel className={className} size={size} />;
    case 'food':
      return <UtensilsCrossed className={className} size={size} />;
    case 'activity':
      return <Compass className={className} size={size} />;
    case 'shopping':
      return <ShoppingBag className={className} size={size} />;
    case 'insurance':
      return <ShieldCheck className={className} size={size} />;
    case 'other':
    default:
      return <Receipt className={className} size={size} />;
  }
};

interface PaymentIconProps {
  method: PaymentMethod;
  className?: string;
  size?: number;
}

export const PaymentIcon: React.FC<PaymentIconProps> = ({
  method,
  className = 'w-4 h-4',
  size,
}) => {
  switch (method) {
    case 'credit_card':
    case 'debit_card':
      return <CreditCard className={className} size={size} />;
    case 'cash':
      return <Banknote className={className} size={size} />;
    case 'mobile_pay':
      return <Smartphone className={className} size={size} />;
    case 'forex':
      return <Wallet className={className} size={size} />;
    default:
      return <CreditCard className={className} size={size} />;
  }
};
