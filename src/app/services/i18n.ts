import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@upsen_language';

// Supported languages
export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar';

export const supportedLanguages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

// Translation dictionaries
const translations = {
  en: {
    // Common
    common: {
      appName: 'Upsen',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      done: 'Done',
      submit: 'Submit',
      continue: 'Continue',
      skip: 'Skip',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
    },
    // Auth
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      phoneNumber: 'Phone Number',
      fullName: 'Full Name',
      orContinueWith: 'Or continue with',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      verifyCode: 'Verify Code',
      resendCode: 'Resend Code',
      biometricLogin: 'Biometric Login',
      enableBiometric: 'Enable Biometric Login',
      disableBiometric: 'Disable Biometric Login',
    },
    // Navigation
    navigation: {
      home: 'Home',
      employees: 'Employees',
      tasks: 'Tasks',
      news: 'News',
      profile: 'Profile',
      attendance: 'Attendance',
      leaves: 'Leaves',
      settings: 'Settings',
      notifications: 'Notifications',
      messages: 'Messages',
      calendar: 'Calendar',
      analytics: 'Analytics',
    },
    // Home
    home: {
      goodMorning: 'Good Morning',
      goodAfternoon: 'Good Afternoon',
      goodEvening: 'Good Evening',
      checkIn: 'Check In',
      checkOut: 'Check Out',
      checkedInAt: 'Checked in at',
      checkedOutAt: 'Checked out at',
      workingHours: 'Working Hours',
      todayAttendance: "Today's Attendance",
      upcomingLeaves: 'Upcoming Leaves',
      pendingTasks: 'Pending Tasks',
      recentActivity: 'Recent Activity',
    },
    // Attendance
    attendance: {
      title: 'Attendance',
      checkInSuccess: 'Check-in successful!',
      checkOutSuccess: 'Check-out successful!',
      alreadyCheckedIn: 'You have already checked in',
      alreadyCheckedOut: 'You have already checked out',
      locationRequired: 'Location access is required',
      attendanceHistory: 'Attendance History',
      monthlyOverview: 'Monthly Overview',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      onLeave: 'On Leave',
    },
    // Leaves
    leaves: {
      title: 'Leave Management',
      applyLeave: 'Apply for Leave',
      leaveType: 'Leave Type',
      startDate: 'Start Date',
      endDate: 'End Date',
      reason: 'Reason',
      attachment: 'Attachment',
      annualLeave: 'Annual Leave',
      sickLeave: 'Sick Leave',
      casualLeave: 'Casual Leave',
      unpaidLeave: 'Unpaid Leave',
      maternityLeave: 'Maternity Leave',
      paternityLeave: 'Paternity Leave',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
      leaveBalance: 'Leave Balance',
      daysRemaining: 'days remaining',
    },
    // Tasks
    tasks: {
      title: 'Tasks',
      createTask: 'Create Task',
      editTask: 'Edit Task',
      taskTitle: 'Task Title',
      description: 'Description',
      dueDate: 'Due Date',
      priority: 'Priority',
      assignee: 'Assignee',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      todo: 'To Do',
      inProgress: 'In Progress',
      completed: 'Completed',
      overdue: 'Overdue',
      markComplete: 'Mark as Complete',
      markIncomplete: 'Mark as Incomplete',
    },
    // Employees
    employees: {
      title: 'Employees',
      addEmployee: 'Add Employee',
      editEmployee: 'Edit Employee',
      employeeDetails: 'Employee Details',
      department: 'Department',
      position: 'Position',
      joinDate: 'Join Date',
      contactInfo: 'Contact Information',
      workInfo: 'Work Information',
      personalInfo: 'Personal Information',
    },
    // Settings
    settings: {
      title: 'Settings',
      account: 'Account',
      notifications: 'Notifications',
      appearance: 'Appearance',
      language: 'Language',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      systemDefault: 'System Default',
      privacy: 'Privacy & Security',
      help: 'Help & Support',
      about: 'About',
      version: 'Version',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      logout: 'Log Out',
      deleteAccount: 'Delete Account',
    },
    // Notifications
    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark all as read',
      noNotifications: 'No notifications yet',
      leaveApproved: 'Leave Approved',
      leaveRejected: 'Leave Rejected',
      taskAssigned: 'Task Assigned',
      taskDue: 'Task Due Soon',
      announcement: 'Announcement',
    },
    // Errors
    errors: {
      generic: 'Something went wrong. Please try again.',
      network: 'Network error. Please check your connection.',
      unauthorized: 'Session expired. Please sign in again.',
      notFound: 'Not found.',
      validation: 'Please check your input and try again.',
    },
  },
  // Spanish translations (sample)
  es: {
    common: {
      appName: 'Upsen',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      search: 'Buscar',
    },
    auth: {
      signIn: 'Iniciar Sesión',
      signUp: 'Registrarse',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
    },
    navigation: {
      home: 'Inicio',
      employees: 'Empleados',
      tasks: 'Tareas',
      profile: 'Perfil',
    },
    home: {
      goodMorning: 'Buenos Días',
      goodAfternoon: 'Buenas Tardes',
      goodEvening: 'Buenas Noches',
      checkIn: 'Entrar',
      checkOut: 'Salir',
    },
  },
  // French translations (sample)
  fr: {
    common: {
      appName: 'Upsen',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
    },
    auth: {
      signIn: 'Connexion',
      signUp: 'Inscription',
      email: 'Email',
      password: 'Mot de passe',
    },
    navigation: {
      home: 'Accueil',
      employees: 'Employés',
      profile: 'Profil',
    },
  },
  // German translations (sample)
  de: {
    common: {
      appName: 'Upsen',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      cancel: 'Abbrechen',
      save: 'Speichern',
    },
    auth: {
      signIn: 'Anmelden',
      signUp: 'Registrieren',
      email: 'E-Mail',
      password: 'Passwort',
    },
    navigation: {
      home: 'Startseite',
      employees: 'Mitarbeiter',
      profile: 'Profil',
    },
  },
  // Chinese translations (sample)
  zh: {
    common: {
      appName: 'Upsen',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      cancel: '取消',
      save: '保存',
    },
    auth: {
      signIn: '登录',
      signUp: '注册',
      email: '邮箱',
      password: '密码',
    },
    navigation: {
      home: '首页',
      employees: '员工',
      profile: '个人资料',
    },
  },
  // Japanese translations (sample)
  ja: {
    common: {
      appName: 'Upsen',
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      cancel: 'キャンセル',
      save: '保存',
    },
    auth: {
      signIn: 'ログイン',
      signUp: '登録',
      email: 'メール',
      password: 'パスワード',
    },
    navigation: {
      home: 'ホーム',
      employees: '従業員',
      profile: 'プロフィール',
    },
  },
  // Arabic translations (sample)
  ar: {
    common: {
      appName: 'Upsen',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجاح',
      cancel: 'إلغاء',
      save: 'حفظ',
    },
    auth: {
      signIn: 'تسجيل الدخول',
      signUp: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
    },
    navigation: {
      home: 'الرئيسية',
      employees: 'الموظفين',
      profile: 'الملف الشخصي',
    },
  },
};

// Simple i18n implementation without external library
class SimpleI18n {
  locale: Language = 'en';
  defaultLocale: Language = 'en';
  enableFallback: boolean = true;
  private translations: typeof translations;

  constructor(translationsData: typeof translations) {
    this.translations = translationsData;
    this.locale = 'en';
    this.defaultLocale = 'en';
    this.enableFallback = true;
  }

  t(key: string, options?: Record<string, any>): string {
    const keys = key.split('.');
    let value: any = this.translations[this.locale] || this.translations[this.defaultLocale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Try fallback locale
        if (this.enableFallback && this.locale !== this.defaultLocale) {
          let fallbackValue: any = this.translations[this.defaultLocale];
          for (const fk of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
              fallbackValue = fallbackValue[fk];
            } else {
              return key; // Return key if not found
            }
          }
          value = fallbackValue;
        } else {
          return key; // Return key if not found
        }
        break;
      }
    }
    
    if (typeof value === 'string' && options) {
      // Simple interpolation
      return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return options[key] !== undefined ? String(options[key]) : match;
      });
    }
    
    return typeof value === 'string' ? value : key;
  }
}

// Initialize i18n
const i18n = new SimpleI18n(translations);

// Set default locale
i18n.defaultLocale = 'en';
i18n.enableFallback = true;
i18n.locale = 'en';

/**
 * Get current language
 */
export const getCurrentLanguage = (): Language => {
  return i18n.locale as Language;
};

/**
 * Set language
 */
export const setLanguage = async (language: Language): Promise<void> => {
  i18n.locale = language;
  await AsyncStorage.setItem(STORAGE_KEY, language);
};

/**
 * Load saved language preference
 */
export const loadLanguagePreference = async (): Promise<void> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedLanguage && supportedLanguages.some((lang) => lang.code === savedLanguage as Language)) {
      i18n.locale = savedLanguage as Language;
    }
  } catch (error) {
    console.error('Error loading language preference:', error);
  }
};

/**
 * Translate function
 */
export const t = (key: string, options?: Record<string, any>): string => {
  return i18n.t(key, options);
};

/**
 * Check if language is RTL
 */
export const isRTL = (language?: Language): boolean => {
  const lang = language || getCurrentLanguage();
  return lang === 'ar';
};

export default i18n;
