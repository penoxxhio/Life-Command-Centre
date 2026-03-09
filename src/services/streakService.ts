import { STORAGE_KEYS } from '@/constants';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

const getToday = (): string => new Date().toISOString().split('T')[0];

export const getStreak = (): StreakData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
};

export const recordActivity = (): void => {
  const today = getToday();
  const streak = getStreak();
  if (streak.lastActiveDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newStreak = streak.lastActiveDate === yesterdayStr
    ? streak.currentStreak + 1
    : 1;

  const data: StreakData = {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, streak.longestStreak),
    lastActiveDate: today,
  };
  localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(data));
};
