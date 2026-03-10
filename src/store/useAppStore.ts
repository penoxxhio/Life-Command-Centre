import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppData, ProfileData, CreatureData, MoneyData, FitnessData,
  NutritionData, StreakData, XPEvent, ToastItem, Transaction,
  Workout, Meal, NotificationSettings, Account, DebtAccount,
  RecurringExpense, BudgetCategory,
} from '../types';
import { createCreature, applyDecay, processAction } from '../features/creature/creatureService';
import { XP_REWARDS } from '../features/creature/creatureConfig';

// ---- Default Data ----
const defaultProfile: ProfileData = {
  name: '',
  currency: 'USD',
  theme: 'dark',
  payday: 1,
  setupComplete: false,
  createdAt: new Date().toISOString(),
};

const defaultNotifications: NotificationSettings = {
  enabled: false,
  reminderTime: '09:00',
  creatureAlerts: true,
  streakReminders: true,
};

const defaultMoney: MoneyData = {
  accounts: [],
  debts: [],
  transactions: [],
  recurring: [],
  budgetCategories: [
    { id: '1', name: 'Housing', icon: 'Home', color: '#00d4ff', limit: 0, spent: 0 },
    { id: '2', name: 'Food', icon: 'Utensils', color: '#ffc000', limit: 0, spent: 0 },
    { id: '3', name: 'Transport', icon: 'Car', color: '#8626ff', limit: 0, spent: 0 },
    { id: '4', name: 'Entertainment', icon: 'Gamepad2', color: '#ff7b26', limit: 0, spent: 0 },
    { id: '5', name: 'Shopping', icon: 'ShoppingBag', color: '#ff4d6a', limit: 0, spent: 0 },
    { id: '6', name: 'Health', icon: 'Heart', color: '#10b981', limit: 0, spent: 0 },
    { id: '7', name: 'Education', icon: 'GraduationCap', color: '#4d9fff', limit: 0, spent: 0 },
    { id: '8', name: 'Other', icon: 'MoreHorizontal', color: '#9ea4ba', limit: 0, spent: 0 },
  ],
  monthlyIncome: 0,
  savingsGoal: 0,
};

const defaultFitness: FitnessData = {
  workouts: [],
  sleep: [],
  goals: { weeklyWorkouts: 4, dailySleepHours: 8, weeklyCardioMinutes: 120, weeklyStrengthSessions: 3 },
  currentStreak: 0,
  longestStreak: 0,
};

const defaultNutrition: NutritionData = {
  meals: [],
  goals: { dailyCalories: 2200, dailyProtein: 150, dailyCarbs: 250, dailyFat: 70, waterGlasses: 8 },
  waterLog: [],
};

const defaultStreaks: StreakData = {
  current: 0,
  longest: 0,
  lastActiveDate: '',
  history: [],
};

const defaultCreature: CreatureData = createCreature('fox', 'Buddy');

// ---- Store Interface ----
interface AppStore {
  data: AppData;
  toasts: ToastItem[];

  // Profile
  updateProfile: (updates: Partial<ProfileData>) => void;
  completeSetup: (profile: Partial<ProfileData>, creatureSpecies: CreatureData['species'], creatureName: string) => void;

  // Creature
  tickCreature: () => void;

  // Money
  addTransaction: (tx: Transaction) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addDebt: (debt: DebtAccount) => void;
  updateDebt: (id: string, updates: Partial<DebtAccount>) => void;
  deleteDebt: (id: string) => void;
  addRecurring: (item: RecurringExpense) => void;
  deleteRecurring: (id: string) => void;
  updateBudgetCategory: (id: string, updates: Partial<BudgetCategory>) => void;
  updateMoneySettings: (updates: Partial<Pick<MoneyData, 'monthlyIncome' | 'savingsGoal'>>) => void;

  // Fitness
  addWorkout: (workout: Workout) => void;
  deleteWorkout: (id: string) => void;
  updateFitnessGoals: (goals: Partial<FitnessData['goals']>) => void;

  // Nutrition
  addMeal: (meal: Meal) => void;
  deleteMeal: (id: string) => void;
  updateNutritionGoals: (goals: Partial<NutritionData['goals']>) => void;
  logWater: (glasses: number) => void;

  // Toasts
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Data
  resetAllData: () => void;
  loadData: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      data: {
        profile: defaultProfile,
        notifications: defaultNotifications,
        creature: defaultCreature,
        money: defaultMoney,
        fitness: defaultFitness,
        nutrition: defaultNutrition,
        streaks: defaultStreaks,
        xpHistory: [],
      },
      toasts: [],

      // ---- Profile ----
      updateProfile: (updates) =>
        set((s) => ({ data: { ...s.data, profile: { ...s.data.profile, ...updates } } })),

      completeSetup: (profile, species, creatureName) =>
        set((s) => ({
          data: {
            ...s.data,
            profile: { ...s.data.profile, ...profile, setupComplete: true, createdAt: new Date().toISOString() },
            creature: createCreature(species, creatureName),
          },
        })),

      // ---- Creature ----
      tickCreature: () =>
        set((s) => ({
          data: { ...s.data, creature: applyDecay(s.data.creature) },
        })),

      // ---- Money ----
      addTransaction: (tx) =>
        set((s) => {
          const actionType = tx.type === 'expense' ? 'expense-logged' : undefined;
          let creature = s.data.creature;
          let xpHistory = s.data.xpHistory;
          const toasts = [...s.toasts];

          if (actionType) {
            const result = processAction(creature, actionType);
            creature = result.creature;
            xpHistory = [...xpHistory, {
              type: actionType,
              xp: result.xpGained,
              timestamp: new Date().toISOString(),
              description: `Logged expense: ${tx.description}`,
            }];
            toasts.push({ id: Date.now().toString(), message: `+${result.xpGained} XP`, type: 'xp', duration: 3000 });
          }

          // Update budget spent
          const budgetCategories = s.data.money.budgetCategories.map((cat) =>
            cat.name.toLowerCase() === tx.category.toLowerCase() && tx.type === 'expense'
              ? { ...cat, spent: cat.spent + tx.amount }
              : cat
          );

          return {
            data: {
              ...s.data,
              money: { ...s.data.money, transactions: [tx, ...s.data.money.transactions], budgetCategories },
              creature,
              xpHistory,
            },
            toasts,
          };
        }),

      addAccount: (account) =>
        set((s) => ({ data: { ...s.data, money: { ...s.data.money, accounts: [...s.data.money.accounts, account] } } })),

      updateAccount: (id, updates) =>
        set((s) => ({
          data: { ...s.data, money: { ...s.data.money, accounts: s.data.money.accounts.map((a) => a.id === id ? { ...a, ...updates } : a) } },
        })),

      deleteAccount: (id) =>
        set((s) => ({ data: { ...s.data, money: { ...s.data.money, accounts: s.data.money.accounts.filter((a) => a.id !== id) } } })),

      addDebt: (debt) =>
        set((s) => ({ data: { ...s.data, money: { ...s.data.money, debts: [...s.data.money.debts, debt] } } })),

      updateDebt: (id, updates) =>
        set((s) => ({
          data: { ...s.data, money: { ...s.data.money, debts: s.data.money.debts.map((d) => d.id === id ? { ...d, ...updates } : d) } },
        })),

      deleteDebt: (id) =>
        set((s) => ({ data: { ...s.data, money: { ...s.data.money, debts: s.data.money.debts.filter((d) => d.id !== id) } } })),

      addRecurring: (item) =>
        set((s) => ({ data: { ...s.data, money: { ...s.data.money, recurring: [...s.data.money.recurring, item] } } })),

      deleteRecurring: (id) =>
        set((s) => ({ data: { ...s.data, money: { ...s.data.money, recurring: s.data.money.recurring.filter((r) => r.id !== id) } } })),

      updateBudgetCategory: (id, updates) =>
        set((s) => ({
          data: { ...s.data, money: { ...s.data.money, budgetCategories: s.data.money.budgetCategories.map((c) => c.id === id ? { ...c, ...updates } : c) } },
        })),

      updateMoneySettings: (updates) =>
        set((s) => ({ data: { ...s.data, money: { ...s.data.money, ...updates } } })),

      // ---- Fitness ----
      addWorkout: (workout) =>
        set((s) => {
          const result = processAction(s.data.creature, 'workout-logged');
          const xpEvent: XPEvent = {
            type: 'workout-logged',
            xp: result.xpGained,
            timestamp: new Date().toISOString(),
            description: `Workout: ${workout.title}`,
          };
          return {
            data: {
              ...s.data,
              fitness: { ...s.data.fitness, workouts: [workout, ...s.data.fitness.workouts] },
              creature: result.creature,
              xpHistory: [...s.data.xpHistory, xpEvent],
            },
            toasts: [...s.toasts, { id: Date.now().toString(), message: `+${result.xpGained} XP \u2014 ${result.creature.name} is pumped!`, type: 'xp', duration: 3000 }],
          };
        }),

      deleteWorkout: (id) =>
        set((s) => ({ data: { ...s.data, fitness: { ...s.data.fitness, workouts: s.data.fitness.workouts.filter((w) => w.id !== id) } } })),

      updateFitnessGoals: (goals) =>
        set((s) => ({ data: { ...s.data, fitness: { ...s.data.fitness, goals: { ...s.data.fitness.goals, ...goals } } } })),

      // ---- Nutrition ----
      addMeal: (meal) =>
        set((s) => {
          const result = processAction(s.data.creature, 'meal-logged');
          const xpEvent: XPEvent = {
            type: 'meal-logged',
            xp: result.xpGained,
            timestamp: new Date().toISOString(),
            description: `Meal: ${meal.name}`,
          };
          return {
            data: {
              ...s.data,
              nutrition: { ...s.data.nutrition, meals: [meal, ...s.data.nutrition.meals] },
              creature: result.creature,
              xpHistory: [...s.data.xpHistory, xpEvent],
            },
            toasts: [...s.toasts, { id: Date.now().toString(), message: `+${result.xpGained} XP \u2014 ${result.creature.name} feels nourished!`, type: 'xp', duration: 3000 }],
          };
        }),

      deleteMeal: (id) =>
        set((s) => ({ data: { ...s.data, nutrition: { ...s.data.nutrition, meals: s.data.nutrition.meals.filter((m) => m.id !== id) } } })),

      updateNutritionGoals: (goals) =>
        set((s) => ({ data: { ...s.data, nutrition: { ...s.data.nutrition, goals: { ...s.data.nutrition.goals, ...goals } } } })),

      logWater: (glasses) =>
        set((s) => {
          const today = new Date().toISOString().split('T')[0];
          const existing = s.data.nutrition.waterLog.find((w) => w.date === today);
          const waterLog = existing
            ? s.data.nutrition.waterLog.map((w) => w.date === today ? { ...w, glasses: w.glasses + glasses } : w)
            : [...s.data.nutrition.waterLog, { date: today, glasses }];
          return { data: { ...s.data, nutrition: { ...s.data.nutrition, waterLog } } };
        }),

      // ---- Toasts ----
      addToast: (toast) =>
        set((s) => ({ toasts: [...s.toasts, { ...toast, id: Date.now().toString() }] })),

      dismissToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      // ---- Data ----
      resetAllData: () =>
        set({
          data: {
            profile: defaultProfile,
            notifications: defaultNotifications,
            creature: defaultCreature,
            money: defaultMoney,
            fitness: defaultFitness,
            nutrition: defaultNutrition,
            streaks: defaultStreaks,
            xpHistory: [],
          },
          toasts: [],
        }),

      loadData: () => {
        // Apply creature decay on load
        const state = get();
        if (state.data.profile.setupComplete) {
          set({ data: { ...state.data, creature: applyDecay(state.data.creature) } });
        }
      },
    }),
    {
      name: 'lcc-v3-storage',
      partialize: (state) => ({ data: state.data }),
    }
  )
);
