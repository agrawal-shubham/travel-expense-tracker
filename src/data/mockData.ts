import { Expense, Trip } from '../types';

// Clean slate: no default preloaded expenses
export const INITIAL_TRIPS: Trip[] = [];
export const INITIAL_EXPENSES: Expense[] = [];

// Optional sample template available only if user clicks "Load Sample Demo"
export const SAMPLE_TRIP: Trip = {
  id: 'trip-sample-demo',
  userId: 'demo',
  name: 'Japan Vacation 🍁',
  destination: 'Tokyo & Kyoto, Japan',
  startDate: '2026-10-15',
  endDate: '2026-10-25',
  budget: 3500,
  currency: 'USD',
  travelers: ['Me'],
  notes: 'Tokyo exploration, temples, bullet train, and culinary experiences.',
};

export const SAMPLE_EXPENSES: Expense[] = [
  {
    id: 'exp-demo-1',
    userId: 'demo',
    tripId: 'trip-sample-demo',
    title: 'Roundtrip Flights',
    category: 'flight',
    amount: 1100,
    currency: 'USD',
    convertedAmount: 1100,
    date: '2026-10-15',
    time: '09:00',
    location: 'Airport',
    paymentMethod: 'credit_card',
    paidBy: 'Me',
    splitWith: ['Me'],
    notes: 'Direct flights booked in advance',
    createdAt: Date.now() - 500000,
  },
  {
    id: 'exp-demo-2',
    userId: 'demo',
    tripId: 'trip-sample-demo',
    title: 'Shinkansen Bullet Train Ticket',
    category: 'transfer',
    amount: 14000,
    currency: 'JPY',
    convertedAmount: 90.61,
    date: '2026-10-17',
    time: '10:30',
    location: 'Tokyo Station',
    paymentMethod: 'credit_card',
    paidBy: 'Me',
    splitWith: ['Me'],
    notes: 'Reserved seats to Kyoto',
    createdAt: Date.now() - 300000,
  },
];
