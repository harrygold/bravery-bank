import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBraveryBank } from '@/hooks/useBraveryBank';
import { loadData } from '@/utils/storage';

// App accent color - warm teal
const ACCENT_COLOR = '#2A9D8F';
const ACCENT_COLOR_LIGHT = '#40B4A6';

export default function TodayScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);

  const {
    isLoading,
    braveDays,
    todayChallenge,
    todayStatus,
    completeToday,
    restToday,
  } = useBraveryBank();

  // Redirect to onboarding on first launch (show loading until we know)
  useEffect(() => {
    loadData().then((data) => {
      if (!data.hasCompletedOnboarding) {
        router.replace('/onboarding');
        return;
      }
      setCheckedOnboarding(true);
    });
  }, [router]);

  // Button animation
  const buttonScale = useSharedValue(1);
  
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  const handleComplete = async () => {
    await completeToday();
  };

  const handleRest = async () => {
    await restToday();
  };

  if (isLoading || !checkedOnboarding) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        style={[
          styles.safeArea,
          Platform.OS === 'android' && styles.safeAreaAndroid,
        ]}
        edges={['top']}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.appName}>Bravery Bank</ThemedText>
          <ThemedText style={styles.tagline}>One tiny act of courage, every day</ThemedText>
        </View>

        {/* Brave Days Counter */}
      <Pressable 
        style={styles.counterContainer}
        onPress={() => router.push('/(tabs)/explore')}
      >
        <ThemedText style={[styles.counterNumber, { color: ACCENT_COLOR }]}>
          {braveDays}
        </ThemedText>
        <ThemedText style={styles.counterLabel}>Brave Days</ThemedText>
        <ThemedText style={styles.counterSubLabel}>Days you chose courage</ThemedText>
      </Pressable>

      {/* Challenge Card */}
      <View style={[
        styles.challengeCard,
        { 
          backgroundColor: colorScheme === 'dark' ? '#1E2A2A' : '#F0F9F8',
          opacity: todayStatus !== 'none' ? 0.6 : 1,
        }
      ]}>
        {todayStatus === 'none' ? (
          <Animated.View entering={FadeIn.duration(300)}>
            <ThemedText style={styles.challengeLabel}>Today's Challenge</ThemedText>
            <ThemedText style={styles.challengeText}>{todayChallenge}</ThemedText>
          </Animated.View>
        ) : todayStatus === 'completed' ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.completedContainer}>
            <ThemedText style={styles.completedIcon} includeFontPadding={false}>
              ✓
            </ThemedText>
            <ThemedText style={styles.completedText}>You chose courage today</ThemedText>
            <ThemedText style={styles.seeYouText}>See you tomorrow</ThemedText>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(300)} style={styles.completedContainer}>
            <ThemedText style={styles.restIcon} includeFontPadding={false}>
              🌙
            </ThemedText>
            <ThemedText style={styles.completedText}>Rest day — that's okay</ThemedText>
            <ThemedText style={styles.seeYouText}>Your courage will be here tomorrow</ThemedText>
          </Animated.View>
        )}
      </View>

      {/* Action Buttons */}
      {todayStatus === 'none' && (
        <Animated.View 
          entering={FadeIn.duration(300)} 
          exiting={FadeOut.duration(200)}
          style={styles.buttonContainer}
        >
          <Animated.View style={animatedButtonStyle}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: ACCENT_COLOR }]}
              onPress={handleComplete}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <ThemedText style={styles.primaryButtonText}>I Did It</ThemedText>
            </Pressable>
          </Animated.View>

          <Pressable style={styles.secondaryButton} onPress={handleRest}>
            <ThemedText style={[styles.secondaryButtonText, { color: colors.text }]}>
              Not Today
            </ThemedText>
          </Pressable>
        </Animated.View>
      )}
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  safeAreaAndroid: {
    paddingTop: 48,
  },
  header: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    opacity: 0.7,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 16,
  },
  counterNumber: {
    fontSize: 64,
    fontWeight: '700',
    lineHeight: 72,
  },
  counterLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  counterSubLabel: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  challengeCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    minHeight: 160,
    justifyContent: 'center',
    overflow: 'visible',
  },
  challengeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
    marginBottom: 12,
  },
  challengeText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
  },
  completedContainer: {
    alignItems: 'center',
    overflow: 'visible',
    paddingTop: 8,
  },
  completedIcon: {
    fontSize: 48,
    color: ACCENT_COLOR,
    marginBottom: 12,
    lineHeight: 56,
    paddingVertical: 4,
  },
  restIcon: {
    fontSize: 48,
    lineHeight: 56,
    paddingTop: 8,
    paddingBottom: 4,
    marginBottom: 12,
  },
  completedText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  seeYouText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    opacity: 0.7,
  },
});
