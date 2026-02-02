// Services exports
export { supabase } from './supabase';
export { api, default as apiClient } from './api';
export {
  chatApi,
  notesApi,
  eventsApi,
  documentsApi,
  approvalsApi,
  payrollApi,
  timeTrackingApi,
  expenseApi,
  reportsApi,
  employeeApi,
  leaveApi,
  taskApi,
  attendanceApi,
  notificationApi,
} from './api';

export {
  realtimeChat,
  type Message,
  type Conversation,
  type Participant,
} from './realtimeChat';

export {
  checkBiometricAvailability,
  authenticateWithBiometrics,
  isBiometricEnabled,
  enableBiometricAuth,
  disableBiometricAuth,
  getBiometricCredentials,
  biometricLogin,
  getBiometricTypeName,
  type BiometricAuthResult,
  type BiometricStatus,
} from './biometricAuth';

export {
  registerForPushNotifications,
  savePushToken,
  removePushToken,
  scheduleLocalNotification,
  scheduleReminder,
  cancelNotification,
  cancelAllNotifications,
  getScheduledNotifications,
  setBadgeCount,
  clearBadgeCount,
  getBadgeCount,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  removeNotificationListener,
  presentLocalNotification,
  sendTemplatedNotification,
  NotificationType,
  notificationTemplates,
  type PushTokenData,
  type NotificationData,
} from './pushNotifications';

export {
  exportData,
  shareExportedFile,
  exportAndShare,
  importData,
  deleteExportedFile,
  listExportedFiles,
  clearExportedFiles,
  type ExportFormat,
  type ExportDataType,
  type ExportOptions,
  type ExportResult,
} from './exportService';

export {
  getCurrentLanguage,
  setLanguage,
  loadLanguagePreference,
  t,
  isRTL,
  supportedLanguages,
  type Language,
} from './i18n';
