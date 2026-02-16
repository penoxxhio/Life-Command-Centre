
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'granted') return true;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/icon.svg', // Assuming favicon or similar exists
            tag: 'life-command-reminder'
        });
    }
};

const CHECK_INTERVAL = 60 * 1000; // Check every minute
const REMINDER_TIMES = [
    { hour: 9, id: 'morning' }, 
    { hour: 13, id: 'midday' }, 
    { hour: 20, id: 'evening' }
];

let _initialized = false;

export const initNotificationService = () => {
    if (typeof window === 'undefined' || _initialized) return;
    _initialized = true;
    
    // Check loop
    setInterval(() => {
        const now = new Date();
        const hour = now.getHours();
        const min = now.getMinutes();

        // Check if we are in the first minute of a target hour
        // This is a simple logic. A more robust one would store "last notified" timestamp
        // in localStorage to avoid duplicates if tab is refreshed or multiple tabs open.
        
        const lastNotified = localStorage.getItem('last_notification_date');
        const todayStr = now.toDateString();

        // If we already notified for this specific time slot today, skip
        const target = REMINDER_TIMES.find(t => t.hour === hour);
        
        if (target && min < 5) { // 5 minute window
            const key = `notified_${todayStr}_${target.id}`;
            if (!localStorage.getItem(key)) {
                sendNotification("Time to Log", "Update your meals, workouts, or spend for the day.");
                localStorage.setItem(key, 'true');
            }
        }
    }, CHECK_INTERVAL);
};
