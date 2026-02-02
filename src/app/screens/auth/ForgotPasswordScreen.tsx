import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '@app/types';
import { useAuthStore } from '@app/store';
import { Colors, Typography, Spacing, Countries } from '@app/utils/constants';
import { Button, Input } from '@app/components';
import Toast from 'react-native-toast-message';
import Modal from 'react-native-modal';

const forgotPasswordSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  countryCode: z.string().default('+1'),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { resetPassword, isLoading } = useAuthStore();
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [showCountryModal, setShowCountryModal] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema) as any,
    defaultValues: {
      email: '',
      phone: '',
      countryCode: '+1',
    },
  });

  const countryCode = watch('countryCode');
  const selectedCountry = Countries.find((c) => c.dialCode === countryCode) || Countries[0];

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      if (method === 'email' && data.email) {
        await resetPassword(data.email);
        Toast.show({
          type: 'success',
          text1: 'Email Sent!',
          text2: 'Check your email for password reset instructions.',
        });
        navigation.navigate('SignIn');
      } else if (method === 'phone' && data.phone) {
        // Navigate to verification code screen
        navigation.navigate('VerificationCode', {
          phone: `${data.countryCode}${data.phone}`,
          countryCode: data.countryCode,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send reset instructions. Please try again.',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email or phone number to reset your password.
          </Text>
        </View>

        {/* Method Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, method === 'email' && styles.activeTab]}
            onPress={() => setMethod('email')}
          >
            <Text style={[styles.tabText, method === 'email' && styles.activeTabText]}>
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, method === 'phone' && styles.activeTab]}
            onPress={() => setMethod('phone')}
          >
            <Text style={[styles.tabText, method === 'phone' && styles.activeTabText]}>
              Phone
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {method === 'email' ? (
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  leftIcon="mail-outline"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
          ) : (
            <View style={styles.phoneContainer}>
              <Text style={styles.phoneLabel}>Phone Number</Text>
              <View style={styles.phoneInputRow}>
                <TouchableOpacity
                  style={styles.countryCodeButton}
                  onPress={() => setShowCountryModal(true)}
                >
                  <Text style={styles.countryCodeText}>{selectedCountry.dialCode}</Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.gray400} />
                </TouchableOpacity>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.phoneInputWrapper}>
                      <Input
                        placeholder="Enter phone number"
                        value={value}
                        onChangeText={onChange}
                        error={errors.phone?.message}
                        keyboardType="phone-pad"
                        containerStyle={styles.phoneInput}
                      />
                    </View>
                  )}
                />
              </View>
            </View>
          )}

          <Button
            title="Continue"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            style={styles.continueButton}
          />
        </View>
      </ScrollView>

      {/* Country Modal */}
      <Modal
        isVisible={showCountryModal}
        onBackdropPress={() => setShowCountryModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Region</Text>
            <TouchableOpacity onPress={() => setShowCountryModal(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {Countries.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={styles.countryItem}
                onPress={() => {
                  setValue('countryCode', country.dialCode);
                  setShowCountryModal(false);
                }}
              >
                <Text style={styles.countryName}>{country.name}</Text>
                <Text style={styles.countryCode}>{country.dialCode}</Text>
                {country.dialCode === countryCode && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.base,
  },
  backButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.xs,
    alignSelf: 'flex-start',
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
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
  form: {
    marginBottom: Spacing.lg,
  },
  phoneContainer: {
    marginBottom: Spacing.base,
  },
  phoneLabel: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    height: 56,
    gap: Spacing.xs,
  },
  countryCodeText: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInput: {
    marginBottom: 0,
  },
  continueButton: {
    marginTop: Spacing.lg,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  countryName: {
    flex: 1,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  countryCode: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    marginRight: Spacing.md,
  },
});
