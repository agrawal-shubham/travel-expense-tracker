import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  Wallet,
  Clock,
  PieChart,
  Users,
  Compass,
} from 'lucide-react';
import { Expense, ExpenseCategory, Trip } from '../types';
import { CATEGORIES, formatCurrency } from '../utils/constants';
import { CategoryIcon } from './CategoryIcon';

interface TripOverviewProps {
  trip: Trip;
  expenses: Expense[];
  selectedCategory: ExpenseCategory | 'all';
  onSelectCategory: (category: ExpenseCategory | 'all') => void;
  onOpenTripModal: () => void;
}

export const TripOverview: React.FC<TripOverviewProps> = ({
  trip,
  expenses,
  selectedCategory,
  onSelectCategory,
  onOpenTripModal,
}) => {
  // Calculations
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.convertedAmount, 0);
  const remainingBudget = trip.budget - totalSpent;
  const percentUsed = trip.budget > 0 ? (totalSpent / trip.budget) * 100 : 0;
  const isOverBudget = remainingBudget < 0;

  // Duration in days
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const tripDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  const avgDaily = totalSpent / tripDays;

  // Spend by Category
  const categorySpending = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.convertedAmount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  return (
    <div className="space-y-4">
      {/* Top Banner / Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Spent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Spent
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(totalSpent, trip.currency)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{expenses.length} expenses recorded</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-500/5 rounded-full pointer-events-none" />
        </div>

        {/* Total Budget & Remaining */}
        <div
          className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between relative overflow-hidden ${
            isOverBudget
              ? 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Trip Budget
            </span>
            <button
              onClick={onOpenTripModal}
              title="Edit Budget & Trip"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Edit
            </button>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(trip.budget, trip.currency)}
            </div>
            <div className="text-xs mt-1 font-medium flex items-center gap-1">
              {isOverBudget ? (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Over by {formatCurrency(Math.abs(remainingBudget), trip.currency)}
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(remainingBudget, trip.currency)} remaining ({Math.round(100 - percentUsed)}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Daily Average */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Daily Average
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(avgDaily, trip.currency)}
              <span className="text-xs font-medium text-slate-400 ml-1">/ day</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Based on {tripDays} days planned
            </div>
          </div>
        </div>

        {/* Travelers & Duration */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Travelers & Dates
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{trip.travelers.join(', ')}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {trip.startDate} ➔ {trip.endDate}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Progress Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Budget Utilization: {Math.round(percentUsed)}%
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {formatCurrency(totalSpent, trip.currency)} of {formatCurrency(trip.budget, trip.currency)}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              percentUsed > 100
                ? 'bg-rose-500'
                : percentUsed > 80
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            }`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>
      </div>

      {/* Category breakdown bar pills */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5" />
            Spending by Category
          </h3>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => onSelectCategory('all')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Reset filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {(Object.keys(CATEGORIES) as ExpenseCategory[]).map((catKey) => {
            const config = CATEGORIES[catKey];
            const amount = categorySpending[catKey] || 0;
            const isFilterActive = selectedCategory === catKey;

            return (
              <button
                key={catKey}
                onClick={() => onSelectCategory(isFilterActive ? 'all' : catKey)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isFilterActive
                    ? `${config.bgLight} ${config.borderColor} ring-2 ring-blue-500 shadow-xs`
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                  >
                    <CategoryIcon category={catKey} className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {config.name}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatCurrency(amount, trip.currency)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {totalSpent > 0 ? `${Math.round((amount / totalSpent) * 100)}%` : '0%'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
