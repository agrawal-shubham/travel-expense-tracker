import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Users,
  Edit2,
  Trash2,
  Receipt,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Expense, Trip } from '../types';
import { CATEGORIES, PAYMENT_METHODS, formatCurrency } from '../utils/constants';
import { CategoryIcon, PaymentIcon } from './CategoryIcon';

interface ExpenseCardProps {
  expense: Expense;
  trip: Trip;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onViewDetails?: (expense: Expense) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  trip,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const config = CATEGORIES[expense.category] || CATEGORIES.other;
  const payment = PAYMENT_METHODS.find((p) => p.id === expense.paymentMethod);

  const isForeignCurrency = expense.currency !== trip.currency;
  const splitCount = (expense.splitWith && expense.splitWith.length > 0) ? expense.splitWith.length : 1;
  const perPersonShare = expense.convertedAmount / splitCount;

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Category Icon + Title + Meta */}
        <div className="flex items-start gap-3.5">
          {/* Category Icon Badge */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: `${config.color}15`, color: config.color, border: `1px solid ${config.color}30` }}
          >
            <CategoryIcon category={expense.category} className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${config.badgeBg}`}
              >
                {config.name}
              </span>

              {expense.location && (
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[180px]">{expense.location}</span>
                </span>
              )}

              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {expense.date}
                {expense.time && ` • ${expense.time}`}
              </span>
            </div>

            <h4
              onClick={() => onViewDetails?.(expense)}
              className="text-base font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              {expense.title}
            </h4>

            {expense.notes && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                "{expense.notes}"
              </p>
            )}

            {/* Tags row: Payment, Paid By, Split */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <PaymentIcon method={expense.paymentMethod} className="w-3 h-3" />
                {payment?.label || 'Card'}
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <User className="w-3 h-3 text-slate-400" />
                Paid by {expense.paidBy}
              </span>

              {expense.splitWith && expense.splitWith.length > 1 && (
                <span
                  title={`Split among ${expense.splitWith.join(', ')} (${formatCurrency(perPersonShare, trip.currency)} each)`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                >
                  <Users className="w-3 h-3" />
                  Split ({expense.splitWith.length}): {formatCurrency(perPersonShare, trip.currency)}/ea
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Amount + Actions */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 shrink-0">
          <div className="text-right">
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {formatCurrency(expense.convertedAmount, trip.currency)}
            </div>
            {isForeignCurrency && (
              <div className="text-xs text-slate-400 font-medium">
                {formatCurrency(expense.amount, expense.currency)} {expense.currency}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 mt-2">
            {showConfirmDelete ? (
              <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 p-1 rounded-lg border border-rose-200 dark:border-rose-900 animate-in fade-in">
                <span className="text-[11px] text-rose-700 dark:text-rose-300 px-1 font-semibold">
                  Delete?
                </span>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="px-2 py-1 text-xs bg-rose-600 text-white rounded font-medium hover:bg-rose-700 transition"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-1.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
                >
                  No
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onEdit(expense)}
                  title="Edit expense"
                  className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  title="Delete expense"
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
