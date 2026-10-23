import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Calendar,
  Layers,
  FileSpreadsheet,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod, Trip } from '../types';
import { CATEGORIES, PAYMENT_METHODS, formatCurrency } from '../utils/constants';
import { ExpenseCard } from './ExpenseCard';
import { CategoryIcon } from './CategoryIcon';

interface ExpenseListProps {
  expenses: Expense[];
  trip: Trip;
  selectedCategory: ExpenseCategory | 'all';
  onSelectCategory: (category: ExpenseCategory | 'all') => void;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onViewDetails: (expense: Expense) => void;
}

type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
type GroupOption = 'date' | 'category' | 'none';

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  trip,
  selectedCategory,
  onSelectCategory,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onViewDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'all'>('all');
  const [travelerFilter, setTravelerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [groupBy, setGroupBy] = useState<GroupOption>('date');

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        // Category filter
        if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
          return false;
        }
        // Payment filter
        if (paymentFilter !== 'all' && exp.paymentMethod !== paymentFilter) {
          return false;
        }
        // Traveler filter
        if (travelerFilter !== 'all') {
          const isPayer = exp.paidBy === travelerFilter;
          const isSplitter = exp.splitWith?.includes(travelerFilter);
          if (!isPayer && !isSplitter) return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = exp.title.toLowerCase().includes(q);
          const matchLoc = exp.location?.toLowerCase().includes(q);
          const matchNotes = exp.notes?.toLowerCase().includes(q);
          const matchCategory = exp.category.toLowerCase().includes(q);
          const matchPaidBy = exp.paidBy.toLowerCase().includes(q);
          if (!matchTitle && !matchLoc && !matchNotes && !matchCategory && !matchPaidBy) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
        }
        if (sortBy === 'date_asc') {
          return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
        }
        if (sortBy === 'amount_desc') {
          return b.convertedAmount - a.convertedAmount;
        }
        if (sortBy === 'amount_asc') {
          return a.convertedAmount - b.convertedAmount;
        }
        return 0;
      });
  }, [expenses, selectedCategory, paymentFilter, travelerFilter, searchQuery, sortBy]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.convertedAmount, 0);
  }, [filteredExpenses]);

  // Grouping helper
  const groupedExpenses = useMemo(() => {
    if (groupBy === 'none') {
      return [{ key: 'All Expenses', items: filteredExpenses, subtotal: filteredTotal }];
    }

    if (groupBy === 'date') {
      const groups: Record<string, Expense[]> = {};
      filteredExpenses.forEach((exp) => {
        const d = exp.date;
        if (!groups[d]) groups[d] = [];
        groups[d].push(exp);
      });

      return Object.keys(groups).map((dateKey) => {
        const items = groups[dateKey];
        const subtotal = items.reduce((s, i) => s + i.convertedAmount, 0);
        return {
          key: dateKey,
          items,
          subtotal,
        };
      });
    }

    if (groupBy === 'category') {
      const groups: Record<string, Expense[]> = {};
      filteredExpenses.forEach((exp) => {
        const cat = exp.category;
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(exp);
      });

      return Object.keys(groups).map((catKey) => {
        const items = groups[catKey];
        const subtotal = items.reduce((s, i) => s + i.convertedAmount, 0);
        const name = CATEGORIES[catKey as ExpenseCategory]?.name || catKey;
        return {
          key: name,
          items,
          subtotal,
        };
      });
    }

    return [];
  }, [filteredExpenses, groupBy, filteredTotal]);

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        {/* Row 1: Search & Add button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search expenses by title, location, notes, payer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={onAddExpense}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 text-sm transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Row 2: Secondary Filters & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Payment Method filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all">All Payment Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.label}
                </option>
              ))}
            </select>

            {/* Traveler filter */}
            {trip.travelers.length > 1 && (
              <select
                value={travelerFilter}
                onChange={(e) => setTravelerFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="all">All Travelers</option>
                {trip.travelers.map((tr) => (
                  <option key={tr} value={tr}>
                    Traveler: {tr}
                  </option>
                ))}
              </select>
            )}

            {/* Sort order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>

          {/* Group View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <span className="text-[11px] text-slate-400 px-1 font-medium">Group by:</span>
            <button
              onClick={() => setGroupBy('date')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition ${
                groupBy === 'date'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Date
            </button>
            <button
              onClick={() => setGroupBy('category')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition ${
                groupBy === 'category'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Category
            </button>
            <button
              onClick={() => setGroupBy('none')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition ${
                groupBy === 'none'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Filter status summary bar */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-500 dark:text-slate-400">
        <div>
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredExpenses.length}</span>{' '}
          {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
          {selectedCategory !== 'all' && (
            <span>
              {' '}
              in <span className="font-semibold">{CATEGORIES[selectedCategory]?.name}</span>
            </span>
          )}
        </div>
        <div className="font-semibold text-slate-800 dark:text-slate-200">
          Subtotal: {formatCurrency(filteredTotal, trip.currency)}
        </div>
      </div>

      {/* Expenses Groups / List */}
      {filteredExpenses.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No expenses found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all' || paymentFilter !== 'all'
              ? 'Try adjusting your search criteria or resetting the category filter.'
              : 'Start logging your flights, hotels, food, and activities to track your spending!'}
          </p>
          <div className="pt-2">
            <button
              onClick={onAddExpense}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              Add First Expense
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedExpenses.map((group) => (
            <div key={group.key} className="space-y-2.5">
              {groupBy !== 'none' && (
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {group.key}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {group.items.length} items
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatCurrency(group.subtotal, trip.currency)}
                  </span>
                </div>
              )}

              <div className="space-y-2.5">
                {group.items.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    trip={trip}
                    onEdit={onEditExpense}
                    onDelete={onDeleteExpense}
                    onViewDetails={onViewDetails}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
