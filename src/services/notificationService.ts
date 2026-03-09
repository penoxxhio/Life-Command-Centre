import type { NotificationSettings } from '@/types';

export const initNotifications = (_settings: NotificationSettings): void => {
  // Placeholder - notification service to be implemented
};

export const requestPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};
