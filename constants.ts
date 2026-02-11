
import { AppData, AppleHealthData, BudgetConfig, DebtAccount, DebtGoal, DebtPayment, FitnessGoals, UserProfile, WhoopData } from './types';

export const APP_DATA_KEY = 'life-command-center-data-v1';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: "",
  currency: "$",
  payday: 1,
  workSchedule: {
    regular: "9:00-17:00",
    friday: "9:00-17:00"
  }
};

export const INITIAL_DEBT_ACCOUNTS: DebtAccount[] = [];

export const INITIAL_DEBT_HISTORY: DebtPayment[] = [];

export const INITIAL_DEBT_GOAL: DebtGoal = {
  targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  monthlyTarget: 1000,
  startingTotal: 0
};

export const INITIAL_BUDGET_CONFIG: BudgetConfig = {
  cycleStartDay: 1,
  fixedObligations: [],
  livingCategories: [
    { 
      "name": "Transport", 
      "budget": 200, 
      "icon": "⛽",
      "subcategories": ["Fuel", "Taxi", "Public Transport"]
    },
    { 
      "name": "Food & Drink", 
      "budget": 400, 
      "icon": "🍔",
      "subcategories": ["Dining Out", "Groceries", "Coffee"]
    },
    { 
      "name": "Shopping", 
      "budget": 200, 
      "icon": "🛍️",
      "subcategories": ["Clothes", "Electronics", "Home"]
    }
  ]
};

export const INITIAL_FITNESS_GOALS: FitnessGoals = {
  weeklySessionTarget: 3,
  proteinGoal: 150,
  calorieGoal: 2000,
  carbGoal: 200,
  fatGoal: 65,
  fiberGoal: 25,
  sugarLimit: 40,
  sodiumLimit: 2300,
  sleepGoal: 8,
  moveGoal: 400,
  exerciseGoal: 30,
  standGoal: 12,
  stepGoal: 8000
};

export const INITIAL_APPLE_HEALTH: AppleHealthData = {
  lastUpdated: "",
  steps: 0,
  activeEnergy: 0,
  exerciseTime: 0,
  standHours: 0,
  distance: 0,
  flightsClimbed: 0
};

export const INITIAL_WHOOP_DATA: WhoopData = {
  lastUpdated: "",
  recovery: 0,
  hrv: 0,
  rhr: 0,
  strain: 0,
  caloriesBurned: 0,
  hoursSlept: 0,
  sleepQuality: 0,
  sleepStages: {
    deep: 0,
    rem: 0,
    light: 0,
    awake: 0
  }
};

export const DEFAULT_QUICK_CHIPS = [
  "Protein shake", "Chicken & rice", "Coffee", "Oats", "Banana"
];

export const INITIAL_APP_DATA: AppData = {
  userProfile: INITIAL_USER_PROFILE,
  debtAccounts: INITIAL_DEBT_ACCOUNTS,
  debtPaymentHistory: INITIAL_DEBT_HISTORY,
  debtGoal: INITIAL_DEBT_GOAL,
  budgetConfig: INITIAL_BUDGET_CONFIG,
  bankAccounts: [],
  expenses: [],
  incomes: [],
  transfers: [],
  recurringTransactions: [],
  fitnessGoals: INITIAL_FITNESS_GOALS,
  appleHealthData: INITIAL_APPLE_HEALTH,
  whoopData: INITIAL_WHOOP_DATA,
  workouts: [],
  meals: [],
  nutritionQuickChips: DEFAULT_QUICK_CHIPS,
  initialized: false
};
