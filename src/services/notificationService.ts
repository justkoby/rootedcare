import { Platform } from 'react-native';

let Notifications: any = null;

try {
  Notifications = require('expo-notifications');
} catch {
  // expo-notifications not available — notifications disabled
}

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestPermissions(): Promise<boolean> {
  if (!Notifications || Platform.OS === 'web') return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleDailyReminder(
  id: string,
  label: string,
  hour: number,
  minute: number,
): Promise<string> {
  if (!Notifications) return '';
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return '';

    await Notifications.cancelScheduledNotificationAsync(id);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌿 RootedCare Reminder',
        body: `Time for: ${label}`,
        data: { reminderId: id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes?.DAILY || 'daily',
        hour,
        minute,
      },
      identifier: id,
    });

    return notificationId;
  } catch {
    return '';
  }
}

export async function cancelReminder(id: string): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // silently fail
  }
}

export async function cancelAllReminders(): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // silently fail
  }
}
