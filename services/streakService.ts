
const STREAK_KEY = 'life-command-streak';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
}

const getToday = (): string => new Date().toISOString().split('T')[0];

const getYesterday = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export const getStreakData = (): StreakData => {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) {
      const data: StreakData = JSON.parse(raw);
      const today = getToday();
      const yesterday = getYesterday();

      // If last active was before yesterday, streak is broken
      if (data.lastActiveDate !== today && data.lastActiveDate !== yesterday) {
        return { currentStreak: 0, longestStreak: data.longestStreak, lastActiveDate: data.lastActiveDate };
      }
      return data;
    }
  } catch (e) {
    console.error('Failed to load streak data', e);
  }
  return { currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
};

export const recordActivity = (): void => {
  const today = getToday();
  const data = getStreakData();

  // Already recorded today
  if (data.lastActiveDate === today) return;

  const yesterday = getYesterday();
  let newStreak: number;

  if (data.lastActiveDate === yesterday) {
    // Continuing the streak
    newStreak = data.currentStreak + 1;
  } else {
    // Starting fresh
    newStreak = 1;
  }

  const updated: StreakData = {
    currentStreak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastActiveDate: today
  };

  localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
};

export const isActiveToday = (): boolean => {
  const data = getStreakData();
  return data.lastActiveDate === getToday();
};
