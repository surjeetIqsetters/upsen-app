import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { useNotesStore } from '@app/store/notesStore';
import { Button } from '@app/components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CreateNoteScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { createNote, isLoading } = useNotesStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    try {
      await createNote({
        title: title.trim(),
        content: content.trim(),
        reminderTime: hasReminder ? reminderDate : undefined,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create note');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setReminderDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Note</Text>
        <TouchableOpacity onPress={handleCreate} disabled={isLoading}>
          <Text style={[styles.saveButton, isLoading && styles.disabled]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Title Input */}
        <TextInput
          style={styles.titleInput}
          placeholder="Note Title"
          placeholderTextColor={Colors.gray400}
          value={title}
          onChangeText={setTitle}
        />

        {/* Content Input */}
        <TextInput
          style={styles.contentInput}
          placeholder="Write your note here..."
          placeholderTextColor={Colors.gray400}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {/* Reminder Section */}
        <View style={styles.section}>
          <View style={styles.reminderHeader}>
            <View style={styles.reminderLabel}>
              <Ionicons name="alarm-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Set Reminder</Text>
            </View>
            <Switch
              value={hasReminder}
              onValueChange={setHasReminder}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={hasReminder ? Colors.primary : Colors.gray400}
            />
          </View>

          {hasReminder && (
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {reminderDate.toLocaleString()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={reminderDate}
              mode="datetime"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
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
  saveButton: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  titleInput: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    padding: 0,
  },
  contentInput: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    lineHeight: 24,
    minHeight: 200,
    padding: 0,
  },
  section: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.base,
    marginTop: Spacing.md,
  },
  datePickerText: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
});
