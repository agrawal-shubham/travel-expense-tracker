import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Trip, Expense } from '../types';

export function subscribeUserTrips(
  userId: string,
  onUpdate: (trips: Trip[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const tripsRef = collection(db, 'trips');
  const q = query(tripsRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Trip[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Trip);
      });
      // Sort by startDate descending
      items.sort((a, b) => b.startDate.localeCompare(a.startDate));
      onUpdate(items);
    },
    (err) => {
      console.error('Trips onSnapshot error:', err);
      handleFirestoreError(err, OperationType.GET, 'trips');
      if (onError) onError(err);
    }
  );
}

export function subscribeUserExpenses(
  userId: string,
  onUpdate: (expenses: Expense[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const expensesRef = collection(db, 'expenses');
  const q = query(expensesRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Expense[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Expense);
      });
      // Sort by date descending
      items.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
      onUpdate(items);
    },
    (err) => {
      console.error('Expenses onSnapshot error:', err);
      handleFirestoreError(err, OperationType.GET, 'expenses');
      if (onError) onError(err);
    }
  );
}

export async function addOrUpdateTrip(trip: Trip): Promise<void> {
  const path = `trips/${trip.id}`;
  try {
    const docRef = doc(db, 'trips', trip.id);
    await setDoc(docRef, trip, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeTrip(tripId: string, associatedExpenses: Expense[]): Promise<void> {
  const path = `trips/${tripId}`;
  try {
    const docRef = doc(db, 'trips', tripId);
    await deleteDoc(docRef);

    // Delete associated expenses
    for (const exp of associatedExpenses) {
      if (exp.tripId === tripId) {
        await deleteDoc(doc(db, 'expenses', exp.id));
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function addOrUpdateExpense(expense: Expense): Promise<void> {
  const path = `expenses/${expense.id}`;
  try {
    const docRef = doc(db, 'expenses', expense.id);
    await setDoc(docRef, expense, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeExpense(expenseId: string): Promise<void> {
  const path = `expenses/${expenseId}`;
  try {
    const docRef = doc(db, 'expenses', expenseId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
