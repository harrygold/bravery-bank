import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key
const STORAGE_KEY = 'bravery_bank_data';

/** One calendar day the user chose "I Did It" and which challenge it was. */
export interface CompletedDateEntry {
  date: string; // YYYY-MM-DD
  /** Challenge index for that completion; -1 = legacy data (unknown challenge). */
  challengeIndex: number;
}

// Data structure based on PRD section 9.2
export interface BraveryBankData {
  totalBraveDays: number;
  lastActivityDate: string; // ISO date string "YYYY-MM-DD"
  lastChallengeIndex: number;
  todayStatus: 'completed' | 'rested' | 'none';
  completedDates: CompletedDateEntry[];
  createdAt: string; // ISO datetime string
  // Settings
  darkMode: boolean | null; // null = follow system
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  notificationTime: string; // "HH:MM" format
  // Onboarding
  hasCompletedOnboarding: boolean;
  hasSeenReminderPrompt: boolean;
  hasCompletedFirstCycle: boolean;
  hasSeenCelebration: boolean;
}

// Default data for new users
export const getDefaultData = (): BraveryBankData => ({
  totalBraveDays: 0,
  lastActivityDate: getTodayString(),
  lastChallengeIndex: 0,
  todayStatus: 'none',
  completedDates: [],
  createdAt: new Date().toISOString(),
  darkMode: null,
  hapticsEnabled: true,
  notificationsEnabled: false,
  notificationTime: '09:00',
  hasCompletedOnboarding: false,
  hasSeenReminderPrompt: false,
  hasCompletedFirstCycle: false,
  hasSeenCelebration: false,
});

// Get today's date as YYYY-MM-DD string
export const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculate days between two date strings
export const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Load data from AsyncStorage
export const loadData = async (): Promise<BraveryBankData> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue !== null) {
      const data = JSON.parse(jsonValue) as BraveryBankData;
      // Backfill: completedDates used to be string[]; migrate to { date, challengeIndex }[]
      if (!Array.isArray(data.completedDates)) {
        data.completedDates = [];
      } else if (
        data.completedDates.length > 0 &&
        typeof (data.completedDates as unknown[])[0] === 'string'
      ) {
        data.completedDates = (data.completedDates as unknown as string[]).map(
          (date) => ({ date, challengeIndex: -1 })
        );
      }
      // Backfill: existing users who haven't seen onboarding flag get true (skip onboarding)
      if (data.hasCompletedOnboarding === undefined) {
        data.hasCompletedOnboarding = true;
      }
      // Backfill: existing users who already completed onboarding don't see reminder prompt again
      if (data.hasSeenReminderPrompt === undefined) {
        data.hasSeenReminderPrompt = true;
      }
      // Backfill: new field defaults to false so we can show the post-50 welcome once.
      if (data.hasCompletedFirstCycle === undefined) {
        data.hasCompletedFirstCycle = false;
      }
      // Backfill: celebration should show once when reaching #50.
      if (data.hasSeenCelebration === undefined) {
        data.hasSeenCelebration = false;
      }
      return data;
    }
    return getDefaultData();
  } catch (error) {
    if (__DEV__) console.error('Error loading data:', error);
    return getDefaultData();
  }
};

// Save data to AsyncStorage
export const saveData = async (data: BraveryBankData): Promise<boolean> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    return true;
  } catch (error) {
    if (__DEV__) console.error('Error saving data:', error);
    return false;
  }
};

// Clear all data (for reset functionality)
export const clearData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    if (__DEV__) console.error('Error clearing data:', error);
    return false;
  }
};

// Get the current week (Sunday to Saturday) as an array of date strings
// American calendar format: week starts on Sunday
export const getCurrentWeekDays = (): string[] => {
  const days: string[] = [];
  const today = new Date();
  
  // Find the Sunday of the current week
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  
  // Generate all 7 days of the week (Sun, Mon, Tue, Wed, Thu, Fri, Sat)
  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    days.push(`${year}-${month}-${d}`);
  }
  
  return days;
};

// Legacy function for backwards compatibility
export const getLast7Days = (): string[] => {
  return getCurrentWeekDays();
};

// Check if a date is in the completed dates array
export const isDateCompleted = (
  date: string,
  completedDates: CompletedDateEntry[]
): boolean => {
  return completedDates.some((entry) => entry.date === date);
};
