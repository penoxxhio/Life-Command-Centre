import type { Transaction, Expense, Income, Meal, Workout, SleepEntry } from '@/types';

// --- Date helpers ---
const isToday = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
};

const isThisMonth = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

const isThisWeek = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
};

// --- Money computed values ---
export const getMonthlySpent = (transactions: Transaction[], expenses?: Expense[]): number => {
  const fromTx = transactions
    .filter(t => t.type === 'expense' && isThisMonth(t.date))
    .reduce((sum, t) => sum + t.amount, 0);
  const fromExp = (expenses ?? [])
    .filter(e => isThisMonth(e.date))
    .reduce((sum, e) => sum + e.amount, 0);
  return fromTx + fromExp;
};

export const getMonthlyIncome = (transactions: Transaction[], income?: Income[]): number => {
  const fromTx = transactions
    .filter(t => t.type === 'income' && isThisMonth(t.date))
    .reduce((sum, t) => sum + t.amount, 0);
  const fromInc = (income ?? [])
    .filter(i => isThisMonth(i.date))
    .reduce((sum, i) => sum + i.amount, 0);
  return fromTx + fromInc;
};

// --- Nutrition computed values ---
export const getTodayCalories = (meals: Meal[]): number => {
  return meals
    .filter(m => isToday(m.date))
    .reduce((sum, m) => sum + m.calories, 0);
};

export const getTodayProtein = (meals: Meal[]): number => {
  return meals
    .filter(m => isToday(m.date))
    .reduce((sum, m) => sum + (m.protein ?? 0), 0);
};

// --- Fitness computed values ---
export const getTodaySteps = (workouts: Workout[]): number => {
  return workouts
    .filter(w => isToday(w.date))
    .reduce((sum, w) => sum + (w.steps ?? 0), 0);
};

export const getWeeklyWorkoutCount = (workouts: Workout[]): number => {
  return workouts.filter(w => isThisWeek(w.date)).length;
};

export const getLastSleepHours = (sleepLog: SleepEntry[]): number => {
  if (!sleepLog || sleepLog.length === 0) return 0;
  const sorted = [...sleepLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return sorted[0].hours;
};
