import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { loadData, saveData, type BraveryBankData } from '@/utils/storage';

const ACCENT_COLOR = '#2A9D8F';
const ONBOARDING_BG = '#1a1a2e';
const TEXT_ON_DARK = '#FFFFFF';

export default function LauncherScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<BraveryBankData | null>(null);

  useEffect(() => {
    loadData().then((data) => {
      const shouldShowFirstCycle =
        data.totalBraveDays >= 50 && data.hasCompletedFirstCycle === false;

      if (shouldShowFirstCycle) {
        setData(data);
        setIsLoading(false);
        return;
      }

      router.replace({
        pathname: '/onboarding',
        params: { hasSeenReminder: data.hasSeenReminderPrompt ? '1' : '0' },
      });
    });
  }, []);

  const handleFirstCycleReady = async () => {
    if (!data) return;
    const updated: BraveryBankData = {
      ...data,
      hasCompletedFirstCycle: true,
    };
    await saveData(updated);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
      ) : (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.content}>
            <View style={styles.mascotWrap}>
              <Image
                source={require('@/assets/images/mascot/blur-hello.png')}
                style={styles.mascotImage}
                resizeMode="contain"
                accessibilityLabel="Blur saying hello"
              />
            </View>
            <ThemedText
              style={styles.firstCycleTitle}
              lightColor={TEXT_ON_DARK}
              darkColor={TEXT_ON_DARK}
            >
              You completed all 50 challenges.
            </ThemedText>
            <ThemedText
              style={styles.firstCycleSubtitle}
              lightColor={TEXT_ON_DARK}
              darkColor={TEXT_ON_DARK}
            >
              Ready to go again?
            </ThemedText>
            <ThemedText
              style={styles.firstCycleBody}
              lightColor={TEXT_ON_DARK}
              darkColor={TEXT_ON_DARK}
            >
              Same challenges, braver you.
            </ThemedText>
          </View>
          <View style={styles.footer}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: ACCENT_COLOR }]}
              onPress={handleFirstCycleReady}
            >
              <ThemedText style={styles.primaryButtonText}>
                I&apos;m Ready
              </ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ONBOARDING_BG,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 48,
  },
  mascotWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mascotImage: {
    width: 240,
    height: 240,
  },
  firstCycleTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  firstCycleSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.7,
  },
  firstCycleBody: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 8,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 48,
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
    fontSize: 18,
    fontWeight: '700',
  },
});
