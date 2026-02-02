import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Task } from '@app/types';
import { useTaskStore } from '@app/store';
import { Colors, Typography, Spacing, BorderRadius, TaskPriorities } from '@app/utils/constants';
import { Card, Avatar, EmptyState, Loading } from '@app/components';
import { formatDate } from '@app/utils/helpers';

export const TaskScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { tasks, fetchTasks, isLoading, hasMore } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTasks(true);
  }, []);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  const renderTask = ({ item }: { item: Task }) => {
    const priority = TaskPriorities.find((p) => p.value === item.priority);
    return (
      <Card style={styles.taskCard} onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}>
        <View style={styles.taskHeader}>
          <View style={[styles.priorityBadge, { backgroundColor: priority?.color + '20' }]}>
            <Text style={[styles.priorityText, { color: priority?.color }]}>{priority?.label}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={20} color={Colors.gray400} />
          </TouchableOpacity>
        </View>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.taskFooter}>
          <View style={styles.taskMembers}>
            {item.members?.slice(0, 3).map((member, index) => (
              <Avatar key={member.id} source={member.user.avatarUrl} name={member.user.fullName} size="xs" style={{ marginLeft: index > 0 ? -8 : 0 }} />
            ))}
          </View>
          <View style={styles.taskDue}>
            <Ionicons name="time-outline" size={14} color={Colors.gray400} />
            <Text style={styles.taskDueText}>{item.dueDate ? formatDate(item.dueDate) : 'No due date'}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Calendar Strip */}
      <View style={styles.calendarStrip}>
        {dates.map((date) => {
          const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = new Date(date).getDate();
          const isSelected = date === selectedDate;
          return (
            <TouchableOpacity key={date} style={[styles.dateItem, isSelected && styles.dateItemActive]} onPress={() => setSelectedDate(date)}>
              <Text style={[styles.dayName, isSelected && styles.dateTextActive]}>{dayName}</Text>
              <Text style={[styles.dayNum, isSelected && styles.dateTextActive]}>{dayNum}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onEndReached={() => hasMore && fetchTasks()}
        ListEmptyComponent={
          isLoading ? (
            <Loading fullscreen={false} />
          ) : (
            <EmptyState
              title="No tasks"
              message="You don't have any tasks at the moment"
              icon="clipboard-outline"
            />
          )
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NewTask')}>
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateItem: {
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  dateItemActive: {
    backgroundColor: Colors.primary,
  },
  dayName: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dayNum: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  dateTextActive: {
    color: Colors.white,
  },
  list: {
    padding: Spacing.base,
  },
  taskCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
  taskTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  taskDescription: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMembers: {
    flexDirection: 'row',
  },
  taskDue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  taskDueText: {
    fontSize: Typography.size.sm,
    color: Colors.gray400,
  },
  fab: {
    position: 'absolute',
    right: Spacing.base,
    bottom: Spacing.base,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...{
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
});
