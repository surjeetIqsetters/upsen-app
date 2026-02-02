import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Payslip } from '@app/types';
import { payslipApi } from '@app/services/api';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Header, Card, EmptyState } from '@app/components';
import { formatCurrency, formatMonthYear } from '@app/utils/helpers';

export const PayslipScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadPayslips();
  }, [selectedYear]);

  const loadPayslips = async () => {
    try {
      const data = await payslipApi.getPayslips(selectedYear);
      setPayslips(data as Payslip[]);
    } catch (error) {
      console.error('Failed to load payslips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const payslip = payslips.find((p) => p.month === month);
    return { month, payslip };
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <View style={styles.container}>
      <Header title="Payslip" />
      <ScrollView style={styles.content}>
        {/* Year Selector */}
        <View style={styles.yearSelector}>
          <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)}>
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.yearText}>{selectedYear}</Text>
          <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)}>
            <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Payslip Grid */}
        <View style={styles.payslipGrid}>
          {months.map(({ month, payslip }) => (
            <TouchableOpacity
              key={month}
              style={[styles.payslipItem, payslip && styles.payslipItemActive]}
              onPress={() => payslip && navigation.navigate('PayslipDetail', { payslipId: payslip.id })}
              disabled={!payslip}
            >
              <Text style={[styles.monthText, payslip && styles.monthTextActive]}>{monthNames[month - 1]}</Text>
              {payslip ? (
                <>
                  <Text style={styles.amountText}>{formatCurrency(payslip.netPay)}</Text>
                  <Ionicons name="document-text" size={20} color={Colors.primary} style={styles.docIcon} />
                </>
              ) : (
                <Text style={styles.noPayslipText}>-</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
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
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  yearText: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  payslipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  payslipItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  payslipItemActive: {
    backgroundColor: Colors.white,
    ...{
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  },
  monthText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.gray400,
  },
  monthTextActive: {
    color: Colors.textPrimary,
  },
  amountText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  noPayslipText: {
    fontSize: Typography.size.lg,
    color: Colors.gray300,
  },
  docIcon: {
    marginTop: Spacing.xs,
  },
});
