import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { useApprovalsStore } from '@app/store/approvalsStore';
import { Loading, EmptyState } from '@app/components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ApprovalType = 'leave' | 'expense' | 'timesheet' | 'overtime';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface ApprovalItem {
  id: string;
  type: ApprovalType;
  status: ApprovalStatus;
  requesterName: string;
  requesterAvatar?: string;
  title: string;
  description: string;
  requestedAt: Date;
  amount?: string;
  dates?: string;
}

const approvalTypeConfig = {
  leave: { icon: 'calendar-outline', color: Colors.primary, label: 'Leave Request' },
  expense: { icon: 'card-outline', color: Colors.warning, label: 'Expense' },
  timesheet: { icon: 'time-outline', color: Colors.success, label: 'Timesheet' },
  overtime: { icon: 'timer-outline', color: Colors.info, label: 'Overtime' },
};

const tabs = ['Pending', 'Approved', 'Rejected'] as const;

export const ApprovalWorkflowScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { approvals, isLoading, fetchApprovals, approveRequest, rejectRequest } = useApprovalsStore();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Pending');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApprovals();
    setRefreshing(false);
  };

  const filteredApprovals = approvals.filter(
    (item) => item.status === activeTab.toLowerCase()
  );

  const handleApprove = async (id: string) => {
    try {
      await approveRequest(id);
    } catch (error) {
      // Error handled in store
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectRequest(id, 'Rejected by manager');
    } catch (error) {
      // Error handled in store
    }
  };

  const renderApprovalItem = ({ item }: { item: ApprovalItem }) => {
    const config = approvalTypeConfig[item.type];

    return (
      <View style={styles.approvalCard}>
        <View style={styles.approvalHeader}>
          <View style={[styles.typeIcon, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon as any} size={20} color={config.color} />
          </View>
          <View style={styles.typeInfo}>
            <Text style={styles.typeLabel}>{config.label}</Text>
            <Text style={styles.requestDate}>
              {format(new Date(item.requestedAt), 'MMM dd, yyyy')}
            </Text>
          </View>
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

        <View style={styles.approvalContent}>
          <View style={styles.requesterRow}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.requesterName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.requesterName}>{item.requesterName}</Text>
          </View>

          <Text style={styles.approvalTitle}>{item.title}</Text>
          <Text style={styles.approvalDescription}>{item.description}</Text>

          {item.amount && (
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{item.amount}</Text>
            </View>
          )}

          {item.dates && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{item.dates}</Text>
            </View>
          )}
        </View>

        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(item.id)}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(item.id)}
            >
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return <Loading fullscreen message="Loading approvals..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Approvals</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Approvals List */}
      <FlatList
        data={filteredApprovals}
        keyExtractor={(item) => item.id}
        renderItem={renderApprovalItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-circle-outline"
            title={`No ${activeTab.toLowerCase()} requests`}
            message={`There are no ${activeTab.toLowerCase()} approval requests at this time`}
          />
        }
      />
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: Typography.weight.semibold,
  },
  listContent: {
    padding: Spacing.lg,
  },
  approvalCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  approvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  typeLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  requestDate: {
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
  approvalContent: {
    marginBottom: Spacing.md,
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.white,
  },
  requesterName: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    fontWeight: Typography.weight.medium,
  },
  approvalTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  approvalDescription: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  detailText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.base,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: Colors.errorLight,
  },
  rejectButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.error,
  },
  approveButton: {
    backgroundColor: Colors.primary,
  },
  approveButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.white,
  },
});
