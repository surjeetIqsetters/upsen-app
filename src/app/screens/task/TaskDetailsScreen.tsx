import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@app/types';
import { useTaskStore } from '@app/store';
import { Colors, Typography, Spacing, BorderRadius, TaskPriorities } from '@app/utils/constants';
import { Header, Card, Avatar, Loading } from '@app/components';
import { formatDate } from '@app/utils/helpers';

export const TaskDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetails'>>();
  const { taskId } = route.params;
  const { selectedTask, fetchTaskDetails, isLoading, updateTaskStatus } = useTaskStore();

  useEffect(() => {
    fetchTaskDetails(taskId);
  }, [taskId]);

  if (isLoading || !selectedTask) {
    return (
      <View style={styles.container}>
        <Header title="Task Details" />
        <Loading fullScreen />
      </View>
    );
  }

  const priority = TaskPriorities.find((p) => p.value === selectedTask.priority);

  return (
    <View style={styles.container}>
      <Header title="Task Details" />
      <ScrollView style={styles.content}>
        <Card style={styles.detailsCard}>
          <View style={styles.header}>
            <View style={[styles.priorityBadge, { backgroundColor: priority?.color + '20' }]}>
              <Text style={[styles.priorityText, { color: priority?.color }]}>{priority?.label}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{selectedTask.title}</Text>
          <Text style={styles.description}>{selectedTask.description}</Text>

          <View style={styles.metaSection}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={18} color={Colors.gray400} />
              <Text style={styles.metaText}>Due: {selectedTask.dueDate ? formatDate(selectedTask.dueDate) : 'No due date'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color={Colors.gray400} />
              <Text style={styles.metaText}>Est: {selectedTask.estimatedHours}h</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.membersCard}>
          <Text style={styles.sectionTitle}>Team Members</Text>
          <View style={styles.membersList}>
            {selectedTask.members?.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <Avatar source={member.user.avatarUrl} name={member.user.fullName} size="md" />
                <Text style={styles.memberName}>{member.user.fullName}</Text>
              </View>
            ))}
          </View>
        </Card>

        <TouchableOpacity
          style={[styles.statusButton, { backgroundColor: selectedTask.status === 'completed' ? Colors.success : Colors.primary }]}
          onPress={() => updateTaskStatus(taskId, selectedTask.status === 'completed' ? 'pending' : 'completed')}
        >
          <Text style={styles.statusButtonText}>{selectedTask.status === 'completed' ? 'Mark as Pending' : 'Mark as Complete'}</Text>
        </TouchableOpacity>
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
  detailsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  metaSection: {
    gap: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  membersCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  membersList: {
    gap: Spacing.md,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  memberName: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  statusButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.white,
  },
});
