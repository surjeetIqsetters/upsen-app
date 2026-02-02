import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header, Card, Loading } from '@app/components';
import { Colors, Typography, Spacing } from '@app/utils/constants';
import { useAttendanceStore } from '@app/store';

export const AttendanceSummaryScreen: React.FC = () => {
  const { summary, fetchSummary, isLoading } = useAttendanceStore();

  React.useEffect(() => {
    const now = new Date();
    fetchSummary(now.getMonth(), now.getFullYear());
  }, []);

  const summaryData = summary ? [
    { label: 'On Time', value: summary.onTime || 0, color: Colors.success },
    { label: 'Late', value: summary.late || 0, color: Colors.warning },
    { label: 'Absence', value: summary.absent || 0, color: Colors.error },
    { label: 'Leaves', value: summary.onLeave || 0, color: Colors.info },
    { label: 'Sick Leave', value: summary.sickLeave || 0, color: Colors.warningLight },
    { label: 'Early Leaves', value: summary.earlyLeave || 0, color: Colors.gray500 },
  ] : [
    { label: 'On Time', value: 0, color: Colors.success },
    { label: 'Late', value: 0, color: Colors.warning },
    { label: 'Absence', value: 0, color: Colors.error },
    { label: 'Leaves', value: 0, color: Colors.info },
    { label: 'Sick Leave', value: 0, color: Colors.warningLight },
    { label: 'Early Leaves', value: 0, color: Colors.gray500 },
  ];

  if (isLoading && !summary) {
    return <Loading fullscreen text="Loading summary..." />;
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      <Header title="Attendance Summary" />
      <ScrollView style={styles.content}>
        <Card style={styles.summaryCard}>
          <Text style={styles.month}>{currentMonth}</Text>
          <View style={styles.statsGrid}>
            {summaryData.map((item) => (
              <View key={item.label} style={styles.statItem}>
                <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    padding: Spacing.base,
  },
  summaryCard: {
    padding: Spacing.lg,
  },
  month: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
    padding: Spacing.md,
  },
  statValue: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
});
