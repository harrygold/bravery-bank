import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BraveryBankProvider } from '@/hooks/BraveryBankContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { loadData } from '@/utils/storage';

// expo-notifications is not available in Expo Go on Android (SDK 53+).
const isExpoGo = Constants.appOwnership === 'expo';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    if (isExpoGo) return;
    import('@/utils/notifications').then(({ setNotificationHandler }) => {
      setNotificationHandler();
    });
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      router.replace('/(tabs)');
    });
    return () => subscription.remove();
  }, [router]);

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        router.replace('/(tabs)');
      }
    });
  }, [router]);

  useEffect(() => {
    if (isExpoGo) return;
    async function rescheduleIfEnabled() {
      const data = await loadData();
      if (data.notificationsEnabled) {
        const { scheduleDailyReminder } = await import('@/utils/notifications');
        await scheduleDailyReminder(data.notificationTime);
      }
    }
    rescheduleIfEnabled();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <BraveryBankProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen
              name="settings"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="brave-acts"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </BraveryBankProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});
