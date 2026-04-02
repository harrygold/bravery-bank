import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBraveryBank } from '@/hooks/useBraveryBank';
import { loadData, saveData } from '@/utils/storage';

// App accent color - warm teal
const ACCENT_COLOR = '#2A9D8F';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

type ConfettiPieceSpec = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  delay: number;
  duration: number;
  fallDistance: number;
  wobbleAmp: number;
  wobblePeriod: number;
  rotationDeg: number;
};

const confettiColors = ['#2A9D8F', '#40B4A6', '#E07A5F', '#F4D35E', '#FFFFFF'];

function ConfettiPiece({ spec }: { spec: ConfettiPieceSpec }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const opacity = useSharedValue(1);

  const halfWobble = Math.max(50, Math.round(spec.wobblePeriod / 2));
  const oscillations = Math.max(1, Math.round(spec.duration / spec.wobblePeriod));

  useEffect(() => {
    translateY.value = withDelay(
      spec.delay,
      withTiming(spec.fallDistance, { duration: spec.duration })
    );

    opacity.value = withDelay(
      spec.delay + spec.duration * 0.7,
      withTiming(0, { duration: spec.duration * 0.3 })
    );

    rotateZ.value = withDelay(
      spec.delay,
      withTiming(spec.rotationDeg, { duration: spec.duration })
    );

    // Slight horizontal wobble using withRepeat + withSequence.
    translateX.value = withDelay(
      spec.delay,
      withRepeat(
        withSequence(
          withTiming(-spec.wobbleAmp, { duration: halfWobble }),
          withTiming(spec.wobbleAmp, { duration: halfWobble })
        ),
        oscillations,
        false
      )
    );
  }, [spec, halfWobble, oscillations, rotateZ, translateX, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: spec.left,
      top: spec.top,
      width: spec.width,
      height: spec.height,
      backgroundColor: spec.color,
      opacity: opacity.value,
      borderRadius: 2,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotateZ.value}deg` },
      ],
    };
  });

  return <Animated.View style={animatedStyle} />;
}

function ConfettiRain({ pieceCount = 90 }: { pieceCount?: number }) {
  const pieces = useState<ConfettiPieceSpec[]>(() => {
    const generate = (): ConfettiPieceSpec[] => {
      const fallDistance = screenHeight + 50;
      const specs: ConfettiPieceSpec[] = [];

      const randInt = (min: number, max: number) =>
        Math.floor(min + Math.random() * (max - min + 1));
      const randFloat = (min: number, max: number) => min + Math.random() * (max - min);

      for (let i = 0; i < pieceCount; i++) {
        const width = randInt(8, 12);
        const height = randInt(6, 10);
        const left = randFloat(0, Math.max(0, screenWidth - width));
        const top = randFloat(-600, -20);
        const delay = randInt(0, 2000);
        const duration = randInt(2500, 4500);
        const wobbleAmp = randInt(15, 25);
        const wobblePeriod = randInt(250, 600);
        const rotationDeg = randInt(0, 360);
        const color = confettiColors[randInt(0, confettiColors.length - 1)];

        specs.push({
          id: `c_${i}`,
          left,
          top,
          width,
          height,
          color,
          delay,
          duration,
          fallDistance,
          wobbleAmp,
          wobblePeriod,
          rotationDeg,
        });
      }

      return specs;
    };

    return generate();
  })[0];

  // Trigger is handled per-piece in useEffect; rendering starts the rain.
  return (
    <>
      {pieces.map((spec) => (
        <ConfettiPiece key={spec.id} spec={spec} />
      ))}
    </>
  );
}

export default function TodayScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const {
    isLoading,
    braveDays,
    todayChallenge,
    todayStatus,
    completeToday,
    restToday,
    returnToChallenge,
  } = useBraveryBank();

  const shouldConsiderCelebration = todayStatus === 'completed' && braveDays >= 50;
  const [hasSeenCelebration, setHasSeenCelebration] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!shouldConsiderCelebration) {
      setHasSeenCelebration(true);
      return;
    }

    loadData().then((data) => {
      if (!mounted) return;
      setHasSeenCelebration(data.hasSeenCelebration);
    });

    return () => {
      mounted = false;
    };
  }, [shouldConsiderCelebration]);

  const shouldShowCelebration =
    shouldConsiderCelebration && hasSeenCelebration === false;

  const [showContinueButton, setShowContinueButton] = useState(false);

  useEffect(() => {
    if (!shouldShowCelebration) {
      setShowContinueButton(false);
      return;
    }

    setShowContinueButton(false);
    const timeout = setTimeout(() => {
      setShowContinueButton(true);
    }, 7000);

    return () => clearTimeout(timeout);
  }, [shouldShowCelebration]);

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

  const handleContinueCelebration = async () => {
    const freshData = await loadData();
    const updatedData = { ...freshData, hasSeenCelebration: true };
    await saveData(updatedData);
    setHasSeenCelebration(true);
  };

  if (isLoading || (shouldConsiderCelebration && hasSeenCelebration === null)) {
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
        {shouldShowCelebration && (
          <View style={styles.confettiOverlay} pointerEvents="none">
            <ConfettiRain />
          </View>
        )}
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

      {/* Rest day: card with Blur + rest message inside, then button — no scroll */}
      {todayStatus === 'rested' ? (
        <>
          <View style={[
            styles.restDayCard,
            {
              backgroundColor: colorScheme === 'dark' ? '#1E2A2A' : '#F0F9F8',
              opacity: 0.6,
            },
          ]}>
            <Animated.View entering={FadeIn.duration(300)} style={styles.restDayCardContent}>
              <View style={styles.restDayCardMascotWrap}>
                <Image
                  source={require('@/assets/images/mascot/blur-resting.png')}
                  style={styles.restDayCardMascotImage}
                  resizeMode="contain"
                  accessibilityLabel="Blur the mascot, resting"
                />
              </View>
              <ThemedText style={styles.restIconSmall} includeFontPadding={false}>
                🌙
              </ThemedText>
              <ThemedText style={styles.completedText}>Rest day — that&apos;s okay</ThemedText>
              <ThemedText style={styles.seeYouText}>Your courage will be here tomorrow</ThemedText>
            </Animated.View>
          </View>
          <Pressable
            style={styles.restDayReturnButton}
            onPress={returnToChallenge}
          >
              <ThemedText style={[styles.restDayReturnButtonText, { color: ACCENT_COLOR }]}>
              ✨ Actually, I&apos;m feeling brave
            </ThemedText>
          </Pressable>
        </>
      ) : (
        <>
          {/* Challenge Card (none or completed) */}
          <View style={[
            styles.challengeCard,
            {
              backgroundColor: colorScheme === 'dark' ? '#1E2A2A' : '#F0F9F8',
          opacity:
            shouldShowCelebration
              ? 1
              : todayStatus !== 'none'
                ? 0.6
                : 1,
          justifyContent:
            shouldShowCelebration ? 'flex-start' : 'center',
          marginBottom: shouldShowCelebration ? 0 : 32,
            },
          ]}>
            {todayStatus === 'none' ? (
              <Animated.View entering={FadeIn.duration(300)}>
                <ThemedText style={styles.challengeLabel}>Today&apos;s Challenge</ThemedText>
                <ThemedText style={styles.challengeText}>{todayChallenge}</ThemedText>
              </Animated.View>
            ) : shouldShowCelebration ? (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.celebrationContainer}
              >
                <Image
                  source={require('@/assets/images/mascot/blur-celebration.png')}
                  style={styles.celebrationImage}
                  resizeMode="contain"
                  accessibilityLabel="Blur celebrating"
                />
                <ThemedText
                  style={styles.celebrationTitle}
                  includeFontPadding={false}
                >
                  50 moments of courage.
                </ThemedText>
                <View style={styles.celebrationTextBlock}>
                  <ThemedText
                    style={[styles.celebrationSubtitle, { color: colors.text }]}
                    includeFontPadding={false}
                  >
                    You did what most people won&apos;t.
                  </ThemedText>
                  <ThemedText
                    style={[styles.celebrationBody, { color: colors.text }]}
                    includeFontPadding={false}
                  >
                    From a deep breath to telling someone your story — you showed up, again and again.
                  </ThemedText>
                </View>
                {showContinueButton && (
                  <Animated.View
                    entering={FadeIn.duration(500)}
                    style={styles.celebrationContinueWrap}
                  >
                    <Pressable
                      style={[
                        styles.primaryButton,
                        styles.celebrationContinueButton,
                        { backgroundColor: ACCENT_COLOR },
                      ]}
                      onPress={handleContinueCelebration}
                    >
                      <ThemedText style={styles.primaryButtonText}>
                        Continue
                      </ThemedText>
                    </Pressable>
                  </Animated.View>
                )}
              </Animated.View>
            ) : (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.completedContainer}
              >
                <ThemedText
                  style={styles.completedIcon}
                  includeFontPadding={false}
                >
                  ✓
                </ThemedText>
                <ThemedText style={styles.completedText}>
                  You chose courage today
                </ThemedText>
                <ThemedText style={styles.seeYouText}>
                  See you tomorrow
                </ThemedText>
              </Animated.View>
            )}
          </View>
        </>
      )}

      {/* Action Buttons */}
      {todayStatus === 'none' && (
        <Animated.View 
          entering={FadeIn.duration(300)} 
          exiting={FadeOut.duration(200)}
          style={styles.buttonContainer}
        >
          <Animated.View style={[animatedButtonStyle, styles.primaryButtonWrap]}>
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
    fontWeight: '400',
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
    fontWeight: '400',
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
  restDayCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 0,
    overflow: 'visible',
  },
  restDayCardContent: {
    alignItems: 'center',
    overflow: 'visible',
  },
  restDayCardMascotWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  restDayCardMascotImage: {
    width: 180,
    height: 180,
  },
  restIconSmall: {
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 8,
  },
  restDayReturnButton: {
    alignSelf: 'center',
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restDayReturnButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  challengeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  celebrationContainer: {
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
    overflow: 'visible',
  },
  celebrationContinueWrap: {
    alignSelf: 'stretch',
    width: '100%',
  },
  celebrationTextBlock: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: '85%',
  },
  celebrationImage: {
    width: 180,
    height: 180,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: ACCENT_COLOR,
    textAlign: 'center',
    marginTop: 8,
  },
  celebrationSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'left',
    opacity: 0.7,
    marginTop: 4,
  },
  celebrationBody: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'left',
    opacity: 0.6,
    lineHeight: 24,
    marginTop: 4,
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
    fontWeight: '400',
    opacity: 0.6,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  primaryButtonWrap: {
    alignSelf: 'stretch',
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  celebrationContinueButton: {
    marginBottom: 0,
    marginTop: 16,
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
    fontWeight: '500',
    opacity: 0.7,
  },
  confettiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
});
