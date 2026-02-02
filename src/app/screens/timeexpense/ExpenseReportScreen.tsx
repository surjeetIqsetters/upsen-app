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
import { useExpenseStore } from '@app/store/expenseStore';
import { Loading, EmptyState } from '@app/components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ExpenseStatus = 'pending' | 'approved' | 'rejected';
type ExpenseCategory = 'travel' | 'meals' | 'office' | 'training' | 'other';

interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: Date;
  status: ExpenseStatus;
  receipt?: string;
}

const categoryConfig: Record<ExpenseCategory, { icon: string; color: string; label: string }> = {
  travel: { icon: 'airplane-outline', color: Colors.primary, label: 'Travel' },
  meals: { icon: 'restaurant-outline', color: Colors.warning, label: 'Meals' },
  office: { icon: 'desktop-outline', color: Colors.success, label: 'Office' },
  training: { icon: 'school-outline', color: Colors.info, label: 'Training' },
  other: { icon: 'ellipsis-horizontal-outline', color: Colors.gray500, label: 'Other' },
};

const tabs = ['All', 'Pending', 'Approved', 'Rejected'] as const;

export const ExpenseReportScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { expenses, isLoading, fetchExpenses } = useExpenseStore();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  };

  const filteredExpenses = expenses.filter((expense) =>
    activeTab === 'All' ? true : expense.status === activeTab.toLowerCase()
  );

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const config = categoryConfig[item.category];

    return (
      <View style={styles.expenseCard}>
        <View style={styles.expenseHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon as any} size={20} color={config.color} />
          </View>
          <View style={styles.expenseInfo}>
            <Text style={styles.categoryLabel}>{config.label}</Text>
            <Text style={styles.expenseDate}>
              {format(new Date(item.date), 'MMM dd, yyyy')}
            </Text>
          </View>
          <View style={styles.expenseRight}>
            <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === 'approved'
                      ? Colors.successLight
                      : item.status === 'rejected'
                      ? Colors.errorLight
                      : Colors.warningLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      item.status === 'approved'
                        ? Colors.success
                        : item.status === 'rejected'
                        ? Colors.error
                        : Colors.warning,
                  },
                ]}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        {item.receipt && (
          <TouchableOpacity style={styles.receiptButton}>
            <Ionicons name="receipt-outline" size={16} color={Colors.primary} />
            <Text style={styles.receiptText}>View Receipt</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return <Loading fullscreen message="Loading expenses..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SubmitExpense')}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Total Card */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total ({activeTab})</Text>
        <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Expenses List */}
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenseItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No expenses"
            message="Submit your first expense to get started"
            actionLabel="Submit Expense"
            onAction={() => navigation.navigate('SubmitExpense')}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('SubmitExpense')}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
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
  totalCard: {
    backgroundColor: Colors.primary,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: Typography.size.sm,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: Spacing.xs,
  },
  totalAmount: {
    fontSize: Typography.size['3xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.white,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: Typography.weight.semibold,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  expenseCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  categoryLabel: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  expenseDate: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.base,
    marginTop: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
  description: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  receiptText: {
    fontSize: Typography.size.sm,
    color: Colors.primary,
    marginLeft: Spacing.xs,
    fontWeight: Typography.weight.medium,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
