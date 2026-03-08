
export interface UserProfile {
  name: string;
  currency: string;
  payday: number;
  workSchedule: {
    regular: string;
    friday: string;
  };
}

export interface DebtAccount {
  id: string;
  name: string;
  startingBalance: number;
  currentBalance: number;
  interestRate: number;
  minPayment: number;
  color: string;
}

export interface DebtPayment {
  date: string;
  cardId: string;
  amount: number;
}

export interface DebtGoal {
  targetDate: string;
  monthlyTarget: number;
  startingTotal: number;
}

export interface BudgetCategory {
  name: string;
  amount?: number; // For fixed
  budget?: number; // For living
  icon: string;
  subcategories?: string[];
  locked?: boolean;
  originalBudget?: number;
}

export interface BudgetConfig {
  cycleStartDay: number;
  fixedObligations: BudgetCategory[];
  livingCategories: BudgetCategory[];
}

export interface Expense {
  id: string;
  date: string;
  categoryName: string;
  subcategoryName?: string;
  amount: number;
  note?: string;
  icon: string;
  sourceAccountId: string;
}

export interface Income {
  id: string;
  date: string;
  source: string;
  amount: number;
  accountId: string;
  note?: string;
}

export interface Transfer {
  id: string;
  date: string;
  amount: number;
  fromAccountId: string;
  toAccountId: string;
  note?: string;
}

export interface RecurringTransaction {
  id: string;
  type: 'expense' | 'income' | 'transfer';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDueDate: string;
  amount: number;
  note: string;
  active: boolean;
  
  // Type specific fields
  categoryName?: string; // Expense
  sourceAccountId?: string; // Expense, Transfer
  toAccountId?: string; // Income, Transfer
  sourceName?: string; // Income (e.g. "Salary")
}

export interface BankAccount {
  id: string;
  name: string;
  balance: number;
}

export interface FitnessGoals {
  weeklySessionTarget: number;
  proteinGoal: number;
  calorieGoal: number;
  carbGoal: number;
  fatGoal: number;
  fiberGoal: number;
  sugarLimit: number;
  sodiumLimit: number;
  sleepGoal: number;
  moveGoal: number;
  exerciseGoal: number;
  standGoal: number;
  stepGoal: number;
}

export interface WhoopData {
  lastUpdated: string;
  recovery: number;
  hrv: number;
  rhr: number;
  strain: number;
  caloriesBurned: number;
  hoursSlept: number;
  sleepQuality: number;
  sleepStages: {
    deep: number;
    rem: number;
    light: number;
    awake: number;
  };
}

export interface Workout {
  id: string;
  date: string;
  type: string;
  duration: number;
  notes?: string;
  completed: boolean;
}

export interface Meal {
  id: string;
  date: string;
  timestamp: number;
  name: string;
  isAiEstimated: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  saturatedFat: number;
  sodium: number;
  cholesterol: number;
  potassium: number;
  iron: number;
  calcium: number;
  vitaminD: number;
}

export interface AppData {
  userProfile: UserProfile;
  debtAccounts: DebtAccount[];
  debtPaymentHistory: DebtPayment[];
  debtGoal: DebtGoal;
  budgetConfig: BudgetConfig;
  bankAccounts: BankAccount[];
  expenses: Expense[];
  incomes: Income[];
  transfers: Transfer[];
  recurringTransactions: RecurringTransaction[];
  fitnessGoals: FitnessGoals;
  whoopData: WhoopData;
  workouts: Workout[];
  meals: Meal[];
  nutritionQuickChips: string[];
  gardenData: GardenData;
  initialized: boolean;
  assetOnlyMode: boolean;
}

export enum Tab {
  HOME = 'HOME',
  MONEY = 'MONEY',
  GARDEN = 'GARDEN',
  FITNESS = 'FITNESS',
  NUTRITION = 'NUTRITION',
  SETTINGS = 'SETTINGS'
}

export interface HealthImportData {
  exportDate: string;
  daysBack: number;
  totalDays: number;
  days: HealthDayData[];
}

export interface HealthDayData {
  date: string;
  sleep: {
    inBedHours: number;
    asleepHours: number;
  } | null;
  restingHR: number | null;
  hrvAvg: number | null;
  steps: number;
  activeCalories: number;
  exerciseMinutes: number;
  standHours: number;
  workouts: Array<{
    date: string;
    startDate: string;
    type: string;
    activityType: string;
    duration: number;
    calories: number;
    source: string;
    avgHR: number | null;
    maxHR: number | null;
    strain: number | null;
  }> | null;
}

// Garden Gamification Types
export interface GardenPlot {
  id: string;
  plant: GardenPlant | null;
  unlocked: boolean;
}

export interface GardenPlant {
  id: string;
  type: PlantType;
  name: string;
  plantedDate: string;
  lastCaredDate: string;
  health: number; // 0-100
  experience: number; // drives growth stage
  stage: PlantStage;
  isDead: boolean;
}

export type PlantType = 'sunflower' | 'rose' | 'cactus' | 'herb' | 'tree' | 'tulip' | 'cherry' | 'palm';
export type PlantStage = 'seed' | 'sprout' | 'growing' | 'blooming' | 'mature';

export interface GardenData {
  plots: GardenPlot[];
  totalPlantsGrown: number;
  totalPlantsDied: number;
  gardenLevel: number;
  lifetimeXP: number;
  lastProcessedDate: string;
}

