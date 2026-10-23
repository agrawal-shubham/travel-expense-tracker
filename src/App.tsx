/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trip, Expense, ExpenseCategory } from './types';
import { INITIAL_TRIPS, INITIAL_EXPENSES } from './data/mockData';
import { Header } from './components/Header';
import { TripOverview } from './components/TripOverview';
import { ExpenseList } from './components/ExpenseList';
import { AnalyticsView } from './components/AnalyticsView';
import { AddExpenseModal } from './components/AddExpenseModal';
import { ExpenseDetailModal } from './components/ExpenseDetailModal';
import { TripModal } from './components/TripModal';
import { ExportModal } from './components/ExportModal';
import { convertAmount, formatCurrency } from './utils/constants';
import { AlertCircle, Check, Undo2, RotateCcw } from 'lucide-react';

const STORAGE_KEYS = {
  TRIPS: 'wanderspend_trips_v1',
  ACTIVE_TRIP_ID: 'wanderspend_active_trip_id_v1',
  EXPENSES: 'wanderspend_expenses_v1',
};

export default function App() {
  // Trips state
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRIPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRIPS;
  });

  const [activeTripId, setActiveTripId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TRIP_ID);
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRIPS[0]?.id || '';
  });

  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EXPENSES;
  });

  // UI state
  const [currentTab, setCurrentTab] = useState<'expenses' | 'analytics'>('expenses');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Undo Toast state
  const [deletedExpenseCache, setDeletedExpenseCache] = useState<Expense | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TRIP_ID, activeTripId);
  }, [activeTripId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  // Active Trip
  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0] || INITIAL_TRIPS[0];

  // Active Trip Expenses
  const tripExpenses = expenses.filter((e) => e.tripId === activeTrip.id);

  // Handlers for Expenses
  const handleSaveExpense = (expenseData: any) => {
    if (expenseData.id) {
      // Editing
      setExpenses((prev) =>
        prev.map((e) => (e.id === expenseData.id ? { ...e, ...expenseData } : e))
      );
      showToast(`Updated "${expenseData.title}"`);
    } else {
      // Adding new
      const newExp: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: Date.now(),
      };
      setExpenses((prev) => [newExp, ...prev]);
      showToast(`Added "${newExp.title}"`);
    }
  };

  const handleDeleteExpense = (id: string) => {
    const toDelete = expenses.find((e) => e.id === id);
    if (!toDelete) return;

    setDeletedExpenseCache(toDelete);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast(`Removed "${toDelete.title}"`, true);
  };

  const handleUndoDelete = () => {
    if (deletedExpenseCache) {
      setExpenses((prev) => [deletedExpenseCache, ...prev]);
      showToast(`Restored "${deletedExpenseCache.title}"`);
      setDeletedExpenseCache(null);
    }
  };

  const showToast = (msg: string, hasUndo: boolean = false) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Handlers for Trips
  const handleSaveTrip = (tripData: Trip) => {
    const exists = trips.some((t) => t.id === tripData.id);
    if (exists) {
      setTrips((prev) => prev.map((t) => (t.id === tripData.id ? tripData : t)));
      // Recalculate converted amounts for expenses in this trip if currency changed
      if (tripData.currency !== activeTrip.currency) {
        setExpenses((prev) =>
          prev.map((e) => {
            if (e.tripId === tripData.id) {
              return {
                ...e,
                convertedAmount: convertAmount(e.amount, e.currency, tripData.currency),
              };
            }
            return e;
          })
        );
      }
      showToast(`Updated "${tripData.name}" settings`);
    } else {
      setTrips((prev) => [...prev, tripData]);
      setActiveTripId(tripData.id);
      showToast(`Created new trip "${tripData.name}"`);
    }
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset all trip and expense data back to original sample data?')) {
      setTrips(INITIAL_TRIPS);
      setActiveTripId(INITIAL_TRIPS[0].id);
      setExpenses(INITIAL_EXPENSES);
      showToast('Sample trip data restored!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        trips={trips}
        activeTrip={activeTrip}
        onSelectTrip={(id) => {
          setActiveTripId(id);
          setSelectedCategory('all');
        }}
        onNewTrip={() => {
          setEditingTrip(null);
          setIsTripModalOpen(true);
        }}
        onEditTrip={() => {
          setEditingTrip(activeTrip);
          setIsTripModalOpen(true);
        }}
        onAddExpense={() => {
          setEditingExpense(null);
          setIsAddExpenseOpen(true);
        }}
        onExport={() => setIsExportOpen(true)}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Trip Overview Cards & Quick Category Filters */}
        <TripOverview
          trip={activeTrip}
          expenses={tripExpenses}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            if (currentTab !== 'expenses') setCurrentTab('expenses');
          }}
          onOpenTripModal={() => {
            setEditingTrip(activeTrip);
            setIsTripModalOpen(true);
          }}
        />

        {/* Tab 1: Expenses List & Tracking */}
        {currentTab === 'expenses' && (
          <ExpenseList
            expenses={tripExpenses}
            trip={activeTrip}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onAddExpense={() => {
              setEditingExpense(null);
              setIsAddExpenseOpen(true);
            }}
            onEditExpense={(exp) => {
              setEditingExpense(exp);
              setIsAddExpenseOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
            onViewDetails={(exp) => setViewingExpense(exp)}
          />
        )}

        {/* Tab 2: Analytics & Reports */}
        {currentTab === 'analytics' && (
          <AnalyticsView
            trip={activeTrip}
            expenses={tripExpenses}
            onSelectCategoryFilter={(cat) => {
              setSelectedCategory(cat);
              setCurrentTab('expenses');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            WanderSpend &bull; Track flights, transfers, hotels, food, and activities effortlessly.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetSampleData}
              className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>
            <button
              onClick={() => setIsExportOpen(true)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Export Report
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        trip={activeTrip}
        editingExpense={editingExpense}
      />

      <ExpenseDetailModal
        isOpen={!!viewingExpense}
        onClose={() => setViewingExpense(null)}
        expense={viewingExpense}
        trip={activeTrip}
        onEdit={(exp) => {
          setEditingExpense(exp);
          setIsAddExpenseOpen(true);
        }}
        onDelete={handleDeleteExpense}
      />

      <TripModal
        isOpen={isTripModalOpen}
        onClose={() => {
          setIsTripModalOpen(false);
          setEditingTrip(null);
        }}
        onSave={handleSaveTrip}
        editingTrip={editingTrip}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        trip={activeTrip}
        expenses={tripExpenses}
      />

      {/* Action Notification Toast with Undo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 border border-slate-800">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          {deletedExpenseCache && (
            <button
              onClick={handleUndoDelete}
              className="ml-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition text-xs"
            >
              <Undo2 className="w-3 h-3" />
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
