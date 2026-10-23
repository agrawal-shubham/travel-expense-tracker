import React from 'react';
import {
  Compass,
  Plus,
  Share2,
  Calendar,
  ChevronDown,
  Moon,
  Sun,
  PieChart,
  List,
  MapPin,
  Settings,
} from 'lucide-react';
import { Trip } from '../types';

interface HeaderProps {
  trips: Trip[];
  activeTrip: Trip;
  onSelectTrip: (tripId: string) => void;
  onNewTrip: () => void;
  onEditTrip: () => void;
  onAddExpense: () => void;
  onExport: () => void;
  currentTab: 'expenses' | 'analytics';
  onChangeTab: (tab: 'expenses' | 'analytics') => void;
}

export const Header: React.FC<HeaderProps> = ({
  trips,
  activeTrip,
  onSelectTrip,
  onNewTrip,
  onEditTrip,
  onAddExpense,
  onExport,
  currentTab,
  onChangeTab,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
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
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  Travel Tracker
                </span>
              </div>
            </div>
          </div>

          {/* Trip Selector & Settings */}
          <div className="flex items-center gap-2">
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
                className="pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[200px] sm:max-w-[280px] truncate"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.destination})
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

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Switcher Tabs (Desktop) */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
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

            <button
              onClick={onExport}
              title="Export expenses to CSV or text"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            <button
              onClick={onAddExpense}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Mobile View Toggle Bar */}
        <div className="md:hidden flex items-center justify-between pb-3 pt-1 border-t border-slate-100 dark:border-slate-800">
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
      </div>
    </header>
  );
};
