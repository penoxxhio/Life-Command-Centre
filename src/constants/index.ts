import type {
  AppData,
  BudgetCategory,
  FixedObligation,
  FitnessGoals,
  NutritionGoals,
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
    decayRate: number;
    xpToGrow: number;
    description: string;
  }
> = {
  sunflower: {
    name: 'Sunflower',
    emoji: '\ud83c\udf3b',
    color: '#F0B840',
    decayRate: 8,
    xpToGrow: 40,
    description: 'Bright and cheerful, thrives with daily care',
  },
  rose: {
    name: 'Rose',
    emoji: '\ud83c\udf39',
    color: '#D46A6A',
    decayRate: 10,
    xpToGrow: 50,
    description: 'Beautiful but delicate, needs consistent attention',
  },
  cactus: {
    name: 'Cactus',
    emoji: '\ud83c\udf35',
    color: '#6B8F71',
    decayRate: 3,
    xpToGrow: 60,
    description: 'Hardy and resilient, grows slowly but steadily',
  },
  herb: {
    name: 'Herb',
    emoji: '\ud83c\udf3f',
    color: '#7AAD83',
    decayRate: 6,
    xpToGrow: 30,
    description: 'Quick to grow, perfect for beginners',
  },
  tree: {
    name: 'Tree',
    emoji: '\ud83c\udf33',
    color: '#42573F',
    decayRate: 4,
    xpToGrow: 80,
    description: 'Takes patience, but becomes magnificent',
  },
  tulip: {
    name: 'Tulip',
    emoji: '\ud83c\udf37',
    color: '#E8A838',
    decayRate: 9,
    xpToGrow: 35,
    description: 'Elegant and colorful, moderate care needed',
  },
  cherry: {
    name: 'Cherry Blossom',
    emoji: '\ud83c\udf38',
    color: '#F2BCBC',
    decayRate: 7,
    xpToGrow: 55,
    description: 'Graceful bloomer, rewards patience beautifully',
  },
  palm: {
    name: 'Palm',
    emoji: '\ud83c\udf34',
    color: '#93BA9B',
    decayRate: 5,
    xpToGrow: 70,
    description: 'Tropical and relaxed, steady growth',
  },
};

export const GROWTH_STAGES: Record<GrowthStage, { label: string; emoji: string; multiplier: number }> = {
  seed: { label: 'Seed', emoji: '\ud83e\udeed', multiplier: 0 },
  sprout: { label: 'Sprout', emoji: '\ud83c\udf31', multiplier: 0.25 },
  growing: { label: 'Growing', emoji: '\ud83e\udeb4', multiplier: 0.5 },
  blooming: { label: 'Blooming', emoji: '\ud83c\udf3c', multiplier: 0.75 },
  mature: { label: 'Mature', emoji: '\u2728', multiplier: 1 },
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
export const PLOTS_PER_LEVEL = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// --- Default Budget Categories ---
export const DEFAULT_FIXED_OBLIGATIONS: FixedObligation[] = [
  { name: 'Rent/Mortgage', amount: 0, icon: '\ud83c\udfe0' },
  { name: 'Utilities', amount: 0, icon: '\ud83d\udca1' },
  { name: 'Insurance', amount: 0, icon: '\ud83d\udee1\ufe0f' },
  { name: 'Subscriptions', amount: 0, icon: '\ud83d\udcf1' },
];

export const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    name: 'Food & Dining',
    budget: 0,
    icon: '\ud83c\udf7d\ufe0f',
    subcategories: [
      { name: 'Groceries', budget: 0, icon: '\ud83d\uded2' },
      { name: 'Restaurants', budget: 0, icon: '\ud83c\udf55' },
      { name: 'Coffee', budget: 0, icon: '\u2615' },
    ],
  },
  {
    name: 'Transport',
    budget: 0,
    icon: '\ud83d\ude97',
    subcategories: [
      { name: 'Fuel', budget: 0, icon: '\u26fd' },
      { name: 'Parking', budget: 0, icon: '\ud83c\udd7f\ufe0f' },
      { name: 'Public Transit', budget: 0, icon: '\ud83d\ude8c' },
    ],
  },
  {
    name: 'Shopping',
    budget: 0,
    icon: '\ud83d\udecd\ufe0f',
    subcategories: [
      { name: 'Clothing', budget: 0, icon: '\ud83d\udc55' },
      { name: 'Electronics', budget: 0, icon: '\ud83d\udcf1' },
      { name: 'Home', budget: 0, icon: '\ud83c\udfe1' },
    ],
  },
  {
    name: 'Health & Fitness',
    budget: 0,
    icon: '\ud83d\udcaa',
    subcategories: [
      { name: 'Gym', budget: 0, icon: '\ud83c\udfcb\ufe0f' },
      { name: 'Supplements', budget: 0, icon: '\ud83d\udc8a' },
      { name: 'Medical', budget: 0, icon: '\ud83c\udfe5' },
    ],
  },
  {
    name: 'Entertainment',
    budget: 0,
    icon: '\ud83c\udfae',
    subcategories: [
      { name: 'Games', budget: 0, icon: '\ud83c\udfaf' },
      { name: 'Movies', budget: 0, icon: '\ud83c\udfac' },
      { name: 'Going Out', budget: 0, icon: '\ud83c\udf7a' },
    ],
  },
  {
    name: 'Personal',
    budget: 0,
    icon: '\u2728',
    subcategories: [
      { name: 'Self Care', budget: 0, icon: '\ud83d\udc86' },
      { name: 'Education', budget: 0, icon: '\ud83d\udcda' },
      { name: 'Gifts', budget: 0, icon: '\ud83c\udf81' },
    ],
  },
];

// --- Expense Categories (used in BudgetOverview, ExpenseLogger, TransactionHistory) ---
export const EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', icon: '\ud83c\udf7d\ufe0f', color: '#F59E0B' },
  { name: 'Transport', icon: '\ud83d\ude97', color: '#3B82F6' },
  { name: 'Shopping', icon: '\ud83d\udecd\ufe0f', color: '#8B5CF6' },
  { name: 'Health & Fitness', icon: '\ud83d\udcaa', color: '#10B981' },
  { name: 'Entertainment', icon: '\ud83c\udfae', color: '#EC4899' },
  { name: 'Personal', icon: '\u2728', color: '#6366F1' },
  { name: 'Bills & Utilities', icon: '\ud83d\udca1', color: '#EF4444' },
  { name: 'Other', icon: '\ud83d\udccc', color: '#6B7280' },
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

// --- Default Nutrition Goals ---
export const DEFAULT_NUTRITION_GOALS: NutritionGoals = {
  dailyCalorieGoal: 2200,
  dailyProteinGoal: 150,
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
    unlocked: i === 0,
  }));
};

// --- Initial App Data (lean — no derived fields) ---
export const createInitialAppData = (): AppData => ({
  profile: {
    name: '',
    currency: 'AED',
    payday: 1,
    workSchedule: 'weekdays',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    theme: 'light',
    setupComplete: false,
  },
  money: {
    accounts: [],
    debtAccounts: [],
    expenses: [],
    income: [],
    transfers: [],
    transactions: [],
    recurringTransactions: [],
    recurring: [],
    budgetConfig: {
      totalIncome: 0,
      savingsTarget: 20,
      monthlyBudget: 0,
      categories: [],
      fixedObligations: [...DEFAULT_FIXED_OBLIGATIONS],
      livingCategories: [...DEFAULT_BUDGET_CATEGORIES],
    },
    currency: 'AED',
    debts: [],
  },
  fitness: {
    workouts: [],
    sleepLog: [],
    goals: { ...DEFAULT_FITNESS_GOALS },
  },
  nutrition: {
    meals: [],
    goals: { ...DEFAULT_NUTRITION_GOALS },
  },
  garden: {
    plots: createInitialPlots(),
    plants: [],
    level: 1,
    totalXp: 0,
    sunlight: 5,
    water: 5,
    streak: 0,
  },
  notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
});

// --- Gemini Config ---
export const GEMINI_MODEL = 'gemini-2.0-flash';
export const GEMINI_DAILY_LIMIT = 1500;

// --- Storage Keys ---
export const STORAGE_KEYS = {
  APP_DATA: 'life-command-centre-data-v2',
  APP_DATA_V1: 'life-command-center-data-v1',
  STREAK: 'life-command-streak',
  GEMINI_USAGE: 'gemini_usage_stats',
  HEALTH_IMPORT: 'health_import_data',
} as const;

// --- Currency Options ---
export const CURRENCY_OPTIONS = [
  { value: 'AED', label: 'AED (\u062f.\u0625)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (\u20ac)' },
  { value: 'GBP', label: 'GBP (\u00a3)' },
  { value: 'SAR', label: 'SAR (\ufdfc)' },
  { value: 'INR', label: 'INR (\u20b9)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  AED: '\u062f.\u0625',
  USD: '$',
  EUR: '\u20ac',
  GBP: '\u00a3',
  SAR: '\ufdfc',
  INR: '\u20b9',
  CAD: '$',
  AUD: '$',
};
