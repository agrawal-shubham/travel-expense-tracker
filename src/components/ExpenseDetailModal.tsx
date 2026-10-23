import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  User,
  Users,
  Edit2,
  Trash2,
  FileText,
  DollarSign,
  Share2,
} from 'lucide-react';
import { Expense, Trip } from '../types';
import { CATEGORIES, PAYMENT_METHODS, formatCurrency } from '../utils/constants';
import { CategoryIcon, PaymentIcon } from './CategoryIcon';

interface ExpenseDetailModalProps {
  expense: Expense | null;
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  trip,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !expense) return null;

  const config = CATEGORIES[expense.category] || CATEGORIES.other;
  const payment = PAYMENT_METHODS.find((p) => p.id === expense.paymentMethod);
  const isForeign = expense.currency !== trip.currency;
  const splitCount = (expense.splitWith && expense.splitWith.length > 0) ? expense.splitWith.length : 1;
  const perPersonShare = expense.convertedAmount / splitCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Banner */}
        <div
          className="p-6 relative text-white"
          style={{
            background: `linear-gradient(135deg, ${config.color}, ${config.color}dd)`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider font-bold bg-white/25 px-2.5 py-0.5 rounded-full">
              {config.name}
            </span>
          </div>

          <h2 className="text-2xl font-black">{expense.title}</h2>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black">
              {formatCurrency(expense.convertedAmount, trip.currency)}
            </span>
            {isForeign && (
              <span className="text-sm font-semibold opacity-90">
                ({formatCurrency(expense.amount, expense.currency)} {expense.currency})
              </span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Date & Time
              </span>
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-sm">
                <Calendar className="w-4 h-4 text-blue-500" />
                {expense.date} {expense.time ? `• ${expense.time}` : ''}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Payment Method
              </span>
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-sm">
                <PaymentIcon method={expense.paymentMethod} className="w-4 h-4 text-emerald-500" />
                {payment?.label || 'Card'}
              </div>
            </div>
          </div>

          {/* Location */}
          {expense.location && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-xs block mb-1">
                Location / Merchant
              </span>
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-rose-500" />
                {expense.location}
              </div>
            </div>
          )}

          {/* Paid By & Split */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Paid by:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{expense.paidBy}</span>
            </div>

            {expense.splitWith && expense.splitWith.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Split between:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {expense.splitWith.join(', ')} ({expense.splitWith.length} people)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Each person's share:</span>
                  <span>{formatCurrency(perPersonShare, trip.currency)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {expense.notes && (
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
              <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                Notes & Booking Reference
              </span>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {expense.notes}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                onDelete(expense.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-medium text-xs transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete Expense
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit(expense);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-blue-500/20 transition"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
