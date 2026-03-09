import { GEMINI_DAILY_LIMIT, STORAGE_KEYS } from '@/constants';

interface AiUsage {
  count: number;
  date: string;
  remaining: number;
}

export const isAiReady = (): boolean => {
  return !!localStorage.getItem('gemini_api_key');
};

export const getAiUsage = (): AiUsage => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GEMINI_USAGE);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.date === today) {
        return { ...data, remaining: GEMINI_DAILY_LIMIT - data.count };
      }
    }
  } catch {}
  return { count: 0, date: today, remaining: GEMINI_DAILY_LIMIT };
};

export const setApiKey = (key: string): void => {
  localStorage.setItem('gemini_api_key', key);
};

export const getApiKey = (): string | null => {
  return localStorage.getItem('gemini_api_key');
};
