import { HealthImportData, HealthDayData } from '../types';

const STORAGE_KEY = 'health_import_data';

export function saveHealthImport(data: HealthImportData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      throw new Error("Storage Limit Exceeded: The health data is too large to save in this browser. Please try importing a smaller date range (e.g., 90 days).");
    }
    throw e;
  }
}

export function getHealthImport(): HealthImportData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearHealthImport(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getHealthDay(date: string): HealthDayData | null {
  const data = getHealthImport();
  if (!data) return null;
  return data.days.find(d => d.date === date) || null;
}

export function getHealthDays(count: number): HealthDayData[] {
  const data = getHealthImport();
  if (!data) return [];
  return data.days.slice(0, count);
}

export function getLatestSleep(): { inBedHours: number; asleepHours: number; date: string } | null {
  const data = getHealthImport();
  if (!data) return null;
  const day = data.days.find(d => d.sleep !== null);
  if (!day || !day.sleep) return null;
  return { ...day.sleep, date: day.date };
}

export function getImportedWorkouts(daysBack: number = 7): Array<{
  type: string; duration: number; calories: number; source: string; date: string; strain: number | null; avgHR: number | null;
}> {
  const days = getHealthDays(daysBack);
  const workouts: Array<any> = [];
  for (const day of days) {
    if (day.workouts) {
      for (const w of day.workouts) { workouts.push(w); }
    }
  }
  return workouts;
}