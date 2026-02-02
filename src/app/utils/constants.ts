import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Colors - Based on the UI design
export const Colors = {
  // Primary
  primary: '#1E40AF', // Blue-800
  primaryLight: '#3B82F6', // Blue-500
  primaryDark: '#1E3A8A', // Blue-900
  primaryLighter: '#DBEAFE', // Blue-100

  // Secondary
  secondary: '#10B981', // Emerald-500
  secondaryLight: '#34D399', // Emerald-400
  secondaryDark: '#059669', // Emerald-600

  // Accent
  accent: '#F59E0B', // Amber-500
  accentLight: '#FBBF24', // Amber-400

  // Semantic
  success: '#10B981', // Emerald-500
  successLight: '#D1FAE5', // Emerald-100
  error: '#EF4444', // Red-500
  errorLight: '#FEE2E2', // Red-100
  warning: '#F59E0B', // Amber-500
  warningLight: '#FEF3C7', // Amber-100
  info: '#3B82F6', // Blue-500
  infoLight: '#DBEAFE', // Blue-100

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Background
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Border
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// Typography
export const Typography = {
  // Font sizes
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Font weights
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// Border radius
export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
};

// Screen dimensions
export const Screen = {
  width,
  height,
  isSmall: width < 375,
  isMedium: width >= 375 && width < 414,
  isLarge: width >= 414,
};

// Animation durations
export const Animation = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// API Configuration
export const APIConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.upsen.com',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Supabase Configuration
export const SupabaseConfig = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};

// Storage Keys
export const StorageKeys = {
  authSession: '@upsen_auth_session',
  authUser: '@upsen_auth_user',
  onboardingComplete: '@upsen_onboarding_complete',
  biometricEnabled: '@upsen_biometric_enabled',
  notificationToken: '@upsen_notification_token',
  settings: '@upsen_settings',
  theme: '@upsen_theme',
  offline: '@upsen_offline',
  analytics: '@upsen_analytics',
};

// Pagination
export const Pagination = {
  defaultLimit: 20,
  maxLimit: 100,
};

// Date Formats
export const DateFormats = {
  display: 'MMM dd, yyyy',
  displayTime: 'hh:mm a',
  displayDateTime: 'MMM dd, yyyy - hh:mm a',
  api: 'yyyy-MM-dd',
  apiDateTime: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  monthYear: 'MMMM yyyy',
  day: 'EEEE',
  shortDay: 'EEE',
};

// Validation Rules
export const ValidationRules = {
  password: {
    minLength: 8,
    maxLength: 50,
    requireUppercase: true,
    requireNumber: true,
    requireSpecialChar: false,
  },
  phone: {
    minLength: 10,
    maxLength: 15,
  },
  name: {
    minLength: 2,
    maxLength: 100,
  },
};

// Countries list for phone input
export const Countries: { code: string; name: string; dialCode: string }[] = [
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'IT', name: 'Italy', dialCode: '+39' },
  { code: 'ES', name: 'Spain', dialCode: '+34' },
  { code: 'JP', name: 'Japan', dialCode: '+81' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'BR', name: 'Brazil', dialCode: '+55' },
  { code: 'MX', name: 'Mexico', dialCode: '+52' },
  { code: 'RU', name: 'Russia', dialCode: '+7' },
  { code: 'KR', name: 'South Korea', dialCode: '+82' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62' },
  { code: 'SG', name: 'Singapore', dialCode: '+65' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31' },
  { code: 'SE', name: 'Sweden', dialCode: '+46' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41' },
];

// Leave Types
export const LeaveTypes = [
  { value: 'casual', label: 'Casual', color: Colors.primary },
  { value: 'sick', label: 'Sick', color: Colors.error },
  { value: 'annual', label: 'Annual', color: Colors.success },
  { value: 'unpaid', label: 'Unpaid', color: Colors.gray500 },
];

// Task Priorities
export const TaskPriorities = [
  { value: 'low', label: 'Low', color: Colors.info },
  { value: 'medium', label: 'Medium', color: Colors.warning },
  { value: 'high', label: 'High', color: Colors.error },
];

// Attendance Status
export const AttendanceStatuses = [
  { value: 'attending', label: 'Attending', color: Colors.primary },
  { value: 'late', label: 'Late', color: Colors.warning },
  { value: 'absent', label: 'Absent', color: Colors.error },
  { value: 'on_leave', label: 'On Leave', color: Colors.info },
  { value: 'sick_leave', label: 'Sick Leave', color: Colors.error },
];

// Request Status
export const RequestStatuses = [
  { value: 'waiting', label: 'Waiting', color: Colors.warning, bgColor: Colors.warningLight },
  { value: 'approved', label: 'Approved', color: Colors.success, bgColor: Colors.successLight },
  { value: 'rejected', label: 'Rejected', color: Colors.error, bgColor: Colors.errorLight },
  { value: 'cancelled', label: 'Cancelled', color: Colors.gray500, bgColor: Colors.gray100 },
];

import { onboarding1, onboarding2, onboarding3, onboarding4 } from '@app/../assets/images';

// Onboarding slides
export const OnboardingSlides = [
  {
    id: '1',
    title: 'Connect, Collaborate, Create',
    description: 'Foster collaboration effortlessly through our integrated chat feature, connecting you with your team in real-time.',
    image: onboarding1,
  },
  {
    id: '2',
    title: 'Goodbye paperwork. Hello hassle-free leave requests',
    description: 'Submit, track, and manage your time off directly from the app. It\'s like having your own leave genie.',
    image: onboarding2,
  },
  {
    id: '3',
    title: 'Rest assured, your privacy is our priority',
    description: 'Your data is protected like the crown jewels. We\'re GDPR compliant and committed to keeping your information safe.',
    image: onboarding3,
  },
  {
    id: '4',
    title: 'Discover the Power of Insights',
    description: 'Gain valuable insights into your work patterns, productivity trends, and achievements.',
    image: onboarding4,
  },
];

// Tab bar icons
export const TabBarIcons: Record<string, { active: string; inactive: string }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Employee: { active: 'people', inactive: 'people-outline' },
  Task: { active: 'clipboard', inactive: 'clipboard-outline' },
  News: { active: 'newspaper', inactive: 'newspaper-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};
