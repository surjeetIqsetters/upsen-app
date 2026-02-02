import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAttendanceStore } from '@app/store';
import { Colors, Typography, Spacing } from '@app/utils/constants';
import { Header, Card, Loading, EmptyState } from '@app/components';
import { formatDate, formatTime } from '@app/utils/helpers';

export const AttendanceListScreen: React.FC = () => {
  const { attendanceHistory, fetchHistory, isLoading, hasMore } = useAttendanceStore();

  useEffect(() => {
    fetchHistory(true);
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'attending' ? Colors.successLight : Colors.warningLight }]}>
          <Text style={[styles.statusText, { color: item.status === 'attending' ? Colors.success : Colors.warning }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.itemDetails}>
        <View style={styles.detail}>
          <Ionicons name="log-in-outline" size={16} color={Colors.gray400} />
          <Text style={styles.detailText}>{item.clockIn ? formatTime(item.clockIn) : '--:--'}</Text>
        </View>
        <View style={styles.detail}>
          <Ionicons name="log-out-outline" size={16} color={Colors.gray400} />
          <Text style={styles.detailText}>{item.clockOut ? formatTime(item.clockOut) : '--:--'}</Text>
        </View>
        <View style={styles.detail}>
          <Ionicons name="time-outline" size={16} color={Colors.gray400} />
          <Text style={styles.detailText}>
            {item.workHours ? `${Math.floor(item.workHours)}h ${Math.round((item.workHours % 1) * 60)}m` : '--:--'}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header title="Attendance List" />
      <FlatList
        data={attendanceHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => fetchHistory(true)} />
        }
        onEndReached={() => hasMore && fetchHistory()}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isLoading ? (
            <Loading fullscreen={false} />
          ) : (
            <EmptyState
              title="No attendance records"
              message="Your attendance history will appear here"
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
  list: {
    padding: Spacing.base,
  },
  item: {
    marginBottom: Spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  date: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
    textTransform: 'capitalize',
  },
  itemDetails: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
});
