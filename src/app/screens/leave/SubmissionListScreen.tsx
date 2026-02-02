import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Header, Card, EmptyState, Loading } from '@app/components';
import { useLeaveStore } from '@app/store';
import { Colors, Typography, Spacing, BorderRadius, RequestStatuses } from '@app/utils/constants';
import { formatDate } from '@app/utils/helpers';

export const SubmissionListScreen: React.FC = () => {
  const { myRequests, fetchMyRequests, isLoading } = useLeaveStore();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchMyRequests(true);
  }, []);

  const filters = [
    { key: null, label: 'All' },
    { key: 'waiting', label: 'Waiting' },
    { key: 'approved', label: 'Approved' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const filteredRequests = activeFilter
    ? myRequests.filter((r) => r.status === activeFilter)
    : myRequests;

  const renderItem = ({ item }: { item: any }) => {
    const statusConfig = RequestStatuses.find((s) => s.value === item.status) || RequestStatuses[0];
    return (
      <Card style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Text style={styles.leaveType}>{item.leaveType} Leave</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </View>
        <Text style={styles.dates}>
          {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </Text>
        <Text style={styles.reason} numberOfLines={2}>
          {item.reason}
        </Text>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="List Request" />
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.label}
            style={[styles.filterChip, activeFilter === filter.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredRequests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          isLoading ? (
            <Loading fullscreen={false} />
          ) : (
            <EmptyState
              title="No leave requests"
              message="Your leave submission history will appear here"
              icon="calendar-outline"
            />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
    fontWeight: Typography.weight.medium,
  },
  list: {
    padding: Spacing.base,
  },
  requestCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  leaveType: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
  dates: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  reason: {
    fontSize: Typography.size.sm,
    color: Colors.gray500,
  },
});
