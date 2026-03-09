import type { AppData } from '@/types';
import { createInitialAppData, STORAGE_KEYS } from '@/constants';

export const loadAppData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_DATA);
    if (raw) {
      return JSON.parse(raw) as AppData;
    }
  } catch (e) {
    console.error('Failed to load app data:', e);
  }
  return createInitialAppData();
};

export const saveAppData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save app data:', e);
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const exportData = (): string => {
  const data = loadAppData();
  return JSON.stringify(data, null, 2);
};

export const importData = (json: string): AppData | null => {
  try {
    return JSON.parse(json) as AppData;
  } catch {
    return null;
  }
};
