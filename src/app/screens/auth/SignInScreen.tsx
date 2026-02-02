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
import { AuthStackParamList, SignInFormData } from '@app/types';
import { useAuthStore } from '@app/store';
import { Colors, Typography, Spacing } from '@app/utils/constants';
import { Button, Input, Loading } from '@app/components';
import { isValidEmail } from '@app/utils/helpers';
import Toast from 'react-native-toast-message';

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type SignInInput = z.infer<typeof signInSchema>;

export const SignInScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { signIn, isLoading, error, clearError } = useAuthStore();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true, // Changed default value as per instruction
    },
  });

  const email = watch('email');
  const isEmailValid = isValidEmail(email);

  const onSubmit = async (data: SignInInput) => {
    clearError();
    try {
      const credentials = loginMethod === 'email'
        ? { email: data.email, password: data.password }
        : { phone: data.email, password: data.password };

      await signIn(credentials);
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'You have successfully signed in.',
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Sign In Failed',
        text2: error || 'Please check your credentials and try again.',
      });
    }
  };

  const handleSocialSignIn = (provider: 'apple' | 'google' | 'facebook') => {
    // Implement social sign-in
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: `${provider} sign-in will be available soon.`,
    });
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
          <Text style={styles.title}>Welcome Back 👋</Text>
          <Text style={styles.subtitle}>
            We happy to see you again! to use your account, you should sign in first.
          </Text>
        </View>

        {/* Login Method Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, loginMethod === 'email' && styles.activeTab]}
            onPress={() => setLoginMethod('email')}
          >
            <Text
              style={[
                styles.tabText,
                loginMethod === 'email' && styles.activeTabText,
              ]}
            >
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, loginMethod === 'phone' && styles.activeTab]}
            onPress={() => setLoginMethod('phone')}
          >
            <Text
              style={[
                styles.tabText,
                loginMethod === 'phone' && styles.activeTabText,
              ]}
            >
              Phone number
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label={loginMethod === 'email' ? 'Email' : 'Phone Number'}
                placeholder={
                  loginMethod === 'email'
                    ? 'Enter your email'
                    : 'Enter your phone number'
                }
                leftIcon={loginMethod === 'email' ? 'mail-outline' : 'call-outline'}
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
                keyboardType={loginMethod === 'email' ? 'email-address' : 'phone-pad'}
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
                placeholder="Enter your password"
                leftIcon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
                secureTextEntry
              />
            )}
          />

          {/* Remember me & Forgot password */}
          <View style={styles.options}>
            <Controller
              control={control}
              name="rememberMe"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  style={styles.rememberMe}
                  onPress={() => onChange(!value)}
                >
                  <Ionicons
                    name={value ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={value ? Colors.primary : Colors.gray400}
                  />
                  <Text style={styles.rememberMeText}>Remember me?</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={isLoading}
            style={styles.signInButton}
          />
        </View>

        {/* Social Sign In */}
        <View style={styles.socialSection}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign in with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialSignIn('apple')}
            >
              <Ionicons name="logo-apple" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialSignIn('google')}
            >
              <Ionicons name="logo-google" size={24} color={Colors.error} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialSignIn('facebook')}
            >
              <Ionicons name="logo-facebook" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>I don't have a account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
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
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rememberMeText: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  forgotPassword: {
    fontSize: Typography.size.base,
    color: Colors.primary,
    fontWeight: Typography.weight.medium,
  },
  signInButton: {
    marginBottom: Spacing.md,
  },
  socialSection: {
    marginBottom: Spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
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
});
