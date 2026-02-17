import {
    BraveryBankData,
    clearData,
    getDefaultData,
    loadData,
    saveData,
} from '@/utils/storage';
import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';

const isExpoGo = Constants.appOwnership === 'expo';

interface UseSettingsReturn {
  isLoading: boolean;
  
  // Settings values
  darkMode: boolean | null; // null = follow system
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  notificationTime: string;
  
  // Actions
  setDarkMode: (value: boolean | null) => Promise<void>;
  setHapticsEnabled: (value: boolean) => Promise<void>;
  setNotificationsEnabled: (value: boolean) => Promise<void>;
  setNotificationTime: (value: string) => Promise<void>;
  resetAllData: () => Promise<void>;
  /** Re-read storage into state (e.g. after context resetAllData so UI matches). */
  refreshFromStorage: () => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const [data, setData] = useState<BraveryBankData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const init = async () => {
      try {
        const storedData = await loadData();
        setData(storedData);
      } catch (error) {
        console.error('Error loading settings:', error);
        setData(getDefaultData());
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Generic update function
  const updateSetting = useCallback(async <K extends keyof BraveryBankData>(
    key: K,
    value: BraveryBankData[K]
  ) => {
    if (!data) return;
    
    const updatedData: BraveryBankData = {
      ...data,
      [key]: value,
    };
    
    const saved = await saveData(updatedData);
    if (saved) {
      setData(updatedData);
    }
  }, [data]);

  const setDarkMode = useCallback(async (value: boolean | null) => {
    await updateSetting('darkMode', value);
  }, [updateSetting]);

  const setHapticsEnabled = useCallback(async (value: boolean) => {
    await updateSetting('hapticsEnabled', value);
  }, [updateSetting]);

  const setNotificationsEnabled = useCallback(async (value: boolean) => {
    if (!isExpoGo) {
      if (value && data) {
        const { scheduleDailyReminder } = await import('@/utils/notifications');
        const granted = await scheduleDailyReminder(data.notificationTime);
        if (!granted) return;
      } else {
        const { cancelDailyReminder } = await import('@/utils/notifications');
        await cancelDailyReminder();
      }
    }
    await updateSetting('notificationsEnabled', value);
  }, [updateSetting, data]);

  const setNotificationTime = useCallback(async (value: string) => {
    await updateSetting('notificationTime', value);
    if (!isExpoGo && data?.notificationsEnabled) {
      const { scheduleDailyReminder } = await import('@/utils/notifications');
      await scheduleDailyReminder(value);
    }
  }, [updateSetting, data]);

  const resetAllData = useCallback(async () => {
    const cleared = await clearData();
    if (cleared) {
      const freshData = getDefaultData();
      await saveData(freshData);
      setData(freshData);
    }
  }, []);

  const refreshFromStorage = useCallback(async () => {
    const storedData = await loadData();
    setData(storedData);
  }, []);

  return {
    isLoading,
    darkMode: data?.darkMode ?? null,
    hapticsEnabled: data?.hapticsEnabled ?? true,
    notificationsEnabled: data?.notificationsEnabled ?? false,
    notificationTime: data?.notificationTime ?? '09:00',
    setDarkMode,
    setHapticsEnabled,
    setNotificationsEnabled,
    setNotificationTime,
    resetAllData,
    refreshFromStorage,
  };
};
