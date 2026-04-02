import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { getChallenge } from '@/data/challenges';
import { useBraveryBank } from '@/hooks/useBraveryBank';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACCENT_COLOR = '#2A9D8F';

const BORDER_SUBTLE = (dark: boolean) => (dark ? '#2A3A3A' : '#E8E8E8');

const formatHistoryDay = (isoDate: string): string => {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function BraveActsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { completedDates, isLoading } = useBraveryBank();

  const sortedEntries = useMemo(
    () => [...completedDates].sort((a, b) => b.date.localeCompare(a.date)),
    [completedDates]
  );

  const borderSubtle = BORDER_SUBTLE(colorScheme === 'dark');

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <IconSymbol name="chevron.left" size={20} color={ACCENT_COLOR} />
            <ThemedText style={[styles.backText, { color: ACCENT_COLOR }]}>
              Back
            </ThemedText>
          </Pressable>
          <ThemedText style={styles.title}>My Brave Acts</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {sortedEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={[styles.emptyText, { color: colors.text }]}>
              Complete your first challenge to see it here.
            </ThemedText>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {sortedEntries.map((entry, index) => (
              <View key={`${entry.date}-${index}`}>
                {index > 0 && (
                  <View
                    style={[
                      styles.rowDivider,
                      { backgroundColor: borderSubtle },
                    ]}
                  />
                )}
                <View style={styles.row}>
                  <ThemedText style={[styles.rowDate, { color: colors.text }]}>
                    {formatHistoryDay(entry.date)}
                  </ThemedText>
                  {entry.challengeIndex < 0 ? (
                    <ThemedText
                      style={[styles.rowChallengeLegacy, { color: colors.text }]}
                    >
                      Brave act completed
                    </ThemedText>
                  ) : (
                    <ThemedText
                      style={[styles.rowChallenge, { color: colors.text }]}
                    >
                      {getChallenge(entry.challengeIndex)}
                    </ThemedText>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 70,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  rowDivider: {
    height: 1,
    marginVertical: 10,
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowDate: {
    fontSize: 13,
    fontWeight: '400',
    opacity: 0.6,
    flexShrink: 0,
  },
  rowChallenge: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '400',
  },
  rowChallengeLegacy: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
  },
});
