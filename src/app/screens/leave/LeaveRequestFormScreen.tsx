import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@app/types';
import { useLeaveStore } from '@app/store';
import { Colors, Typography, Spacing, BorderRadius, LeaveTypes } from '@app/utils/constants';
import { Header, Card, Button, Input } from '@app/components';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';

const leaveFormSchema = z.object({
  leaveType: z.enum(['casual', 'sick', 'annual', 'unpaid']),
  reason: z.string().min(5, 'Please provide a reason (min 5 characters)'),
});

type LeaveFormInput = z.infer<typeof leaveFormSchema>;

export const LeaveRequestFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'LeaveRequestForm'>>();
  const { startDate, endDate } = route.params;
  const { createRequest, isSubmitting } = useLeaveStore();
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeaveFormInput>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      leaveType: 'casual',
      reason: '',
    },
  });

  const leaveType = watch('leaveType');

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
      });
      if (result.assets && result.assets[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick document',
      });
    }
  };

  const onSubmit = async (data: LeaveFormInput) => {
    try {
      await createRequest({
        leaveType: data.leaveType,
        startDate,
        endDate,
        reason: data.reason,
        document: selectedFile,
      });
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Your leave request has been submitted.',
      });
      navigation.navigate('SubmissionList' as never);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to submit leave request.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Leave Request" />
      <ScrollView style={styles.content}>
        {/* Date Range */}
        <Card style={styles.datesCard}>
          <Text style={styles.datesTitle}>Selected Dates</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>From</Text>
              <Text style={styles.dateValue}>{startDate}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={Colors.gray400} />
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>To</Text>
              <Text style={styles.dateValue}>{endDate}</Text>
            </View>
          </View>
        </Card>

        {/* Leave Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave Type</Text>
          <View style={styles.leaveTypes}>
            {LeaveTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.leaveTypeButton,
                  leaveType === type.value && { backgroundColor: type.color + '20', borderColor: type.color },
                ]}
                onPress={() => setValue('leaveType', type.value as any)}
              >
                <Text
                  style={[
                    styles.leaveTypeText,
                    leaveType === type.value && { color: type.color },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reason */}
        <Controller
          control={control}
          name="reason"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Reason"
              placeholder="Enter your reason for leave"
              value={value}
              onChangeText={onChange}
              error={errors.reason?.message}
              multiline
              numberOfLines={4}
              containerStyle={styles.reasonInput}
            />
          )}
        />

        {/* Document Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attachment (Optional)</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
            <Text style={styles.uploadText}>
              {selectedFile ? selectedFile.name : 'Upload document'}
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Submit Request"
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          style={styles.submitButton}
        />
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
  datesCard: {
    marginBottom: Spacing.lg,
  },
  datesTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBox: {
    flex: 1,
    backgroundColor: Colors.gray100,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  dateValue: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
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
  leaveTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  leaveTypeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  leaveTypeText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  reasonInput: {
    marginBottom: Spacing.lg,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});
