
import { AppData, BudgetConfig, DebtAccount, DebtGoal, DebtPayment, FitnessGoals, UserProfile, WhoopData } from './types';

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
  fixedObligations: [
    { name: "Rent/Mortgage", budget: 1500, icon: "🏠", subcategories: ["Rent", "Mortgage", "Property Tax", "HOA"], locked: true },
    { name: "Utilities", budget: 200, icon: "💡", subcategories: ["Electric", "Water", "Gas", "Internet", "Phone"] },
    { name: "Insurance", budget: 150, icon: "🛡️", subcategories: ["Car", "Health", "Life", "Home"], locked: true },
    { name: "Subscriptions", budget: 50, icon: "🔄", subcategories: ["Streaming", "Software", "Memberships"] }
  ],
  livingCategories: [
    { 
      name: "Groceries", 
      budget: 400, 
      icon: "🛒",
      subcategories: ["Supermarket", "Butcher", "Market", "Bakery"]
    },
    { 
      name: "Dining Out", 
      budget: 200, 
      icon: "🍽️",
      subcategories: ["Restaurants", "Fast Food", "Coffee", "Bars", "Delivery"]
    },
    { 
      name: "Transport", 
      budget: 150, 
      icon: "⛽",
      subcategories: ["Fuel", "Uber/Taxi", "Public Transport", "Parking", "Maintenance"]
    },
    { 
      name: "Shopping", 
      budget: 200, 
      icon: "🛍️",
      subcategories: ["Clothing", "Electronics", "Home Goods", "Gifts"]
    },
    {
      name: "Personal Care",
      budget: 100,
      icon: "💇",
      subcategories: ["Haircut", "Cosmetics", "Hygiene", "Spa"]
    },
    {
      name: "Health & Fitness",
      budget: 100,
      icon: "💊",
      subcategories: ["Pharmacy", "Doctor", "Supplements", "Gym Gear"]
    },
    {
      name: "Entertainment",
      budget: 150,
      icon: "🎬",
      subcategories: ["Movies", "Events", "Games", "Hobbies", "Night Out"]
    },
    {
      name: "Education",
      budget: 50,
      icon: "📚",
      subcategories: ["Books", "Courses", "Supplies"]
    },
    {
      name: "Travel",
      budget: 0,
      icon: "✈️",
      subcategories: ["Flights", "Hotels", "Activities", "Car Rental"]
    },
    {
      name: "Misc",
      budget: 100,
      icon: "📦",
      subcategories: ["Charity", "Fees", "Unexpected"]
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
  whoopData: INITIAL_WHOOP_DATA,
  workouts: [],
  meals: [],
  nutritionQuickChips: DEFAULT_QUICK_CHIPS,
  initialized: false,
  assetOnlyMode: false
};
