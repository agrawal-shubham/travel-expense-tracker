import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, MapPin, User, FileText, Check, AlertCircle } from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod, Trip } from '../types';
import { CATEGORIES, CURRENCIES, PAYMENT_METHODS, convertAmount, formatCurrency } from '../utils/constants';
import { CategoryIcon, PaymentIcon } from './CategoryIcon';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'> | Expense) => void;
  trip: Trip;
  editingExpense?: Expense | null;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  trip,
  editingExpense,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>(trip.currency);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState<string>('12:00');
  const [location, setLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [paidBy, setPaidBy] = useState<string>(trip.travelers[0] || 'Me');
  const [splitWith, setSplitWith] = useState<string[]>(trip.travelers || []);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingExpense) {
      setCategory(editingExpense.category);
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setCurrency(editingExpense.currency);
      setDate(editingExpense.date);
      setTime(editingExpense.time || '12:00');
      setLocation(editingExpense.location || '');
      setPaymentMethod(editingExpense.paymentMethod);
      setPaidBy(editingExpense.paidBy);
      setSplitWith(editingExpense.splitWith || []);
      setNotes(editingExpense.notes || '');
    } else {
      // Default reset
      setCategory('food');
      setTitle('');
      setAmount('');
      setCurrency(trip.currency);
      setDate(new Date().toISOString().split('T')[0]);
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setLocation('');
      setPaymentMethod('credit_card');
      setPaidBy(trip.travelers[0] || 'Me');
      setSplitWith(trip.travelers || []);
      setNotes('');
      setError('');
    }
  }, [editingExpense, isOpen, trip]);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amount) || 0;
  const converted = convertAmount(parsedAmount, currency, trip.currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title or description for the expense.');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    const expensePayload = {
      tripId: trip.id,
      title: title.trim(),
      category,
      amount: parsedAmount,
      currency,
      convertedAmount: converted,
      date,
      time,
      location: location.trim(),
      paymentMethod,
      paidBy,
      splitWith,
      notes: notes.trim(),
      ...(editingExpense ? { id: editingExpense.id, createdAt: editingExpense.createdAt } : {}),
    };

    onSave(expensePayload as any);
    onClose();
  };

  const handleSuggestionClick = (example: string) => {
    setTitle(example);
  };

  const toggleSplitUser = (user: string) => {
    if (splitWith.includes(user)) {
      setSplitWith(splitWith.filter((u) => u !== user));
    } else {
      setSplitWith([...splitWith, user]);
    }
  };

  const currentCategoryConfig = CATEGORIES[category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trip: <span className="font-semibold text-slate-700 dark:text-slate-300">{trip.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Expense Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(CATEGORIES) as ExpenseCategory[]).map((catKey) => {
                const config = CATEGORIES[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      setCategory(catKey);
                      setError('');
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${config.bgLight} ${config.borderColor} ring-2 ring-offset-1 ring-blue-500 font-semibold shadow-xs`
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${config.color}20`, color: config.color }}
                    >
                      <CategoryIcon category={catKey} className="w-4 h-4" />
                    </div>
                    <span className="text-xs truncate">{config.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Quick Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Expense Title / Description *
              </label>
              <span className="text-[11px] text-slate-400">e.g. Flight ticket, taxi, dinner</span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g., Tokyo Narita Airport Taxi or Ramen Dinner"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Quick Suggestions */}
            {currentCategoryConfig.placeholderExamples && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 mr-1">Quick ideas:</span>
                {currentCategoryConfig.placeholderExamples.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(ex)}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-300 text-slate-600 dark:text-slate-400 transition border border-transparent hover:border-blue-200"
                  >
                    + {ex}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-7">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Amount Paid *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-3 text-slate-400 font-bold">
                  {CURRENCIES[currency]?.symbol || '$'}
                </span>
              </div>
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(CURRENCIES).map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} - {curr.name} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Converted preview if different currency */}
          {currency !== trip.currency && parsedAmount > 0 && (
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs">
              <span className="text-blue-800 dark:text-blue-300">
                Converted to Trip Currency ({trip.currency}):
              </span>
              <span className="font-bold text-blue-900 dark:text-blue-200 text-sm">
                ≈ {formatCurrency(converted, trip.currency)}
              </span>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Time (Optional)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Location & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Location / Merchant
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Narita Terminal 1, Shibuya"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Travelers / Paid By & Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {trip.travelers.map((tr) => (
                  <option key={tr} value={tr}>
                    {tr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Split With
              </label>
              <div className="flex flex-wrap gap-1.5">
                {trip.travelers.map((tr) => {
                  const isChecked = splitWith.includes(tr);
                  return (
                    <button
                      key={tr}
                      type="button"
                      onClick={() => toggleSplitUser(tr)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition flex items-center gap-1 ${
                        isChecked
                          ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 font-medium'
                          : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                      {tr}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Additional Notes / Confirmation #
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Booking ref #AF8291, seat 14A, includes breakfast"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingExpense ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
