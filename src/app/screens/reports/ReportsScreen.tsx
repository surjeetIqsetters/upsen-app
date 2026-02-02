import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ReportCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  screen: keyof RootStackParamList;
}

const reportCategories: ReportCategory[] = [
  {
    id: '1',
    title: 'Attendance Report',
    description: 'View attendance statistics and trends',
    icon: 'time-outline',
    color: Colors.primary,
    screen: 'AttendanceReport',
  },
  {
    id: '2',
    title: 'Leave Report',
    description: 'Analyze leave patterns and balances',
    icon: 'calendar-outline',
    color: Colors.success,
    screen: 'LeaveReport',
  },
  {
    id: '3',
    title: 'Payroll Report',
    description: 'Review payroll summaries and breakdowns',
    icon: 'cash-outline',
    color: Colors.warning,
    screen: 'PayrollReport',
  },
  {
    id: '4',
    title: 'Performance Report',
    description: 'Track employee performance metrics',
    icon: 'trending-up-outline',
    color: Colors.info,
    screen: 'PerformanceReport',
  },
  {
    id: '5',
    title: 'Expense Report',
    description: 'Analyze expense categories and trends',
    icon: 'receipt-outline',
    color: Colors.error,
    screen: 'ExpenseAnalytics',
  },
  {
    id: '6',
    title: 'Time Tracking Report',
    description: 'Review time tracking summaries',
    icon: 'timer-outline',
    color: Colors.primary,
    screen: 'TimeReport',
  },
];

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Available Reports</Text>

        <View style={styles.reportsGrid}>
          {reportCategories.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportCard}
              onPress={() => navigation.navigate(report.screen as any)}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: report.color + '20' },
                ]}
              >
                <Ionicons
                  name={report.icon as any}
                  size={28}
                  color={report.color}
                />
              </View>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDescription}>
                {report.description}
              </Text>
              <View style={styles.viewReportRow}>
                <Text style={[styles.viewReportText, { color: report.color }]}>
                  View Report
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={report.color}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Quick Overview</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Total Employees</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>94.5%</Text>
            <Text style={styles.statLabel}>Attendance Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>$245K</Text>
            <Text style={styles.statLabel}>Monthly Payroll</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Pending Leaves</Text>
          </View>
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
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  reportCard: {
    width: '47%',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  reportTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  reportDescription: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  viewReportRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewReportText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    marginRight: Spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
