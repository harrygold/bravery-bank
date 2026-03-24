import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Channel ID for Android (must match app.json defaultChannel or be set explicitly)
const DAILY_REMINDER_CHANNEL_ID = 'daily-reminder';

// Identifier for our daily notification so we can cancel it
const DAILY_REMINDER_IDENTIFIER = 'bravery-bank-daily-reminder';

// PRD: rotate 2-3 variants for the daily notification body
const DAILY_MESSAGE_BODIES = [
  "Today's tiny brave moment is waiting for you.",
  "A small act of courage goes a long way.",
  "Ready for today's challenge? You've got this.",
  "One brave thing. That's all it takes.",
  "Your courage challenge for today is here.",
  "Bravery doesn't have to be loud. Start small today.",
  "Hey — today's challenge is a good one.",
  "A little courage, right on time.",
  "Your daily dose of brave is ready.",
  "Small steps still count. Today's challenge is here.",
  "Something brave is waiting for you today.",
  "You showed up. That's already brave. Now check today's challenge.",
  "Courage is a muscle. Time for today's rep.",
  "Your next brave moment is ready when you are.",
  "Open the app. One challenge. That's it.",
];

/**
 * Set how notifications are presented when the app is in the foreground.
 * Without this, notifications may not show when the app is open.
 */
export function setNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Ensure the Android notification channel exists (required before scheduling on Android 8+).
 */
export async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(DAILY_REMINDER_CHANNEL_ID, {
    name: 'Daily Reminder',
    description: 'Gentle daily reminder for your Bravery Bank challenge',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2A9D8F',
  });
}

/**
 * Request notification permission. Returns true if granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  await ensureNotificationChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Check if we have notification permission.
 */
export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Parse time string "HH:MM" (24h) into { hour, minute }.
 */
function parseTime(timeStr: string): { hour: number; minute: number } {
  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = parseInt(hourStr ?? '9', 10);
  const minute = parseInt(minuteStr ?? '0', 10);
  return { hour: Math.min(23, Math.max(0, hour)), minute: Math.min(59, Math.max(0, minute)) };
}

/**
 * Get a rotated daily message body (based on day of year so it's consistent per day).
 */
function getDailyMessageBody(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % DAILY_MESSAGE_BODIES.length;
  return DAILY_MESSAGE_BODIES[index] ?? DAILY_MESSAGE_BODIES[0];
}

/**
 * Schedule the daily reminder at the given time (e.g. "09:00").
 * Cancels any existing daily reminder first.
 */
export async function scheduleDailyReminder(timeStr: string): Promise<boolean> {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  await ensureNotificationChannel();

  // Cancel any existing daily reminder
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_IDENTIFIER);

  const { hour, minute } = parseTime(timeStr);

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_IDENTIFIER,
    content: {
      title: 'Bravery Bank',
      body: getDailyMessageBody(),
      channelId: DAILY_REMINDER_CHANNEL_ID,
      ...(Platform.OS === 'android' && { color: '#2A9D8F' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: DAILY_REMINDER_CHANNEL_ID,
    },
  });

  return true;
}

/**
 * Cancel the daily reminder.
 */
export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_IDENTIFIER);
}

/**
 * Send a one-off test notification (for "Send test notification" in Settings).
 */
export async function sendTestNotification(): Promise<boolean> {
  const granted = await hasNotificationPermission();
  if (!granted) return false;

  await ensureNotificationChannel();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Bravery Bank',
      body: "This is a test. Your daily reminder is set.",
      channelId: DAILY_REMINDER_CHANNEL_ID,
      ...(Platform.OS === 'android' && { color: '#2A9D8F' }),
    },
    trigger: null, // show immediately
  });

  return true;
}
