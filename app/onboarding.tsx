import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { loadData, saveData } from '@/utils/storage';

const ACCENT_COLOR = '#2A9D8F';
const isExpoGo = Constants.appOwnership === 'expo';

// Parse "HH:MM" to Date (today at that time)
const timeStringToDate = (time24: string): Date => {
  const [hourStr, minuteStr] = time24.split(':');
  const hour = parseInt(hourStr ?? '9', 10);
  const minute = parseInt(minuteStr ?? '0', 10);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
};

const dateToTimeString = (date: Date): string => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// e.g. "9:00 AM" for display
const formatTimeForDisplay = (date: Date): string => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const am = hour < 12;
  const h = hour % 12 || 12;
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m} ${am ? 'AM' : 'PM'}`;
};

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const [step, setStep] = useState<1 | 2>(1);
  const [reminderTime, setReminderTime] = useState<Date>(() =>
    timeStringToDate('09:00')
  );
  const [saving, setSaving] = useState(false);
  // On Android the default picker is a dialog; only show it when user taps "Remind me at X"
  const [showTimePicker, setShowTimePicker] = useState(false);

  const finishOnboarding = async (enableReminder: boolean) => {
    setSaving(true);
    try {
      const data = await loadData();
      const timeStr = dateToTimeString(reminderTime);
      let notificationsEnabled = false;

      if (enableReminder && !isExpoGo) {
        const { scheduleDailyReminder } = await import('@/utils/notifications');
        notificationsEnabled = await scheduleDailyReminder(timeStr);
      } else if (enableReminder && isExpoGo) {
        // In Expo Go we can't schedule; save preference for when they build
        notificationsEnabled = true;
      }

      const updated = {
        ...data,
        hasCompletedOnboarding: true,
        notificationsEnabled,
        notificationTime: timeStr,
      };
      await saveData(updated);

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error finishing onboarding:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReminderYes = () => finishOnboarding(true);
  const handleReminderNo = () => finishOnboarding(false);

  const handleTimeChange = (event: { type: string }, date?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (date) setReminderTime(date);
  };

  // Step 1: Welcome
  if (step === 1) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.content}>
            <ThemedText style={styles.appName} includeFontPadding={false}>
              Bravery Bank
            </ThemedText>
            <ThemedText style={styles.tagline}>
              One tiny act of courage, every day
            </ThemedText>
            <ThemedText style={styles.privacy}>
              No email. No password. No cloud. Just you.
            </ThemedText>
          </View>
          <View style={styles.footer}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: ACCENT_COLOR }]}
              onPress={() => setStep(2)}
            >
              <ThemedText style={styles.primaryButtonText}>I'm Ready</ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Step 2: Daily reminder
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <ThemedText style={styles.reminderTitle}>
            Would you like a gentle daily reminder?
          </ThemedText>
          {Platform.OS === 'android' ? (
            <>
              <ThemedText style={styles.reminderSubline}>
                Pick a time that works for you. We’ll send one quiet reminder each day.
              </ThemedText>
              <Pressable
                style={styles.timeRow}
                onPress={() => setShowTimePicker(true)}
              >
                <ThemedText style={styles.timeRowLabel}>Remind me at</ThemedText>
                <ThemedText style={styles.timeRowValue}>
                  {formatTimeForDisplay(reminderTime)}
                </ThemedText>
              </Pressable>
              {showTimePicker && (
                <DateTimePicker
                  value={reminderTime}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </>
          ) : (
            <>
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={reminderTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                />
              </View>
              <ThemedText style={styles.hint}>
                You can always change this in Settings or turn it off anytime.
              </ThemedText>
            </>
          )}
        </View>
        <View style={styles.footer}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: ACCENT_COLOR }]}
            onPress={handleReminderYes}
            disabled={saving}
          >
            <ThemedText style={styles.primaryButtonText}>
              {saving ? '…' : 'Yes, remind me'}
            </ThemedText>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={handleReminderNo}
            disabled={saving}
          >
            <ThemedText style={styles.secondaryButtonText}>Not now</ThemedText>
          </Pressable>
          {Platform.OS === 'android' && (
            <ThemedText style={styles.hintAndroid}>
              You can always change this in Settings or turn it off anytime.
            </ThemedText>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 48,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    paddingVertical: 4,
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  privacy: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  reminderTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 30,
  },
  reminderSubline: {
    fontSize: 15,
    opacity: 0.85,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(42, 157, 143, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(42, 157, 143, 0.4)',
  },
  timeRowLabel: {
    fontSize: 16,
    opacity: 0.9,
  },
  timeRowValue: {
    fontSize: 18,
    fontWeight: '700',
    color: ACCENT_COLOR,
  },
  pickerWrap: {
    marginBottom: 16,
  },
  hint: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
  },
  hintAndroid: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    paddingBottom: 48,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 16,
    opacity: 0.7,
  },
});
