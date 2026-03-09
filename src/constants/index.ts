import type {
  AppData,
  BudgetCategory,
  FixedObligation,
  FitnessGoals,
  GardenPlot,
  PlantType,
  GrowthStage,
  NotificationSettings,
} from '@/types';

// --- Plant Configuration ---
export const PLANT_CONFIG: Record<
  PlantType,
  {
    name: string;
    emoji: string;
    color: string;
    decayRate: number; // health lost per day without activity
    xpToGrow: number; // XP needed per stage
    description: string;
  }
> = {
  sunflower: {
    name: 'Sunflower',
    emoji: '🌻',
    color: '#F0B840',
    decayRate: 8,
    xpToGrow: 40,
    description: 'Bright and cheerful, thrives with daily care',
  },
  rose: {
    name: 'Rose',
    emoji: '🌹',
    color: '#D46A6A',
    decayRate: 10,
    xpToGrow: 50,
    description: 'Beautiful but delicate, needs consistent attention',
  },
  cactus: {
    name: 'Cactus',
    emoji: '🌵',
    color: '#6B8F71',
    decayRate: 3,
    xpToGrow: 60,
    description: 'Hardy and resilient, grows slowly but steadily',
  },
  herb: {
    name: 'Herb',
    emoji: '🌿',
    color: '#7AAD83',
    decayRate: 6,
    xpToGrow: 30,
    description: 'Quick to grow, perfect for beginners',
  },
  tree: {
    name: 'Tree',
    emoji: '🌳',
    color: '#42573F',
    decayRate: 4,
    xpToGrow: 80,
    description: 'Takes patience, but becomes magnificent',
  },
  tulip: {
    name: 'Tulip',
    emoji: '🌷',
    color: '#E8A838',
    decayRate: 9,
    xpToGrow: 35,
    description: 'Elegant and colorful, moderate care needed',
  },
  cherry: {
    name: 'Cherry Blossom',
    emoji: '🌸',
    color: '#F2BCBC',
    decayRate: 7,
    xpToGrow: 55,
    description: 'Graceful bloomer, rewards patience beautifully',
  },
  palm: {
    name: 'Palm',
    emoji: '🌴',
    color: '#93BA9B',
    decayRate: 5,
    xpToGrow: 70,
    description: 'Tropical and relaxed, steady growth',
  },
};

export const GROWTH_STAGES: Record<GrowthStage, { label: string; emoji: string; multiplier: number }> = {
  seed: { label: 'Seed', emoji: '🫘', multiplier: 0 },
  sprout: { label: 'Sprout', emoji: '🌱', multiplier: 0.25 },
  growing: { label: 'Growing', emoji: '🪴', multiplier: 0.5 },
  blooming: { label: 'Blooming', emoji: '🌼', multiplier: 0.75 },
  mature: { label: 'Mature', emoji: '✨', multiplier: 1 },
};

export const STAGE_ORDER: GrowthStage[] = ['seed', 'sprout', 'growing', 'blooming', 'mature'];

// --- Garden XP Rewards ---
export const GARDEN_XP_REWARDS: Record<string, number> = {
  log_expense: 5,
  log_meal: 8,
  log_workout: 15,
  log_income: 10,
  complete_budget: 20,
  daily_login: 3,
};

export const GARDEN_HEALTH_REWARDS: Record<string, number> = {
  log_expense: 3,
  log_meal: 5,
  log_workout: 10,
  log_income: 5,
  complete_budget: 15,
  daily_login: 2,
};

// --- Level System ---
export const XP_PER_LEVEL = 200;
export const MAX_PLOTS = 9;
export const PLOTS_PER_LEVEL = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // plots unlocked at each level

// --- Default Budget Categories ---
export const DEFAULT_FIXED_OBLIGATIONS: FixedObligation[] = [
  { name: 'Rent/Mortgage', amount: 0, icon: '🏠' },
  { name: 'Utilities', amount: 0, icon: '💡' },
  { name: 'Insurance', amount: 0, icon: '🛡️' },
  { name: 'Subscriptions', amount: 0, icon: '📱' },
];

export const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    name: 'Food & Dining',
    budget: 0,
    icon: '🍽️',
    subcategories: [
      { name: 'Groceries', budget: 0, icon: '🛒' },
      { name: 'Restaurants', budget: 0, icon: '🍕' },
      { name: 'Coffee', budget: 0, icon: '☕' },
    ],
  },
  {
    name: 'Transport',
    budget: 0,
    icon: '🚗',
    subcategories: [
      { name: 'Fuel', budget: 0, icon: '⛽' },
      { name: 'Parking', budget: 0, icon: '🅿️' },
      { name: 'Public Transit', budget: 0, icon: '🚌' },
    ],
  },
  {
    name: 'Shopping',
    budget: 0,
    icon: '🛍️',
    subcategories: [
      { name: 'Clothing', budget: 0, icon: '👕' },
      { name: 'Electronics', budget: 0, icon: '📱' },
      { name: 'Home', budget: 0, icon: '🏡' },
    ],
  },
  {
    name: 'Health & Fitness',
    budget: 0,
    icon: '💪',
    subcategories: [
      { name: 'Gym', budget: 0, icon: '🏋️' },
      { name: 'Supplements', budget: 0, icon: '💊' },
      { name: 'Medical', budget: 0, icon: '🏥' },
    ],
  },
  {
    name: 'Entertainment',
    budget: 0,
    icon: '🎮',
    subcategories: [
      { name: 'Games', budget: 0, icon: '🎯' },
      { name: 'Movies', budget: 0, icon: '🎬' },
      { name: 'Going Out', budget: 0, icon: '🍺' },
    ],
  },
  {
    name: 'Personal',
    budget: 0,
    icon: '✨',
    subcategories: [
      { name: 'Self Care', budget: 0, icon: '💆' },
      { name: 'Education', budget: 0, icon: '📚' },
      { name: 'Gifts', budget: 0, icon: '🎁' },
    ],
  },
];

// --- Default Fitness Goals ---
export const DEFAULT_FITNESS_GOALS: FitnessGoals = {
  weeklySessionTarget: 4,
  dailyProteinTarget: 150,
  dailyCalorieTarget: 2200,
  dailyCarbTarget: 250,
  dailyFatTarget: 70,
  dailyFiberTarget: 30,
  dailySugarLimit: 50,
  dailySodiumLimit: 2300,
  dailySleepTarget: 8,
  dailyStepTarget: 10000,
};

// --- Default Notification Settings ---
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  morningReminder: true,
  middayReminder: true,
  eveningReminder: true,
  weeklyHealthSync: true,
  backupReminder: true,
};

// --- Initial Garden Plots ---
export const createInitialPlots = (): GardenPlot[] => {
  return Array.from({ length: 9 }, (_, i) => ({
    id: i,
    plant: null,
    unlocked: i === 0, // Only first plot unlocked initially
  }));
};

// --- Initial App Data ---
export const createInitialAppData = (): AppData => ({
  profile: {
    name: '',
    currency: 'AED',
    payday: 1,
    workSchedule: 'weekdays',
    setupComplete: false,
  },
  money: {
    accounts: [],
    debtAccounts: [],
    expenses: [],
    income: [],
    transfers: [],
    recurringTransactions: [],
    budgetConfig: {
      totalIncome: 0,
      savingsTarget: 20,
      fixedObligations: [...DEFAULT_FIXED_OBLIGATIONS],
      livingCategories: [...DEFAULT_BUDGET_CATEGORIES],
    },
  },
  fitness: {
    workouts: [],
    goals: { ...DEFAULT_FITNESS_GOALS },
  },
  nutrition: {
    meals: [],
  },
  garden: {
    plots: createInitialPlots(),
    level: 1,
    totalXp: 0,
  },
  notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
});

// --- Gemini Config ---
export const GEMINI_MODEL = 'gemini-2.0-flash';
export const GEMINI_DAILY_LIMIT = 1500;

// --- Storage Keys ---
export const STORAGE_KEYS = {
  APP_DATA: 'life-command-centre-data-v2',
  APP_DATA_V1: 'life-command-center-data-v1', // For migration
  STREAK: 'life-command-streak',
  GEMINI_USAGE: 'gemini_usage_stats',
  HEALTH_IMPORT: 'health_import_data',
} as const;

// --- Currency Options ---
export const CURRENCY_OPTIONS = [
  { value: 'AED', label: 'AED (د.إ)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'SAR', label: 'SAR (﷼)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  AED: 'د.إ',
  USD: '$',
  EUR: '€',
  GBP: '£',
  SAR: '﷼',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$',
};
