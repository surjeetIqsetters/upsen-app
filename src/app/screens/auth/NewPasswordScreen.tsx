import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '@app/types';
import { useAuthStore } from '@app/store';
import { Colors, Typography, Spacing } from '@app/utils/constants';
import { Button, Input } from '@app/components';
import Toast from 'react-native-toast-message';

const newPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type NewPasswordInput = z.infer<typeof newPasswordSchema>;

export const NewPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'NewPassword'>>();
  const { updatePassword, isLoading } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: NewPasswordInput) => {
    try {
      await updatePassword(data.password);
      Toast.show({
        type: 'success',
        text1: 'Password Updated!',
        text2: 'Your password has been changed successfully.',
      });
      navigation.navigate('PasswordSuccess');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update password. Please try again.',
      });
    }
  };

  const getPasswordStrength = (pass: string): { strength: number; text: string; color: string } => {
    if (!pass) return { strength: 0, text: '', color: Colors.gray400 };
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;

    const levels = [
      { text: 'Weak', color: Colors.error },
      { text: 'Fair', color: Colors.warning },
      { text: 'Good', color: Colors.info },
      { text: 'Strong', color: Colors.success },
    ];
    return { strength, ...levels[strength - 1] || levels[0] };
  };

  const passwordStrength = getPasswordStrength(password);

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
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Your new password must be different from your previous password.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="New Password"
                placeholder="Enter new password"
                leftIcon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
                secureTextEntry
              />
            )}
          />

          {/* Password Strength */}
          {password && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSegment,
                      i <= passwordStrength.strength && {
                        backgroundColor: passwordStrength.color,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                {passwordStrength.text}
              </Text>
            </View>
          )}

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                leftIcon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
                secureTextEntry
              />
            )}
          />

          <Button
            title="Reset Password"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            style={styles.resetButton}
          />
        </View>
      </ScrollView>
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
  strengthContainer: {
    marginBottom: Spacing.md,
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  resetButton: {
    marginTop: Spacing.lg,
  },
});
