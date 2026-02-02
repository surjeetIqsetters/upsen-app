import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useTaskStore } from '@app/store';
import { Colors, Typography, Spacing, BorderRadius, TaskPriorities } from '@app/utils/constants';
import { Header, Button, Input } from '@app/components';
import { formatDate } from '@app/utils/helpers';
import Toast from 'react-native-toast-message';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date(),
  estimatedHours: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export const NewTaskScreen: React.FC = () => {
  const navigation = useNavigation();
  const { createTask, isSubmitting } = useTaskStore();
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: new Date(),
      estimatedHours: '',
    },
  });

  const priority = watch('priority');
  const dueDate = watch('dueDate');

  const onSubmit = async (data: TaskFormData) => {
    try {
      await createTask({
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate.toISOString(),
        estimatedHours: data.estimatedHours,
        members: [],
      });
      Toast.show({
        type: 'success',
        text1: 'Task Created!',
        text2: 'Your task has been created successfully.',
      });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create task.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="New Task" />
      <ScrollView style={styles.content}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => <Input label="Title" placeholder="Enter task title" value={value} onChangeText={onChange} error={errors.title?.message} />}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input label="Description" placeholder="Enter task description" value={value} onChangeText={onChange} error={errors.description?.message} multiline numberOfLines={4} containerStyle={styles.descriptionInput} />
          )}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.priorityRow}>
            {TaskPriorities.map((p) => (
              <TouchableOpacity key={p.value} style={[styles.priorityButton, priority === p.value && { backgroundColor: p.color + '20', borderColor: p.color }]} onPress={() => setValue('priority', p.value as any)}>
                <Text style={[styles.priorityButtonText, priority === p.value && { color: p.color }]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Due Date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setDatePickerVisible(true)}>
            <Ionicons name="calendar-outline" size={20} color={Colors.gray400} />
            <Text style={styles.dateButtonText}>{formatDate(dueDate.toISOString())}</Text>
          </TouchableOpacity>
        </View>

        <Controller
          control={control}
          name="estimatedHours"
          render={({ field: { onChange, value } }) => <Input label="Estimated Hours" placeholder="e.g., 4" value={value} onChangeText={onChange} keyboardType="numeric" />}
        />

        <Button title="Create Task" onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} style={styles.submitButton} />
      </ScrollView>

      <DateTimePickerModal isVisible={isDatePickerVisible} mode="date" onConfirm={(date) => {
        setValue('dueDate', date);
        setDatePickerVisible(false);
      }} onCancel={() => setDatePickerVisible(false)} />
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
  descriptionInput: {
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
  },
  dateButtonText: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});
