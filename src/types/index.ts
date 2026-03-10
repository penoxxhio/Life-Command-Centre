// ===== Profile & Settings =====
export interface ProfileData {
  name: string;
  currency: string;
  timezone?: string;
  theme?: 'light' | 'dark' | 'auto';
  payday?: number;
  workSchedule?: string;
  setupComplete: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  // Component-style fields
  reminderTime?: string;
  gardenReminders?: boolean;
  fitnessReminders?: boolean;
  nutritionReminders?: boolean;
  moneyReminders?: boolean;
  // Constants-style fields
  morningReminder?: boolean;
  middayReminder?: boolean;
  eveningReminder?: boolean;
  weeklyHealthSync?: boolean;
  backupReminder?: boolean;
}

// ===== Money =====
export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash' | 'bank' | 'card' | 'ewallet';
  balance: number;
  currency?: string;
  color?: string;
  icon?: string;
}

export interface DebtAccount {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: string;
}

export type Debt = DebtAccount;

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  description: string;
  date: string;
  accountId?: string;
  fromAccountId?: string;
  toAccountId?: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  accountId?: string;
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  description: string;
  date: string;
  accountId?: string;
}

export interface Transfer {
  id: string;
  amount: number;
  fromAccountId: string;
  toAccountId: string;
  date: string;
  description?: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  nextDue: string;
  accountId?: string;
  active: boolean;
  dueDay?: number;
}

export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  nextDue: string;
  accountId?: string;
  active: boolean;
}

export interface FixedObligation {
  name: string;
  amount: number;
  icon?: string;
}

export interface BudgetCategorySubcategory {
  name: string;
  budget: number;
  icon?: string;
}

export interface BudgetCategory {
  name: string;
  // Component-style fields
  limit?: number;
  color?: string;
  // Constants-style fields
  budget?: number;
  icon?: string;
  subcategories?: BudgetCategorySubcategory[];
}

export interface BudgetConfig {
  // Component-style fields
  monthlyBudget?: number;
  categories?: BudgetCategory[];
  // Constants-style fields
  totalIncome?: number;
  savingsTarget?: number;
  fixedObligations?: FixedObligation[];
  livingCategories?: BudgetCategory[];
}

// MoneyData — lean: only raw stored data, NO derived fields
export interface MoneyData {
  accounts: Account[];
  debtAccounts: DebtAccount[];
  expenses: Expense[];
  income: Income[];
  transfers: Transfer[];
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  recurring: RecurringExpense[];
  budgetConfig: BudgetConfig;
  currency: string;
  debts: DebtAccount[];
}

// ===== Fitness =====
export interface Workout {
  id: string;
  type: string;
  name: string;
  duration: number;
  calories?: number;
  caloriesBurned?: number;
  date: string;
  notes?: string;
  steps?: number;
}

export interface SleepEntry {
  id: string;
  hours: number;
  quality?: 'poor' | 'fair' | 'good' | 'excellent';
  date: string;
}

export interface FitnessGoals {
  // Component-style fields
  dailyStepGoal?: number;
  weeklyWorkoutGoal?: number;
  dailyCalorieGoal?: number;
  // Constants-style fields
  weeklySessionTarget?: number;
  dailyProteinTarget?: number;
  dailyCalorieTarget?: number;
  dailyCarbTarget?: number;
  dailyFatTarget?: number;
  dailyFiberTarget?: number;
  dailySugarLimit?: number;
  dailySodiumLimit?: number;
  dailySleepTarget?: number;
  dailyStepTarget?: number;
}

// FitnessData — lean: only raw stored data, NO derived fields
export interface FitnessData {
  workouts: Workout[];
  sleepLog: SleepEntry[];
  goals: FitnessGoals;
}

// ===== Nutrition =====
export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  date: string;
}

export interface NutritionGoals {
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbGoal?: number;
  dailyFatGoal?: number;
}

// NutritionData — lean: only raw stored data, NO derived fields
export interface NutritionData {
  meals: Meal[];
  goals: NutritionGoals;
}

// ===== Garden =====
export type PlantType = 'sunflower' | 'cactus' | 'fern' | 'bonsai' | 'rose' | 'herb' | 'tree' | 'tulip' | 'cherry' | 'palm';
export type GrowthStage = 'seed' | 'sprout' | 'growing' | 'mature' | 'blooming';
export type GardenActionType = 'water' | 'sunlight' | 'fertilize' | 'prune';

export interface GardenPlant {
  id: string;
  type: PlantType;
  name: string;
  stage: GrowthStage;
  growthStage: number;
  health: number;
  xp: number;
  sunlight: number;
  water: number;
  plantedDate: string;
  plantedAt: string;
}

export interface GardenPlot {
  id: number;
  plant: GardenPlant | null;
  unlocked: boolean;
}

export interface GardenData {
  plots: GardenPlot[];
  plants: GardenPlant[];
  level: number;
  totalXp: number;
  sunlight: number;
  water: number;
  streak: number;
  lastTended?: string;
}

export interface GardenReward {
  xp: number;
  message: string;
}

// ===== App Data =====
export interface AppData {
  profile: ProfileData;
  notifications: NotificationSettings;
  money: MoneyData;
  fitness: FitnessData;
  nutrition: NutritionData;
  garden: GardenData;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
