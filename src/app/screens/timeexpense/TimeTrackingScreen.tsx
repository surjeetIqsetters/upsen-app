import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, differenceInMinutes } from 'date-fns';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { useTimeTrackingStore } from '@app/store/timeTrackingStore';
import { Loading, EmptyState } from '@app/components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TimeEntry {
  id: string;
  project: string;
  task: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  notes: string;
}

export const TimeTrackingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    timeEntries,
    isLoading,
    isTracking,
    currentSession,
    fetchTimeEntries,
    startTracking,
    stopTracking,
  } = useTimeTrackingStore();
  const [refreshing, setRefreshing] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && currentSession) {
      interval = setInterval(() => {
        const elapsed = differenceInMinutes(new Date(), new Date(currentSession.startTime));
        setTimer(elapsed);
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isTracking, currentSession]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTimeEntries();
    setRefreshing(false);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const todayTotal = timeEntries
    .filter((entry) => format(new Date(entry.startTime), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    .reduce((sum, entry) => sum + entry.duration, 0);

  const weekTotal = timeEntries
    .filter((entry) => {
      const entryDate = new Date(entry.startTime);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays < 7;
    })
    .reduce((sum, entry) => sum + entry.duration, 0);

  const renderTimeEntry = ({ item }: { item: TimeEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View>
          <Text style={styles.projectName}>{item.project}</Text>
          <Text style={styles.taskName}>{item.task}</Text>
        </View>
        <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
      </View>
      <View style={styles.entryFooter}>
        <Text style={styles.timeRange}>
          {format(new Date(item.startTime), 'HH:mm')} -
          {item.endTime ? format(new Date(item.endTime), 'HH:mm') : ' Present'}
        </Text>
        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
      </View>
    </View>
  );

  if (isLoading && !refreshing) {
    return <Loading fullscreen message="Loading time entries..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Time Tracking</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TimeReports')}>
          <Ionicons name="bar-chart-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Timer Card */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>
            {isTracking ? 'Currently Tracking' : 'Ready to Track'}
          </Text>
          <Text style={styles.timerValue}>
            {isTracking ? formatDuration(timer) : '00h 00m'}
          </Text>
          {isTracking && currentSession && (
            <Text style={styles.timerProject}>{currentSession.project}</Text>
          )}
          <TouchableOpacity
            style={[
              styles.timerButton,
              isTracking ? styles.stopButton : styles.startButton,
            ]}
            onPress={isTracking ? stopTracking : () => navigation.navigate('StartTimer')}
          >
            <Ionicons
              name={isTracking ? 'stop' : 'play'}
              size={24}
              color={Colors.white}
            />
            <Text style={styles.timerButtonText}>
              {isTracking ? 'Stop Timer' : 'Start Timer'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Today</Text>
            <Text style={styles.summaryValue}>{formatDuration(todayTotal)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>This Week</Text>
            <Text style={styles.summaryValue}>{formatDuration(weekTotal)}</Text>
          </View>
        </View>

        {/* Recent Entries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          <FlatList
            data={timeEntries.slice(0, 10)}
            keyExtractor={(item) => item.id}
            renderItem={renderTimeEntry}
            scrollEnabled={false}
            ListEmptyComponent={
              <EmptyState
                icon="time-outline"
                title="No time entries"
                message="Start tracking your time to see entries here"
              />
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  timerCard: {
    backgroundColor: Colors.primary,
    margin: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: Typography.size.sm,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: Spacing.sm,
  },
  timerValue: {
    fontSize: Typography.size['4xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  timerProject: {
    fontSize: Typography.size.base,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: Spacing.lg,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  startButton: {
    backgroundColor: Colors.success,
  },
  stopButton: {
    backgroundColor: Colors.error,
  },
  timerButtonText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.white,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  section: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  entryCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  projectName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  taskName: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  duration: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
  },
  entryFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  timeRange: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  notes: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
