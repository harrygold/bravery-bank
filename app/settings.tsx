import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useBraveryBank } from '@/hooks/useBraveryBank';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettings } from '@/hooks/useSettings';

const isExpoGo = Constants.appOwnership === 'expo';

// App accent color - warm teal
const ACCENT_COLOR = '#2A9D8F';
const DANGER_COLOR = '#E07A5F';

const borderSubtle = (dark: boolean) => (dark ? '#2A3A3A' : '#E8E8E8');

// Format time string "HH:MM" to "H:MM AM/PM"
const formatTime12Hour = (time24: string): string => {
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  
  if (hour === 0) {
    hour = 12;
  } else if (hour > 12) {
    hour = hour - 12;
  }
  
  return `${hour}:${minute} ${ampm}`;
};

// Parse "HH:MM" to a Date (today at that time)
const timeStringToDate = (time24: string): Date => {
  const [hourStr, minuteStr] = time24.split(':');
  const hour = parseInt(hourStr ?? '9', 10);
  const minute = parseInt(minuteStr ?? '0', 10);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
};

// Format Date to "HH:MM"
const dateToTimeString = (date: Date): string => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const dividerColor = borderSubtle(colorScheme === 'dark');

  const { resetAllData: resetBraveryBank } = useBraveryBank();
  const {
    isLoading,
    hapticsEnabled,
    notificationsEnabled,
    notificationTime,
    setHapticsEnabled,
    setNotificationsEnabled,
    setNotificationTime,
    refreshFromStorage,
  } = useSettings();

  const [sendingTest, setSendingTest] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerValue, setTimePickerValue] = useState<Date>(() =>
    timeStringToDate('09:00')
  );

  const handleSendTestNotification = async () => {
    if (isExpoGo) {
      Alert.alert(
        'Expo Go',
        'Daily reminders work in a development or production build. In Expo Go, your setting is saved but reminders won\'t be sent until you build the app.'
      );
      return;
    }
    setSendingTest(true);
    try {
      const { sendTestNotification } = await import('@/utils/notifications');
      const sent = await sendTestNotification();
      if (sent) {
        Alert.alert('Sent', 'Check your notifications for the test.');
      } else {
        Alert.alert(
          'Permission needed',
          'Enable notifications in your phone\'s Settings to get daily reminders.'
        );
      }
    } catch {
      Alert.alert(
        'Permission needed',
        'Enable notifications in your phone\'s Settings to get daily reminders.'
      );
    } finally {
      setSendingTest(false);
    }
  };

  const handleTimePickerChange = (
    event: { type: string },
    date?: Date
  ) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (event.type === 'dismissed') return;
    if (date) {
      const timeStr = dateToTimeString(date);
      setNotificationTime(timeStr);
      setTimePickerValue(date);
    }
  };

  const openTimePicker = () => {
    setTimePickerValue(timeStringToDate(notificationTime));
    setShowTimePicker(true);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will erase all your progress and cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetBraveryBank();
            await refreshFromStorage();
            Alert.alert('Done', 'Your data has been reset.');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={20} color={ACCENT_COLOR} />
            <ThemedText style={[styles.backText, { color: ACCENT_COLOR }]}>
              Back
            </ThemedText>
          </Pressable>
          <ThemedText style={styles.title}>Settings</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* Settings Sections */}
        <View style={styles.content}>
          {/* Haptic Feedback */}
          <View style={[styles.settingRow, { borderBottomColor: dividerColor }]}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Haptic Feedback</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Vibrate when completing a challenge
              </ThemedText>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: '#767577', true: ACCENT_COLOR }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Theme */}
          <View style={[styles.settingRow, { borderBottomColor: dividerColor }]}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Theme</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Follows your system setting
              </ThemedText>
            </View>
            <ThemedText style={styles.settingValue}>
              {colorScheme === 'dark' ? 'Dark' : 'Light'}
            </ThemedText>
          </View>

          {/* Daily Reminder */}
          <View style={[styles.settingRow, { borderBottomColor: dividerColor }]}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Daily Reminder</ThemedText>
              <ThemedText style={styles.settingDescription}>
                {notificationsEnabled 
                  ? `Reminder at ${formatTime12Hour(notificationTime)}` 
                  : 'Get a gentle nudge each day'}
              </ThemedText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: ACCENT_COLOR }}
              thumbColor="#FFFFFF"
            />
          </View>

          {notificationsEnabled && (
            <Pressable
              style={[styles.timeRow, { borderBottomColor: dividerColor }]}
              onPress={openTimePicker}
            >
              <ThemedText style={styles.timeRowLabel}>Reminder time</ThemedText>
              <View style={styles.timeRowValue}>
                <ThemedText style={styles.timeRowTime}>
                  {formatTime12Hour(notificationTime)}
                </ThemedText>
                <IconSymbol name="chevron.right" size={18} color={colors.icon} />
              </View>
            </Pressable>
          )}

          {showTimePicker && (
            <View style={styles.timePickerContainer}>
              <DateTimePicker
                value={timePickerValue}
                mode="time"
                display={Platform.OS === 'android' ? 'default' : 'spinner'}
                onChange={handleTimePickerChange}
              />
              {Platform.OS === 'ios' && (
                <Pressable
                  style={[styles.doneButton, { backgroundColor: ACCENT_COLOR }]}
                  onPress={() => setShowTimePicker(false)}
                >
                  <ThemedText style={styles.doneButtonText}>Done</ThemedText>
                </Pressable>
              )}
            </View>
          )}

          {notificationsEnabled && (
            <Pressable
              style={[styles.testButton, { borderColor: ACCENT_COLOR }]}
              onPress={handleSendTestNotification}
              disabled={sendingTest}
            >
              <ThemedText style={[styles.testButtonText, { color: ACCENT_COLOR }]}>
                {sendingTest ? 'Sending…' : 'Send test notification now'}
              </ThemedText>
            </Pressable>
          )}

          {/* Danger Zone */}
          <View style={styles.dangerSection}>
            <ThemedText style={styles.dangerLabel}>DANGER ZONE</ThemedText>
            
            <Pressable
              style={[styles.dangerButton, { borderColor: DANGER_COLOR }]}
              onPress={handleResetData}
            >
              <ThemedText style={[styles.dangerButtonText, { color: DANGER_COLOR }]}>
                Reset All Data
              </ThemedText>
            </Pressable>
            
            <ThemedText style={styles.dangerDescription}>
              This will erase all your progress and cannot be undone.
            </ThemedText>
          </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  placeholder: {
    width: 70,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    fontWeight: '400',
    opacity: 0.6,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
  },
  timeRowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeRowValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeRowTime: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCENT_COLOR,
  },
  timePickerContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dangerSection: {
    marginTop: 48,
  },
  dangerLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
    marginBottom: 16,
  },
  dangerButton: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dangerDescription: {
    fontSize: 13,
    fontWeight: '400',
    opacity: 0.5,
    textAlign: 'center',
  },
});
