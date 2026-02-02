// Store exports
export { useAuthStore } from './authStore';
export { useAttendanceStore } from './attendanceStore';
export { useEmployeeStore } from './employeeStore';
export { useLeaveStore } from './leaveStore';
export { useTaskStore } from './taskStore';
export { useNotificationStore } from './notificationStore';
export { useThemeStore, type ThemeMode, type ThemeColors } from './themeStore';
export { useOfflineStore, type QueueItem, type QueueAction } from './offlineStore';
export { useAnalyticsStore, type TimeRange, type MetricData, type ChartData, type DashboardStats, type DepartmentStats } from './analyticsStore';

// New stores
export { useChatStore } from './chatStore';
export { useNotesStore, type Note } from './notesStore';
export { useEventsStore, type Event } from './eventsStore';
export { useDocumentsStore, type Document } from './documentsStore';
export { useApprovalsStore, type Approval, type ApprovalType, type ApprovalStatus } from './approvalsStore';
export { usePayrollStore, type PayrollRecord } from './payrollStore';
export { useTimeTrackingStore, type TimeEntry, type CurrentSession } from './timeTrackingStore';
export { useExpenseStore, type Expense, type ExpenseStatus, type ExpenseCategory, expenseCategories } from './expenseStore';
export { useLanguageStore } from './languageStore';
