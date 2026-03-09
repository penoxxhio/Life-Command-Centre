import { create } from 'zustand';
import type { AppData, GardenActionType, GardenReward } from '@/types';
import { loadAppData, saveAppData, generateId } from '@/services/storageService';
import { processGardenAction, processGardenDailyDecay } from '@/services/gardenService';
import { recordActivity } from '@/services/streakService';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface AppStore {
  data: AppData;
  isLoaded: boolean;
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
  loadData: () => void;
  updateData: (partial: Partial<AppData>) => void;
  updateMoney: (partial: Partial<AppData['money']>) => void;
  updateFitness: (partial: Partial<AppData['fitness']>) => void;
  updateNutrition: (partial: Partial<AppData['nutrition']>) => void;
  updateGarden: (partial: Partial<AppData['garden']>) => void;
  updateProfile: (partial: Partial<AppData['profile']>) => void;
  updateNotifications: (partial: Partial<AppData['notifications']>) => void;
  setData: (data: AppData) => void;
  performGardenAction: (actionType: GardenActionType) => GardenReward | null;
  applyGardenDecay: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  data: loadAppData(),
  isLoaded: false,
  toasts: [],

  addToast: (type, message, duration) => {
    const toast: ToastItem = { id: generateId(), type, message, duration };
    set((state) => ({ toasts: [...state.toasts, toast] }));
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  loadData: () => {
    const data = loadAppData();
    set({ data, isLoaded: true });
  },

  updateData: (partial) => {
    set((state) => {
      const newData = { ...state.data, ...partial };
      saveAppData(newData);
      return { data: newData };
    });
  },

  updateMoney: (partial) => {
    set((state) => {
      const newData = {
        ...state.data,
        money: { ...state.data.money, ...partial },
      };
      saveAppData(newData);
      return { data: newData };
    });
  },

  updateFitness: (partial) => {
    set((state) => {
      const newData = {
        ...state.data,
        fitness: { ...state.data.fitness, ...partial },
      };
      saveAppData(newData);
      return { data: newData };
    });
  },

  updateNutrition: (partial) => {
    set((state) => {
      const newData = {
        ...state.data,
        nutrition: { ...state.data.nutrition, ...partial },
      };
      saveAppData(newData);
      return { data: newData };
    });
  },

  updateGarden: (partial) => {
    set((state) => {
      const newData = {
        ...state.data,
        garden: { ...state.data.garden, ...partial },
      };
      saveAppData(newData);
      return { data: newData };
    });
  },

  updateProfile: (partial) => {
    set((state) => {
      const newData = {
        ...state.data,
        profile: { ...state.data.profile, ...partial },
      };
      saveAppData(newData);
      return { data: newData };
    });
  },

  updateNotifications: (partial) => {
    set((state) => {
      const newData = {
        ...state.data,
        notifications: { ...state.data.notifications, ...partial },
      };
      saveAppData(newData);
      return { data: newData };
    });
  },

  setData: (data) => {
    saveAppData(data);
    set({ data });
  },

  performGardenAction: (actionType) => {
    const state = get();
    const { garden, reward } = processGardenAction(state.data.garden, actionType);
    const newData = { ...state.data, garden };
    saveAppData(newData);
    set({ data: newData });
    recordActivity();
    return reward;
  },

  applyGardenDecay: () => {
    const state = get();
    const garden = processGardenDailyDecay(state.data.garden);
    if (garden !== state.data.garden) {
      const newData = { ...state.data, garden };
      saveAppData(newData);
      set({ data: newData });
    }
  },
}));
