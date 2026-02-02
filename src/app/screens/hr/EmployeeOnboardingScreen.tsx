import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { useEmployeeStore } from '@app/store/employeeStore';
import { Button } from '@app/components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const departments = [
  'Engineering',
  'Sales',
  'Marketing',
  'HR',
  'Finance',
  'Operations',
  'Customer Support',
];

const positions = [
  'Junior',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'VP',
];

export const EmployeeOnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { createEmployee, isLoading } = useEmployeeStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    employeeId: '',
    dateOfJoining: new Date(),
    salary: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const updateForm = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.phone) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
    }
    if (step === 2) {
      if (!formData.department || !formData.position || !formData.employeeId) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    try {
      await createEmployee({
        ...formData,
        salary: parseFloat(formData.salary) || 0,
      });
      Alert.alert('Success', 'Employee onboarded successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to onboard employee');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateForm('dateOfJoining', selectedDate);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter full name"
          placeholderTextColor={Colors.gray400}
          value={formData.fullName}
          onChangeText={(text) => updateForm('fullName', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email address"
          placeholderTextColor={Colors.gray400}
          value={formData.email}
          onChangeText={(text) => updateForm('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor={Colors.gray400}
          value={formData.phone}
          onChangeText={(text) => updateForm('phone', text)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter address"
          placeholderTextColor={Colors.gray400}
          value={formData.address}
          onChangeText={(text) => updateForm('address', text)}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Work Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Employee ID *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter employee ID"
          placeholderTextColor={Colors.gray400}
          value={formData.employeeId}
          onChangeText={(text) => updateForm('employeeId', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Department *</Text>
        <View style={styles.optionsContainer}>
          {departments.map((dept) => (
            <TouchableOpacity
              key={dept}
              style={[
                styles.optionChip,
                formData.department === dept && styles.selectedOptionChip,
              ]}
              onPress={() => updateForm('department', dept)}
            >
              <Text
                style={[
                  styles.optionChipText,
                  formData.department === dept && styles.selectedOptionChipText,
                ]}
              >
                {dept}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Position *</Text>
        <View style={styles.optionsContainer}>
          {positions.map((pos) => (
            <TouchableOpacity
              key={pos}
              style={[
                styles.optionChip,
                formData.position === pos && styles.selectedOptionChip,
              ]}
              onPress={() => updateForm('position', pos)}
            >
              <Text
                style={[
                  styles.optionChipText,
                  formData.position === pos && styles.selectedOptionChipText,
                ]}
              >
                {pos}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Date of Joining</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {formData.dateOfJoining.toLocaleDateString()}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={formData.dateOfJoining}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Salary</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter annual salary"
          placeholderTextColor={Colors.gray400}
          value={formData.salary}
          onChangeText={(text) => updateForm('salary', text)}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Emergency Contact</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Contact Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter emergency contact name"
          placeholderTextColor={Colors.gray400}
          value={formData.emergencyContact}
          onChangeText={(text) => updateForm('emergencyContact', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Contact Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter emergency contact phone"
          placeholderTextColor={Colors.gray400}
          value={formData.emergencyPhone}
          onChangeText={(text) => updateForm('emergencyPhone', text)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewTitle}>Review Information</Text>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Name:</Text>
          <Text style={styles.reviewValue}>{formData.fullName}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Email:</Text>
          <Text style={styles.reviewValue}>{formData.email}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Department:</Text>
          <Text style={styles.reviewValue}>{formData.department}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Position:</Text>
          <Text style={styles.reviewValue}>{formData.position}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Employee ID:</Text>
          <Text style={styles.reviewValue}>{formData.employeeId}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Onboard Employee</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              s <= step && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        {step < 3 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Submitting...' : 'Complete Onboarding'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray300,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 30,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  stepContent: {
    marginBottom: Spacing.xl,
  },
  stepTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
  },
  selectedOptionChip: {
    backgroundColor: Colors.primary,
  },
  optionChipText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  selectedOptionChipText: {
    color: Colors.white,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateButtonText: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
  },
  reviewTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  reviewRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  reviewLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    width: 100,
  },
  reviewValue: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.medium,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  backButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonText: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.medium,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  nextButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.white,
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.success,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.white,
  },
});
