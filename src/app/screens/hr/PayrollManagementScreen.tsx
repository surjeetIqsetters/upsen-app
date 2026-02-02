import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { usePayrollStore } from '@app/store/payrollStore';
import { Loading, EmptyState } from '@app/components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PayrollRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  employeeAvatar?: string;
  month: number;
  year: number;
  grossPay: number;
  deductions: {
    tax: number;
    insurance: number;
    pension: number;
    other: number;
  };
  netPay: number;
  status: 'draft' | 'processed' | 'paid';
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PayrollManagementScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { payrollRecords, isLoading, fetchPayrollRecords, processPayroll } = usePayrollStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPayrollRecords(selectedMonth + 1, selectedYear);
  }, [selectedMonth, selectedYear]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayrollRecords(selectedMonth + 1, selectedYear);
    setRefreshing(false);
  };

  const handleProcessPayroll = async () => {
    try {
      await processPayroll(selectedMonth + 1, selectedYear);
    } catch (error) {
      // Error handled in store
    }
  };

  const totalGross = payrollRecords.reduce((sum, r) => sum + r.grossPay, 0);
  const totalDeductions = payrollRecords.reduce((sum, r) =>
    sum + (r.deductions.tax + r.deductions.insurance + r.deductions.pension + r.deductions.other),
    0
  );
  const totalNet = payrollRecords.reduce((sum, r) => sum + r.netPay, 0);

  const renderPayrollItem = ({ item }: { item: PayrollRecord }) => (
    <TouchableOpacity
      style={styles.payrollCard}
      onPress={() => navigation.navigate('PayrollDetail', { payrollId: item.id })}
    >
      <View style={styles.employeeRow}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {item.employeeName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{item.employeeName}</Text>
          <Text style={styles.employeeId}>ID: {item.employeeId}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'paid'
                  ? Colors.successLight
                  : item.status === 'processed'
                    ? Colors.infoLight
                    : Colors.warningLight,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.status === 'paid'
                    ? Colors.success
                    : item.status === 'processed'
                      ? Colors.info
                      : Colors.warning,
              },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.recordStats}>
        <View style={styles.recordStat}>
          <Text style={styles.recordStatLabel}>Gross</Text>
          <Text style={styles.recordStatValue}>${item.grossPay.toFixed(2)}</Text>
        </View>
        <View style={styles.recordStat}>
          <Text style={styles.recordStatLabel}>Deductions</Text>
          <Text style={[styles.recordStatValue, { color: Colors.error }]}>
            -${(item.deductions.tax + item.deductions.insurance + item.deductions.pension + item.deductions.other).toFixed(2)}
          </Text>
        </View>
        <View style={styles.recordStat}>
          <Text style={styles.recordStatLabel}>Net</Text>
          <Text style={[styles.recordStatValue, { color: Colors.success }]}>
            ${item.netPay.toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return <Loading fullscreen message="Loading payroll data..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payroll Management</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PayrollSettings')}>
          <Ionicons name="settings-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Month/Year Selector */}
        <View style={styles.selectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {months.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.monthChip,
                  selectedMonth === index && styles.selectedMonthChip,
                ]}
                onPress={() => setSelectedMonth(index)}
              >
                <Text
                  style={[
                    styles.monthChipText,
                    selectedMonth === index && styles.selectedMonthChipText,
                  ]}
                >
                  {month.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Gross</Text>
            <Text style={styles.summaryValue}>${totalGross.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Deductions</Text>
            <Text style={[styles.summaryValue, { color: Colors.error }]}>
              ${totalDeductions.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Net</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              ${totalNet.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.processButton}
            onPress={handleProcessPayroll}
          >
            <Ionicons name="play-circle-outline" size={20} color={Colors.white} />
            <Text style={styles.processButtonText}>Process Payroll</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => navigation.navigate('ExportPayroll')}
          >
            <Ionicons name="download-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Payroll List */}
        <Text style={styles.sectionTitle}>Employee Payroll</Text>
        <FlatList
          data={payrollRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderPayrollItem}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
          ListEmptyComponent={
            <EmptyState
              icon="cash-outline"
              title="No payroll records"
              message="No payroll records found for the selected period"
            />
          }
        />
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
  selectorContainer: {
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  monthChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
  },
  selectedMonthChip: {
    backgroundColor: Colors.primary,
  },
  monthChipText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  selectedMonthChipText: {
    color: Colors.white,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
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
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  processButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  processButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.white,
  },
  exportButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primaryLighter,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  payrollCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.white,
  },
  employeeInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  employeeName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  employeeId: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.base,
  },
  statusText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  amountItem: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  amountValue: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  recordStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  recordStat: {
    alignItems: 'center',
  },
  recordStatLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  recordStatValue: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
});
