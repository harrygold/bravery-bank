import { getChallenge, getTotalChallenges } from '@/data/challenges';
import {
  BraveryBankData,
  clearData,
  getDefaultData,
  getTodayString,
  loadData,
  saveData,
} from '@/utils/storage';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';

export interface BraveryBankValue {
  isLoading: boolean;
  braveDays: number;
  todayChallenge: string;
  todayStatus: 'completed' | 'rested' | 'none';
  completedDates: string[];
  hapticsEnabled: boolean;
  completeToday: () => Promise<void>;
  restToday: () => Promise<void>;
  returnToChallenge: () => Promise<void>;
  resetAllData: () => Promise<void>;
  skipToNextChallenge: () => Promise<void>;
  challengeIndex: number;
}

const BraveryBankContext = React.createContext<BraveryBankValue | null>(null);

export function BraveryBankProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BraveryBankData>(getDefaultData());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const storedData = await loadData();
        const today = getTodayString();

        if (storedData.lastActivityDate !== today) {
          // Missed days still advance by exactly 1 challenge so the user
          // always picks up next in sequence (wraps after #50).
          const newChallengeIndex =
            (storedData.lastChallengeIndex + 1) % getTotalChallenges();
          const updatedData: BraveryBankData = {
            ...storedData,
            lastActivityDate: today,
            lastChallengeIndex: newChallengeIndex,
            todayStatus: 'none',
          };
          await saveData(updatedData);
          setData(updatedData);
        } else {
          setData(storedData);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const completeToday = useCallback(async () => {
    if (data.todayStatus === 'completed') return;

    if (data.hapticsEnabled) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // ignore
      }
    }

    const today = getTodayString();
    const freshData = await loadData();
    const updatedData: BraveryBankData = {
      ...freshData,
      totalBraveDays: freshData.totalBraveDays + 1,
      todayStatus: 'completed',
      completedDates: [...freshData.completedDates, today],
    };

    const saved = await saveData(updatedData);
    if (saved) setData(updatedData);
  }, [data]);

  const restToday = useCallback(async () => {
    if (data.todayStatus !== 'none') return;

    const freshData = await loadData();
    const updatedData: BraveryBankData = {
      ...freshData,
      todayStatus: 'rested',
    };

    const saved = await saveData(updatedData);
    if (saved) setData(updatedData);
  }, [data]);

  const returnToChallenge = useCallback(async () => {
    if (data.todayStatus !== 'rested') return;

    const freshData = await loadData();
    const updatedData: BraveryBankData = {
      ...freshData,
      todayStatus: 'none',
    };

    const saved = await saveData(updatedData);
    if (saved) setData(updatedData);
  }, [data]);

  const skipToNextChallenge = useCallback(async () => {
    const total = getTotalChallenges();
    const freshData = await loadData();
    const nextIndex = (freshData.lastChallengeIndex + 1) % total;
    const updatedData: BraveryBankData = {
      ...freshData,
      lastChallengeIndex: nextIndex,
      todayStatus: 'none',
    };

    const saved = await saveData(updatedData);
    if (saved) setData(updatedData);
  }, [data]);

  const resetAllData = useCallback(async () => {
    const cleared = await clearData();
    if (cleared) {
      const freshData = getDefaultData();
      await saveData(freshData);
      setData(freshData);
    }
  }, []);

  const value: BraveryBankValue = {
    isLoading,
    braveDays: data.totalBraveDays,
    todayChallenge: getChallenge(data.lastChallengeIndex),
    todayStatus: data.todayStatus,
    completedDates: data.completedDates,
    hapticsEnabled: data.hapticsEnabled,
    completeToday,
    restToday,
    returnToChallenge,
    resetAllData,
    skipToNextChallenge,
    challengeIndex: data.lastChallengeIndex,
  };

  return (
    <BraveryBankContext.Provider value={value}>
      {children}
    </BraveryBankContext.Provider>
  );
}

export function useBraveryBankContext(): BraveryBankValue {
  const ctx = React.useContext(BraveryBankContext);
  if (!ctx) throw new Error('useBraveryBankContext must be used within BraveryBankProvider');
  return ctx;
}
