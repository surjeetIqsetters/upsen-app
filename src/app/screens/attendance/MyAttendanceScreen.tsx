import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header, Card } from '@app/components';
import { Colors, Typography, Spacing } from '@app/utils/constants';

export const MyAttendanceScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Weekly' },
    { key: 'month', label: 'Monthly' },
  ];

  const attendanceData = [
    { date: 'Mon', status: 'present', hours: 8 },
    { date: 'Tue', status: 'present', hours: 8 },
    { date: 'Wed', status: 'late', hours: 7.5 },
    { date: 'Thu', status: 'present', hours: 8 },
    { date: 'Fri', status: 'present', hours: 8 },
  ];

  return (
    <View style={styles.container}>
      <Header title="My Attendance" />
      <ScrollView style={styles.content}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.key as any)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period.key && styles.periodTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>8h 30m</Text>
              <Text style={styles.statLabel}>Total Hours</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>22</Text>
              <Text style={styles.statLabel}>Working Days</Text>
            </View>
          </View>
        </Card>

        {/* Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Attendance Overview</Text>
          <View style={styles.chart}>
            {attendanceData.map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: item.hours * 10,
                      backgroundColor:
                        item.status === 'present' ? Colors.success : Colors.warning,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{item.date}</Text>
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: Colors.white,
  },
  periodText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  periodTextActive: {
    color: Colors.primary,
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  chartCard: {
    padding: Spacing.lg,
  },
  chartTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
  },
  bar: {
    width: 24,
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  barLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
});
