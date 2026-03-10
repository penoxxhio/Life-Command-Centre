// ============================================================
// Life Command Centre v3 — Type System
// ============================================================

// ---- Profile & Settings ----
export interface ProfileData {
  name: string;
  currency: string;
  theme: 'dark' | 'light';
  payday: number;
  setupComplete: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  enabled: boolean;
  reminderTime: string;
  creatureAlerts: boolean;
  streakReminders: boolean;
}

// ---- Creature / Tamagotchi System ----
export type CreatureSpecies = 'fox' | 'dragon' | 'cat' | 'owl' | 'wolf';

export type EvolutionStage = 'egg' | 'baby' | 'teen' | 'adult' | 'legendary';

export type CreatureMood = 'ecstatic' | 'happy' | 'neutral' | 'sad' | 'critical';

export type CreatureAnimation =
  | 'idle'
  | 'happy-bounce'
  | 'flex'
  | 'eat'
  | 'nod'
  | 'sleep'
  | 'play'
  | 'sad-idle'
  | 'evolve'
  | 'celebrate';

export interface CreatureStats {
  hunger: number;      // 0-100, decays over time
  energy: number;      // 0-100, decays over time
  happiness: number;   // 0-100, decays over time
  discipline: number;  // 0-100, from expense tracking consistency
}

export interface CreatureData {
  species: CreatureSpecies;
  name: string;
  stage: EvolutionStage;
  xp: number;
  xpToNextStage: number;
  stats: CreatureStats;
  mood: CreatureMood;
  animation: CreatureAnimation;
  lastFed: string;          // ISO timestamp
  lastTrained: string;      // ISO timestamp
  lastInteraction: string;  // ISO timestamp
  evolvedAt: string[];      // timestamps of each evolution
  totalDaysAlive: number;
  longestStreak: number;
}

// ---- Money Module ----
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'crypto' | 'loan';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
}

export interface DebtAccount {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  dueDay: number;
}

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  accountId: string;
  toAccountId?: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDue: string;
  dueDay: number;
  active: boolean;
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  limit: number;
  spent: number;
}

export interface MoneyData {
  accounts: Account[];
  debts: DebtAccount[];
  transactions: Transaction[];
  recurring: RecurringExpense[];
  budgetCategories: BudgetCategory[];
  monthlyIncome: number;
  savingsGoal: number;
}

// ---- Fitness Module ----
export interface Workout {
  id: string;
  type: string;
  title: string;
  duration: number;      // minutes
  intensity: 'light' | 'moderate' | 'intense';
  notes: string;
  date: string;
  caloriesBurned?: number;
}

export interface SleepEntry {
  id: string;
  date: string;
  hours: number;
  quality: 1 | 2 | 3 | 4 | 5;
}

export interface FitnessGoals {
  weeklyWorkouts: number;
  dailySleepHours: number;
  weeklyCardioMinutes: number;
  weeklyStrengthSessions: number;
}

export interface FitnessData {
  workouts: Workout[];
  sleep: SleepEntry[];
  goals: FitnessGoals;
  currentStreak: number;
  longestStreak: number;
}

// ---- Nutrition Module ----
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: string;
  type: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  time: string;
}

export interface NutritionGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  waterGlasses: number;
}

export interface NutritionData {
  meals: Meal[];
  goals: NutritionGoals;
  waterLog: { date: string; glasses: number }[];
}

// ---- Streaks & XP ----
export interface StreakData {
  current: number;
  longest: number;
  lastActiveDate: string;
  history: { date: string; modules: string[] }[];
}

export interface XPEvent {
  type: 'meal-logged' | 'workout-logged' | 'expense-logged' | 'debt-payment' | 'streak-bonus' | 'budget-met';
  xp: number;
  timestamp: string;
  description: string;
}

// ---- App Root State ----
export interface AppData {
  profile: ProfileData;
  notifications: NotificationSettings;
  creature: CreatureData;
  money: MoneyData;
  fitness: FitnessData;
  nutrition: NutritionData;
  streaks: StreakData;
  xpHistory: XPEvent[];
}

// ---- UI Types ----
export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'xp';
  duration?: number;
}

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}
