// === Profile ===
export interface ProfileData {
  name: string;
  currency: string;
  payday: number;
  workSchedule: string;
  setupComplete: boolean;
}

// === Money ===
export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash';
  balance: number;
  icon?: string;
}

export interface DebtAccount {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  icon?: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  subcategory?: string;
  description: string;
  date: string;
  accountId?: string;
  isRecurring?: boolean;
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  accountId?: string;
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface RecurringTransaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category?: string;
  source?: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  nextDate: string;
  accountId?: string;
}

export interface Subcategory {
  name: string;
  budget: number;
  icon: string;
}

export interface BudgetCategory {
  name: string;
  budget: number;
  icon: string;
  subcategories: Subcategory[];
}

export interface FixedObligation {
  name: string;
  amount: number;
  icon: string;
}

export interface BudgetConfig {
  totalIncome: number;
  savingsTarget: number;
  fixedObligations: FixedObligation[];
  livingCategories: BudgetCategory[];
}

export interface MoneyData {
  accounts: Account[];
  debtAccounts: DebtAccount[];
  expenses: Expense[];
  income: Income[];
  transfers: Transfer[];
  recurringTransactions: RecurringTransaction[];
  budgetConfig: BudgetConfig;
}

// === Fitness ===
export interface Workout {
  id: string;
  type: string;
  duration: number;
  calories?: number;
  date: string;
  notes?: string;
}

export interface FitnessGoals {
  weeklySessionTarget: number;
  dailyProteinTarget: number;
  dailyCalorieTarget: number;
  dailyCarbTarget: number;
  dailyFatTarget: number;
  dailyFiberTarget: number;
  dailySugarLimit: number;
  dailySodiumLimit: number;
  dailySleepTarget: number;
  dailyStepTarget: number;
}

export interface FitnessData {
  workouts: Workout[];
  goals: FitnessGoals;
}

// === Nutrition ===
export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  date: string;
  aiGenerated?: boolean;
}

export interface NutritionData {
  meals: Meal[];
}

// === Garden ===
export type PlantType = 'sunflower' | 'rose' | 'cactus' | 'herb' | 'tree' | 'tulip' | 'cherry' | 'palm';
export type GrowthStage = 'seed' | 'sprout' | 'growing' | 'blooming' | 'mature';

export type GardenActionType =
  | 'log_expense'
  | 'log_meal'
  | 'log_workout'
  | 'log_income'
  | 'complete_budget'
  | 'daily_login';

export interface GardenPlant {
  type: PlantType;
  stage: GrowthStage;
  health: number;
  xp: number;
  plantedDate: string;
}

export interface GardenPlot {
  id: number;
  plant: GardenPlant | null;
  unlocked: boolean;
}

export interface GardenReward {
  xp: number;
  health: number;
  message: string;
}

export interface GardenData {
  plots: GardenPlot[];
  level: number;
  totalXp: number;
}

// === Notifications ===
export interface NotificationSettings {
  enabled: boolean;
  morningReminder: boolean;
  middayReminder: boolean;
  eveningReminder: boolean;
  weeklyHealthSync: boolean;
  backupReminder: boolean;
}

// === Root App Data ===
export interface AppData {
  profile: ProfileData;
  money: MoneyData;
  fitness: FitnessData;
  nutrition: NutritionData;
  garden: GardenData;
  notifications: NotificationSettings;
}
