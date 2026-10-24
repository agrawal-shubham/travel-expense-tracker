/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trip, Expense, ExpenseCategory, UserProfile } from './types';
import { INITIAL_TRIPS, INITIAL_EXPENSES, SAMPLE_TRIP, SAMPLE_EXPENSES } from './data/mockData';
import { Header } from './components/Header';
import { TripOverview } from './components/TripOverview';
import { ExpenseList } from './components/ExpenseList';
import { AnalyticsView } from './components/AnalyticsView';
import { AddExpenseModal } from './components/AddExpenseModal';
import { ExpenseDetailModal } from './components/ExpenseDetailModal';
import { TripModal } from './components/TripModal';
import { ExportModal } from './components/ExportModal';
import { AuthModal } from './components/AuthModal';
import { auth, signOut } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  subscribeUserTrips,
  subscribeUserExpenses,
  addOrUpdateTrip,
  removeTrip,
  addOrUpdateExpense,
  removeExpense,
} from './services/firestoreService';
import { convertAmount } from './utils/constants';
import { Check, Undo2, LogIn, Plus, Sparkles } from 'lucide-react';

const STORAGE_KEYS = {
  GUEST_TRIPS: 'wanderspend_guest_trips_v2',
  GUEST_EXPENSES: 'wanderspend_guest_expenses_v2',
  ACTIVE_TRIP_ID: 'wanderspend_active_trip_id_v2',
};

export default function App() {
  // Auth state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Trips & Expenses
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string>('');
  const [expenses, setExpenses] = useState<Expense[]>([]);

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

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore when user is authenticated, or load guest cache when not
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // Subscribe to user's Cloud Firestore trips
      const unsubTrips = subscribeUserTrips(user.uid, (firestoreTrips) => {
        setTrips(firestoreTrips);
        if (firestoreTrips.length > 0) {
          setActiveTripId((prev) => {
            const stillExists = firestoreTrips.some((t) => t.id === prev);
            return stillExists ? prev : firestoreTrips[0].id;
          });
        } else {
          setActiveTripId('');
        }
      });

      // Subscribe to user's Cloud Firestore expenses
      const unsubExpenses = subscribeUserExpenses(user.uid, (firestoreExpenses) => {
        setExpenses(firestoreExpenses);
      });

      return () => {
        unsubTrips();
        unsubExpenses();
      };
    } else {
      // Guest mode - Clean slate by default or restore guest storage
      try {
        const savedTrips = localStorage.getItem(STORAGE_KEYS.GUEST_TRIPS);
        const savedExpenses = localStorage.getItem(STORAGE_KEYS.GUEST_EXPENSES);
        const savedActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_TRIP_ID);

        const loadedTrips = savedTrips ? JSON.parse(savedTrips) : INITIAL_TRIPS;
        const loadedExpenses = savedExpenses ? JSON.parse(savedExpenses) : INITIAL_EXPENSES;

        setTrips(loadedTrips);
        setExpenses(loadedExpenses);
        if (loadedTrips.length > 0) {
          setActiveTripId(savedActive || loadedTrips[0].id);
        } else {
          setActiveTripId('');
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [user, authLoading]);

  // Persist guest data
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEYS.GUEST_TRIPS, JSON.stringify(trips));
      localStorage.setItem(STORAGE_KEYS.GUEST_EXPENSES, JSON.stringify(expenses));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TRIP_ID, activeTripId);
    }
  }, [trips, expenses, activeTripId, user]);

  // Active Trip
  const activeTrip = trips.find((t) => t.id === activeTripId) || (trips.length > 0 ? trips[0] : null);

  // Active Trip Expenses
  const tripExpenses = activeTrip ? expenses.filter((e) => e.tripId === activeTrip.id) : [];

  const showToast = (msg: string, hasUndo: boolean = false) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Handlers for Expenses
  const handleSaveExpense = async (expenseData: any) => {
    const currentUserId = user?.uid || 'guest';
    const isEdit = !!expenseData.id;

    const payload: Expense = {
      ...expenseData,
      userId: currentUserId,
      id: expenseData.id || `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: expenseData.createdAt || Date.now(),
    };

    if (user) {
      try {
        await addOrUpdateExpense(payload);
        showToast(isEdit ? `Updated "${payload.title}"` : `Added "${payload.title}"`);
      } catch (err) {
        console.error(err);
      }
    } else {
      // Local Guest
      if (isEdit) {
        setExpenses((prev) => prev.map((e) => (e.id === payload.id ? payload : e)));
      } else {
        setExpenses((prev) => [payload, ...prev]);
      }
      showToast(isEdit ? `Updated "${payload.title}"` : `Added "${payload.title}"`);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const toDelete = expenses.find((e) => e.id === id);
    if (!toDelete) return;

    setDeletedExpenseCache(toDelete);

    if (user) {
      try {
        await removeExpense(id);
        showToast(`Removed "${toDelete.title}"`, true);
      } catch (err) {
        console.error(err);
      }
    } else {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showToast(`Removed "${toDelete.title}"`, true);
    }
  };

  const handleUndoDelete = async () => {
    if (deletedExpenseCache) {
      if (user) {
        await addOrUpdateExpense(deletedExpenseCache);
      } else {
        setExpenses((prev) => [deletedExpenseCache, ...prev]);
      }
      showToast(`Restored "${deletedExpenseCache.title}"`);
      setDeletedExpenseCache(null);
    }
  };

  // Handlers for Trips
  const handleSaveTrip = async (tripData: Trip) => {
    const currentUserId = user?.uid || 'guest';
    const exists = trips.some((t) => t.id === tripData.id);

    const payload: Trip = {
      ...tripData,
      userId: currentUserId,
    };

    if (user) {
      try {
        await addOrUpdateTrip(payload);
        setActiveTripId(payload.id);

        // Recalculate converted amounts for expenses in this trip if currency changed
        if (activeTrip && tripData.currency !== activeTrip.currency) {
          const associated = expenses.filter((e) => e.tripId === payload.id);
          for (const exp of associated) {
            await addOrUpdateExpense({
              ...exp,
              convertedAmount: convertAmount(exp.amount, exp.currency, payload.currency),
            });
          }
        }

        showToast(exists ? `Updated "${payload.name}"` : `Created "${payload.name}"`);
      } catch (err) {
        console.error(err);
      }
    } else {
      // Local Guest
      if (exists) {
        setTrips((prev) => prev.map((t) => (t.id === payload.id ? payload : t)));
        if (activeTrip && payload.currency !== activeTrip.currency) {
          setExpenses((prev) =>
            prev.map((e) =>
              e.tripId === payload.id
                ? { ...e, convertedAmount: convertAmount(e.amount, e.currency, payload.currency) }
                : e
            )
          );
        }
      } else {
        setTrips((prev) => [...prev, payload]);
        setActiveTripId(payload.id);
      }
      showToast(exists ? `Updated "${payload.name}"` : `Created "${payload.name}"`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('Signed out successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  // Optional button for users who want to see a demonstration
  const handleLoadDemoData = async () => {
    const currentUserId = user?.uid || 'guest';
    const demoTrip = { ...SAMPLE_TRIP, id: `trip-demo-${Date.now()}`, userId: currentUserId };
    const demoExpenses = SAMPLE_EXPENSES.map((e) => ({
      ...e,
      id: `exp-demo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tripId: demoTrip.id,
      userId: currentUserId,
    }));

    if (user) {
      await addOrUpdateTrip(demoTrip);
      for (const exp of demoExpenses) {
        await addOrUpdateExpense(exp);
      }
    } else {
      setTrips((prev) => [demoTrip, ...prev]);
      setExpenses((prev) => [...demoExpenses, ...prev]);
      setActiveTripId(demoTrip.id);
    }
    showToast('Demo travel trip loaded.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        trips={trips}
        activeTrip={activeTrip}
        user={user}
        onSelectTrip={(id) => {
          setActiveTripId(id);
          setSelectedCategory('all');
        }}
        onNewTrip={() => {
          setEditingTrip(null);
          setIsTripModalOpen(true);
        }}
        onEditTrip={() => {
          if (activeTrip) {
            setEditingTrip(activeTrip);
            setIsTripModalOpen(true);
          }
        }}
        onAddExpense={() => {
          if (!activeTrip) {
            setIsTripModalOpen(true);
            return;
          }
          setEditingExpense(null);
          setIsAddExpenseOpen(true);
        }}
        onExport={() => setIsExportOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Auth prompt banner if not logged in */}
        {!user && !authLoading && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-200/60 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sync & Secure Your Travel Expenses
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Login or create an account with Firebase to sync your trips and expenses across all your devices.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition shrink-0"
            >
              Sign In / Register
            </button>
          </div>
        )}

        {/* Trip Overview Cards & Category Filters */}
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
          onCreateFirstTrip={() => {
            setEditingTrip(null);
            setIsTripModalOpen(true);
          }}
        />

        {/* Expenses List & Tracking */}
        {activeTrip && currentTab === 'expenses' && (
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

        {/* Analytics & Reports */}
        {activeTrip && currentTab === 'analytics' && (
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
            WanderSpend &bull; Real-time Firebase sync for flights, transfers, hotels, dining, and activities.
          </p>
          <div className="flex items-center gap-4">
            {trips.length === 0 && (
              <button
                onClick={handleLoadDemoData}
                className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Load Sample Trip Demo
              </button>
            )}
            {activeTrip && (
              <button
                onClick={() => setIsExportOpen(true)}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Export Summary
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      {activeTrip && (
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          userId={user?.uid || 'guest'}
          onClose={() => {
            setIsAddExpenseOpen(false);
            setEditingExpense(null);
          }}
          onSave={handleSaveExpense}
          trip={activeTrip}
          editingExpense={editingExpense}
        />
      )}

      {activeTrip && (
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
      )}

      <TripModal
        isOpen={isTripModalOpen}
        userId={user?.uid || 'guest'}
        onClose={() => {
          setIsTripModalOpen(false);
          setEditingTrip(null);
        }}
        onSave={handleSaveTrip}
        editingTrip={editingTrip}
      />

      {activeTrip && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          trip={activeTrip}
          expenses={tripExpenses}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Toast Notification with Undo */}
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
