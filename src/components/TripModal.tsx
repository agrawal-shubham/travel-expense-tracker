import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, MapPin, Users, Plus, Check } from 'lucide-react';
import { Trip } from '../types';
import { CURRENCIES } from '../utils/constants';

interface TripModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onSave: (trip: Trip) => void;
  editingTrip?: Trip | null;
}

export const TripModal: React.FC<TripModalProps> = ({
  isOpen,
  userId,
  onClose,
  onSave,
  editingTrip,
}) => {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [travelers, setTravelers] = useState<string[]>(['Me']);
  const [newTraveler, setNewTraveler] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTrip) {
      setName(editingTrip.name);
      setDestination(editingTrip.destination);
      setStartDate(editingTrip.startDate);
      setEndDate(editingTrip.endDate);
      setBudget(editingTrip.budget.toString());
      setCurrency(editingTrip.currency);
      setTravelers(editingTrip.travelers || ['Me']);
      setNotes(editingTrip.notes || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      setName('');
      setDestination('');
      setStartDate(today);
      setEndDate(future);
      setBudget('2500');
      setCurrency('USD');
      setTravelers(['Me']);
      setNotes('');
      setError('');
    }
  }, [editingTrip, isOpen]);

  if (!isOpen) return null;

  const handleAddTraveler = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTraveler.trim() && !travelers.includes(newTraveler.trim())) {
      setTravelers([...travelers, newTraveler.trim()]);
      setNewTraveler('');
    }
  };

  const handleRemoveTraveler = (trav: string) => {
    if (travelers.length <= 1) return;
    setTravelers(travelers.filter((t) => t !== trav));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for this trip.');
      return;
    }
    const numBudget = parseFloat(budget) || 0;
    if (numBudget <= 0) {
      setError('Please provide a budget greater than 0.');
      return;
    }

    const payload: Trip = {
      id: editingTrip ? editingTrip.id : `trip-${Date.now()}`,
      userId: editingTrip ? editingTrip.userId : userId,
      name: name.trim(),
      destination: destination.trim() || name.trim(),
      startDate,
      endDate,
      budget: numBudget,
      currency,
      travelers: travelers.length > 0 ? travelers : ['Me'],
      notes: notes.trim(),
      categoryBudgets: editingTrip?.categoryBudgets,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {editingTrip ? 'Edit Trip Settings' : 'Create New Trip'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Trip Name & Destination */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Trip Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Summer Vacation in Switzerland 🏔️"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Destination
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Zurich, Interlaken & Zermatt"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Budget & Base Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Total Budget Target *
              </label>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="2500"
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Trip Base Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(CURRENCIES).map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} ({curr.symbol}) - {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Travelers List */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Trip Travelers
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {travelers.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg"
                >
                  <Users className="w-3 h-3 text-slate-400" />
                  {t}
                  {travelers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTraveler(t)}
                      className="text-slate-400 hover:text-rose-500 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add traveler name..."
                value={newTraveler}
                onChange={(e) => setNewTraveler(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newTraveler.trim()) {
                      setTravelers([...travelers, newTraveler.trim()]);
                      setNewTraveler('');
                    }
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newTraveler.trim()) {
                    setTravelers([...travelers, newTraveler.trim()]);
                    setNewTraveler('');
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Trip Goals / Itinerary Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Flight booked on Swiss Air, stay at Interlaken..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingTrip ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
