import { useRouter } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBraveryBank } from '@/hooks/useBraveryBank';
import { getCurrentWeekDays, getTodayString, isDateCompleted } from '@/utils/storage';

// App accent color - warm teal
const ACCENT_COLOR = '#2A9D8F';

// American calendar day labels: Sunday first
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function ProgressScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const { braveDays, completedDates, isLoading } = useBraveryBank();
  
  const weekDays = getCurrentWeekDays();
  const todayString = getTodayString();

  if (isLoading) {
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
        {/* Header with Settings */}
        <View style={styles.header}>
          <ThemedText style={styles.title} includeFontPadding={false}>
            Progress
          </ThemedText>
          <Pressable 
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol 
              name="gearshape.fill" 
              size={26} 
              color={colors.icon} 
            />
          </Pressable>
        </View>

        {/* Total Brave Days */}
        <View style={styles.totalContainer}>
          <ThemedText style={[styles.totalNumber, { color: ACCENT_COLOR }]}>
            {braveDays}
          </ThemedText>
          <ThemedText style={styles.totalLabel}>Brave Days Total</ThemedText>
        </View>

        {/* Weekly Calendar - American format (Sunday first) */}
        <View style={[
          styles.weekContainer,
          { backgroundColor: colorScheme === 'dark' ? '#1E2A2A' : '#F0F9F8' }
        ]}>
          <ThemedText style={styles.weekLabel}>This Week</ThemedText>
          
          <View style={styles.dotsContainer}>
            {weekDays.map((date, index) => {
              const isCompleted = isDateCompleted(date, completedDates);
              const isToday = date === todayString;
              
              return (
                <View key={date} style={styles.dotWrapper}>
                  <View
                    style={[
                      styles.dot,
                      isCompleted 
                        ? { backgroundColor: ACCENT_COLOR } 
                        : { 
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            borderColor: colorScheme === 'dark' ? '#3A4A4A' : '#D0D0D0',
                          },
                      isToday && !isCompleted && styles.todayDot,
                    ]}
                  >
                    {isCompleted && (
                      <ThemedText style={styles.checkmark}>✓</ThemedText>
                    )}
                  </View>
                  <ThemedText style={[
                    styles.dayLabel,
                    isToday && styles.todayLabel,
                  ]}>
                    {DAY_LABELS[index]}
                  </ThemedText>
                </View>
              );
            })}
          </View>
          
          <ThemedText style={styles.weekCaption}>
            Every filled dot is a moment you chose courage
          </ThemedText>
        </View>

        {/* Encouragement */}
        <View style={styles.encouragementContainer}>
          {braveDays === 0 ? (
            <ThemedText style={styles.encouragementText}>
              Your first brave day is waiting for you
            </ThemedText>
          ) : braveDays === 1 ? (
            <ThemedText style={styles.encouragementText}>
              You've started something meaningful
            </ThemedText>
          ) : braveDays < 7 ? (
            <ThemedText style={styles.encouragementText}>
              {braveDays} moments of courage. Keep going.
            </ThemedText>
          ) : (
            <ThemedText style={styles.encouragementText}>
              {braveDays} brave days. You're building something real.
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
    paddingHorizontal: 24,
  },
  safeAreaAndroid: {
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
    paddingBottom: 6,
    overflow: 'visible',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 38,
    paddingBottom: 4,
  },
  settingsButton: {
    padding: 8,
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  totalNumber: {
    fontSize: 80,
    fontWeight: '700',
    lineHeight: 88,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  weekContainer: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
    marginBottom: 20,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dotWrapper: {
    alignItems: 'center',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  todayDot: {
    borderColor: '#2A9D8F',
    borderWidth: 2,
  },
  dayLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  todayLabel: {
    opacity: 1,
    fontWeight: '600',
  },
  weekCaption: {
    fontSize: 13,
    opacity: 0.5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  encouragementContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  encouragementText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
});
