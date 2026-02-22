
export const getNotificationPermissionStatus = (): string => {
    if (typeof window === 'undefined') return 'unsupported';
    const NotificationAPI = (window as any)['Notification'];
    if (!NotificationAPI) return 'unsupported';
    return NotificationAPI.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
    try {
        if (typeof window === 'undefined') return false;
        
        const NotificationAPI = (window as any)['Notification'];
        
        if (!NotificationAPI) {
            console.warn("Notifications not supported in this environment.");
            return false;
        }
        
        if (NotificationAPI.permission === 'granted') return true;
        
        // Some browsers require a user gesture, which this should be called from
        const permission = await NotificationAPI.requestPermission();
        return permission === 'granted';
    } catch (e) {
        console.error("Error requesting notification permission:", e);
        return false;
    }
};

export const sendNotification = (title: string, body: string) => {
    try {
        if (typeof window === 'undefined') return;
        
        const NotificationAPI = (window as any)['Notification'];
        if (!NotificationAPI) return;

        if (NotificationAPI.permission === 'granted') {
            const n = new NotificationAPI(title, {
                body,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%230D1117"/><path d="M30 30 L70 30 L70 70 L30 70 Z" stroke="%232EA043" stroke-width="8" fill="none" rx="8"/><circle cx="50" cy="50" r="10" fill="%232EA043"/></svg>',
                tag: 'life-command-reminder',
                renotify: true
            });
            
            n.onclick = () => {
                window.focus();
                n.close();
            };
        } else {
            console.warn("Notification permission not granted. Current status:", NotificationAPI.permission);
        }
    } catch (e) {
        console.error("Failed to send notification:", e);
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
        try {
            const now = new Date();
            const hour = now.getHours();
            const min = now.getMinutes();
            const day = now.getDay(); // 0 = Sunday
            const todayStr = now.toDateString();

            // 1. Standard Logging Reminders (Daily)
            const target = REMINDER_TIMES.find(t => t.hour === hour);
            if (target && min < 5) { // 5 minute window
                const key = `notified_log_${todayStr}_${target.id}`;
                if (!localStorage.getItem(key)) {
                    sendNotification("Time to Log", "Update your meals, workouts, or spend for the day.");
                    localStorage.setItem(key, 'true');
                }
            }

            // 2. Sunday Health Data Reminder (Weekly)
            if (day === 0 && hour === 10 && min < 5) {
                const key = `notified_sunday_sync_${todayStr}`;
                if (!localStorage.getItem(key)) {
                    sendNotification("Weekly Sync", "Don't forget to re-upload your health data from Apple Health / Whoop.");
                    localStorage.setItem(key, 'true');
                }
            }

            // 3. Periodic Backup Reminder (Every 3 Days)
            if (hour === 11 && min < 5) {
                const lastBackupStr = localStorage.getItem('last_backup_timestamp');
                const lastBackupNotifiedStr = localStorage.getItem('last_backup_notified_date');
                
                if (lastBackupNotifiedStr !== todayStr) {
                    let shouldNotify = false;
                    if (!lastBackupStr) {
                        shouldNotify = true;
                    } else {
                        const lastBackupDate = new Date(lastBackupStr);
                        const daysSinceBackup = (now.getTime() - lastBackupDate.getTime()) / (1000 * 3600 * 24);
                        if (daysSinceBackup >= 3) {
                            shouldNotify = true;
                        }
                    }

                    if (shouldNotify) {
                        sendNotification("Safety First", "It's been a few days. Time to export a backup of your Life Command data.");
                        localStorage.setItem('last_backup_notified_date', todayStr);
                    }
                }
            }
        } catch (err) {
            console.error("Notification loop error", err);
        }
    }, CHECK_INTERVAL);
};
