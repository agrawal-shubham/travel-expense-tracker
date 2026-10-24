import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Share2,
  Calendar,
  ChevronDown,
  PieChart,
  List,
  MapPin,
  Settings,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { Trip, UserProfile } from '../types';

interface HeaderProps {
  trips: Trip[];
  activeTrip: Trip | null;
  user: UserProfile | null;
  onSelectTrip: (tripId: string) => void;
  onNewTrip: () => void;
  onEditTrip: () => void;
  onAddExpense: () => void;
  onExport: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  currentTab: 'expenses' | 'analytics';
  onChangeTab: (tab: 'expenses' | 'analytics') => void;
}

export const Header: React.FC<HeaderProps> = ({
  trips,
  activeTrip,
  user,
  onSelectTrip,
  onNewTrip,
  onEditTrip,
  onAddExpense,
  onExport,
  onOpenAuth,
  onSignOut,
  currentTab,
  onChangeTab,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                  Wander<span className="text-blue-600">Spend</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  Cloud Sync
                </span>
              </div>
            </div>
          </div>

          {/* Trip Selector & Settings */}
          {trips.length > 0 && activeTrip ? (
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <select
                  value={activeTrip.id}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      onNewTrip();
                    } else {
                      onSelectTrip(e.target.value);
                    }
                  }}
                  className="pl-3 pr-7 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[170px] sm:max-w-[260px] truncate"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                  <option value="__new__">+ Create New Trip...</option>
                </select>
              </div>

              <button
                onClick={onEditTrip}
                title="Trip settings & budget"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onNewTrip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:bg-blue-100 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Trip</span>
            </button>
          )}

          {/* Right Section: Tabs, Add Expense, Export, User Auth */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Switcher Tabs (Desktop) */}
            {activeTrip && (
              <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => onChangeTab('expenses')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'expenses'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  Expenses
                </button>
                <button
                  onClick={() => onChangeTab('analytics')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'analytics'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <PieChart className="w-3.5 h-3.5" />
                  Analytics
                </button>
              </div>
            )}

            {activeTrip && (
              <button
                onClick={onExport}
                title="Export expenses"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Export</span>
              </button>
            )}

            {activeTrip && (
              <button
                onClick={onAddExpense}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            )}

            {/* Auth Profile / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[100px] truncate hidden sm:inline-block">
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                  </span>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-blue-500"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.displayName || 'Traveler'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onSignOut();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold text-xs sm:text-sm rounded-xl transition shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Login / Register</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile View Toggle Bar */}
        {activeTrip && (
          <div className="lg:hidden flex items-center justify-between pb-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg w-full">
              <button
                onClick={() => onChangeTab('expenses')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition ${
                  currentTab === 'expenses'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Expenses
              </button>
              <button
                onClick={() => onChangeTab('analytics')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition ${
                  currentTab === 'analytics'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                Analytics
              </button>
            </div>
            <button
              onClick={onExport}
              className="ml-2 p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg bg-slate-100 dark:bg-slate-800"
              title="Export"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
