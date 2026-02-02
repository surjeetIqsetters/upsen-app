import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Payslip } from '@app/types';
import { payslipApi } from '@app/services/api';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Header, Card, Loading } from '@app/components';
import { formatCurrency, formatMonthYear } from '@app/utils/helpers';
import Toast from 'react-native-toast-message';

export const PayslipDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'PayslipDetail'>>();
  const { payslipId } = route.params;
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayslip();
  }, [payslipId]);

  const loadPayslip = async () => {
    try {
      const data = await payslipApi.getPayslip(payslipId);
      setPayslip(data as Payslip);
    } catch (error) {
      console.error('Failed to load payslip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await payslipApi.downloadPayslip(payslipId);
      Toast.show({ type: 'success', text1: 'Downloaded!', text2: 'Payslip downloaded successfully.' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to download payslip.' });
    }
  };

  if (isLoading || !payslip) {
    return (
      <View style={styles.container}>
        <Header title="Payslip Detail" />
        <Loading fullScreen />
      </View>
    );
  }

  const monthName = new Date(payslip.year, payslip.month - 1).toLocaleString('default', { month: 'long' });

  return (
    <View style={styles.container}>
      <Header title="Payslip Detail" />
      <ScrollView style={styles.content}>
        <Card style={styles.payslipCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.monthYear}>
                {monthName} {payslip.year}
              </Text>
              <Text style={styles.taxCode}>Tax Code: {payslip.taxCode || 'N/A'}</Text>
            </View>
            <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
              <Ionicons name="download-outline" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Net Pay</Text>
            <Text style={styles.amountValue}>{formatCurrency(payslip.netPay)}</Text>
          </View>

          <View style={styles.divider} />

          {/* Earnings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earnings</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Gross Pay</Text>
              <Text style={styles.rowValue}>{formatCurrency(payslip.grossPay)}</Text>
            </View>
            {payslip.overtimeAmount > 0 && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Overtime</Text>
                <Text style={styles.rowValue}>{formatCurrency(payslip.overtimeAmount)}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Deductions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deductions</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Total Deductions</Text>
              <Text style={[styles.rowValue, styles.deductionValue]}>-{formatCurrency(payslip.totalDeductions)}</Text>
            </View>
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
  payslipCard: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  monthYear: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  taxCode: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  downloadButton: {
    padding: Spacing.sm,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  amountLabel: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  amountValue: {
    fontSize: Typography.size['3xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  rowLabel: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  rowValue: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.textPrimary,
  },
  deductionValue: {
    color: Colors.error,
  },
});
