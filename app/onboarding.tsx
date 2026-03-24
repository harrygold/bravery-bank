import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTodayString, loadData, saveData } from '@/utils/storage';

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
  const { hasSeenReminder } = useLocalSearchParams<{ hasSeenReminder?: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const [step, setStep] = useState<1 | 2>(1);
  const [reminderTime, setReminderTime] = useState<Date>(() =>
    timeStringToDate('09:00')
  );
  const [saving, setSaving] = useState(false);
  // On Android the default picker is a dialog; only show it when user taps "Remind me at X"
  const [showTimePicker, setShowTimePicker] = useState(false);
  // If false, user has already seen the reminder prompt — "I'm Ready" goes straight to tabs
  const [showReminderStep, setShowReminderStep] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [screenReady, setScreenReady] = useState(false);
  const [welcomeButtonText, setWelcomeButtonText] = useState("I'm Ready");

  useEffect(() => {
    setScreenReady(false);
    const seen = hasSeenReminder === '1';

    // Load today status so we can render the correct primary button label without flashing.
    loadData().then((data) => {
      const today = getTodayString();
      const isNewDay = data.lastActivityDate !== today;
      const resolvedToday =
        !isNewDay &&
        (data.todayStatus === 'completed' || data.todayStatus === 'rested');

      setWelcomeButtonText(resolvedToday ? "See how I'm doing" : "I'm Ready");
      setShowReminderStep(!seen);
      setDataLoaded(true);
      setScreenReady(true);
    });
  }, [hasSeenReminder]);

  const finishOnboarding = async (enableReminder: boolean) => {
    setSaving(true);
    try {
      const data = await loadData();
      const timeStr = dateToTimeString(reminderTime);
      let notificationsEnabled = false;

      if (enableReminder && !isExpoGo) {
        const { scheduleDailyReminder } = await import('@/utils/notifications');
        const granted = await scheduleDailyReminder(timeStr);
        if (granted) {
          notificationsEnabled = true;
        } else {
          // Permission denied — still finish onboarding, but let user know
          notificationsEnabled = false;
          Alert.alert(
            'Notifications blocked',
            "It looks like notifications are turned off in your phone's settings. You can enable them later in your phone's Settings app to get daily reminders."
          );
        }
      } else if (enableReminder && isExpoGo) {
        // In Expo Go we can't schedule; save preference for when they build
        notificationsEnabled = true;
      }

      const updated = {
        ...data,
        hasCompletedOnboarding: true,
        hasSeenReminderPrompt: true,
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

  if (!screenReady) {
    return (
      <View style={styles.welcomeContainer}>
        <ActivityIndicator size="large" color="#2A9D8F" />
      </View>
    );
  }

  // Step 1: Welcome — bold type high on screen, Blur mascot below
  if (step === 1) {
    return (
      <View style={styles.welcomeContainer}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeTextBlock}>
              <ThemedText style={styles.appName} lightColor="#FFFFFF" darkColor="#FFFFFF" includeFontPadding={false}>
                Bravery Bank
              </ThemedText>
              <ThemedText style={styles.tagline} lightColor="#FFFFFF" darkColor="#FFFFFF">
                One tiny act of courage, every day
              </ThemedText>
              <ThemedText style={styles.privacyOnWelcome} lightColor="rgba(255,255,255,0.6)" darkColor="rgba(255,255,255,0.6)">
                No email. No password. No cloud. Just you.
              </ThemedText>
            </View>
            <View style={styles.mascotWrap}>
              <Image
                source={require('@/assets/images/mascot/blur-excited.png')}
                style={styles.mascotImage}
                resizeMode="contain"
                accessibilityLabel="Blur the mascot, excited"
              />
            </View>
          </View>
          <View style={styles.footer}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: ACCENT_COLOR }]}
              onPress={async () => {
                if (!dataLoaded) return;
                if (showReminderStep) {
                  setStep(2);
                } else {
                  const data = await loadData();
                  await saveData({ ...data, hasCompletedOnboarding: true });
                  router.replace('/(tabs)');
                }
              }}
            >
              <ThemedText style={styles.primaryButtonText}>{welcomeButtonText}</ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Step 2: Daily reminder — dark theme, sleeping Blur mascot (concept-inspired)
  return (
    <View style={styles.reminderContainer}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.reminderContent}>
          <View style={styles.reminderTextBlock}>
          <ThemedText style={styles.reminderTitle} lightColor="#FFFFFF" darkColor="#FFFFFF">
            Want a daily reminder?
            </ThemedText>
            <ThemedText style={styles.reminderSubline} lightColor="rgba(255,255,255,0.9)" darkColor="rgba(255,255,255,0.9)">
                One quiet nudge, once a day.
            </ThemedText>
          </View>
          {Platform.OS === 'android' ? (
            <>
              <Pressable
                style={styles.timeRow}
                onPress={() => setShowTimePicker(true)}
              >
                <ThemedText style={styles.timeRowLabel} lightColor="#FFFFFF" darkColor="#FFFFFF">
                  Remind me at
                </ThemedText>
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
            <View style={styles.pickerWrap}>
              <DateTimePicker
                value={reminderTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
              />
            </View>
          )}
          <View style={styles.reminderMascotWrap}>
            <Image
              source={require('@/assets/images/mascot/blur-resting.png')}
              style={styles.reminderMascotImage}
              resizeMode="contain"
              accessibilityLabel="Blur the mascot, resting"
            />
          </View>
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
            <ThemedText style={[styles.secondaryButtonText, styles.secondaryButtonTextOnDark]}>
              Not now
            </ThemedText>
          </Pressable>
          <ThemedText style={styles.hintOnDark} lightColor="rgba(255,255,255,0.5)" darkColor="rgba(255,255,255,0.5)">
            You can always change this in Settings or turn it off anytime.
          </ThemedText>
        </View>
      </SafeAreaView>
    </View>
  );
}

// Dark gradient-like background for welcome + reminder steps (concept: deep purple–blue)
const WELCOME_BG = '#1a1a2e';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reminderContainer: {
    flex: 1,
    backgroundColor: WELCOME_BG,
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: WELCOME_BG,
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
  reminderContent: {
    flex: 1,
    paddingTop: 64,
    alignItems: 'center',
  },
  reminderTextBlock: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeContent: {
    flex: 1,
    paddingTop: 64,
    alignItems: 'center',
  },
  welcomeTextBlock: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 48,
    letterSpacing: 0.5,
    paddingVertical: 4,
    marginBottom: 14,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.95,
  },
  privacyOnWelcome: {
    fontSize: 14,
    textAlign: 'center',
  },
  privacy: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  mascotWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    marginTop: 24,
  },
  mascotImage: {
    width: 240,
    height: 240,
  },
  reminderTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 34,
  },
  reminderSubline: {
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
  },
  reminderMascotWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    marginTop: 40,
  },
  reminderMascotImage: {
    width: 340,
    height: 340,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(42, 157, 143, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(42, 157, 143, 0.4)',
  },
  timeRowLabel: {
    fontSize: 17,
    fontWeight: '400',
  },
  timeRowValue: {
    fontSize: 17,
    fontWeight: '600',
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
  hintOnDark: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 12,
  },
  secondaryButtonTextOnDark: {
    fontSize: 17,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    opacity: 1,
  },
  footer: {
    paddingBottom: 48,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  primaryButton: {
    alignSelf: 'stretch',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '500',
    opacity: 0.9,
  },
});
