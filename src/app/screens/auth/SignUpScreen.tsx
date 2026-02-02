import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList, SignUpFormData } from '@app/types';
import { useAuthStore } from '@app/store';
import { Colors, Typography, Spacing, Countries } from '@app/utils/constants';
import { Button, Input } from '@app/components';
import { isValidEmail, isValidPassword } from '@app/utils/helpers';
import Toast from 'react-native-toast-message';
import Modal from 'react-native-modal';

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  countryCode: z.string().default('+1'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type SignUpInput = z.infer<typeof signUpSchema>;

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { signUp, isLoading, error, clearError } = useAuthStore();
  const [showCountryModal, setShowCountryModal] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema) as any,
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      countryCode: '+1',
      acceptTerms: false,
    },
  });

  const countryCode = watch('countryCode');
  const selectedCountry = Countries.find((c) => c.dialCode === countryCode) || Countries[0];

  const onSubmit = async (data: SignUpInput) => {
    clearError();
    try {
      await signUp({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        countryCode: data.countryCode,
      });

      Toast.show({
        type: 'success',
        text1: 'Account Created!',
        text2: 'Please verify your phone number.',
      });

      navigation.navigate('VerificationCode', {
        phone: `${data.countryCode}${data.phone}`,
        countryCode: data.countryCode,
        email: data.email,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Sign Up Failed',
        text2: error || 'Please check your information and try again.',
      });
    }
  };

  const renderCountryModal = () => (
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
  );

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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Please fill in the information below to create your account.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                leftIcon="person-outline"
                value={value}
                onChangeText={onChange}
                error={errors.fullName?.message}
              />
            )}
          />

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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Password"
                placeholder="Create a password"
                leftIcon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
                secureTextEntry
              />
            )}
          />

          {/* Phone Input with Country Code */}
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

          {/* Terms Checkbox */}
          <Controller
            control={control}
            name="acceptTerms"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => onChange(!value)}
              >
                <Ionicons
                  name={value ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={value ? Colors.primary : Colors.gray400}
                />
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            )}
          />
          {errors.acceptTerms && (
            <Text style={styles.errorText}>{errors.acceptTerms.message}</Text>
          )}

          {/* Sign Up Button */}
          <Button
            title="Sign Up"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={isLoading}
            style={styles.signUpButton}
          />
        </View>

        {/* Sign In Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderCountryModal()}
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  termsText: {
    flex: 1,
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: Typography.weight.medium,
  },
  errorText: {
    fontSize: Typography.size.sm,
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  signUpButton: {
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 'auto',
    paddingBottom: Spacing.md,
  },
  footerText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: Typography.size.base,
    color: Colors.primary,
    fontWeight: Typography.weight.semibold,
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
