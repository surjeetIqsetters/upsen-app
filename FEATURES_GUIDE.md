# Upsen HR - Complete Features Guide

This guide documents all working features and how to use them.

## Table of Contents

1. [Chat System](#chat-system)
2. [Notes Management](#notes-management)
3. [Calendar & Events](#calendar--events)
4. [Document Management](#document-management)
5. [Approval Workflow](#approval-workflow)
6. [Payroll Management](#payroll-management)
7. [Time Tracking](#time-tracking)
8. [Expense Management](#expense-management)
9. [Reports & Analytics](#reports--analytics)

---

## Chat System

### Features
- **Real-time messaging** using Supabase Realtime
- **Direct messages** and **group chats**
- **File sharing** (images, documents)
- **Typing indicators**
- **Unread message count**
- **Message persistence**

### Usage

```typescript
import { useChatStore } from '@app/store';
import { realtimeChat } from '@app/services';

// In your component
const {
  conversations,
  currentMessages,
  isLoading,
  isSending,
  fetchConversations,
  sendMessage,
  createConversation,
  subscribeToConversation,
  setCurrentConversation,
} = useChatStore();

// Fetch conversations
useEffect(() => {
  fetchConversations();
}, []);

// Subscribe to real-time messages
useEffect(() => {
  if (conversationId) {
    const unsubscribe = subscribeToConversation(conversationId);
    return () => unsubscribe();
  }
}, [conversationId]);

// Send a message
await sendMessage(conversationId, 'Hello!', 'text');

// Create a new conversation
const newConversationId = await createConversation(
  ['user-id-1', 'user-id-2'],
  false, // isGroup
  'Conversation Name' // optional for groups
);

// Upload and send file
await uploadAndSendFile(conversationId, file, 'image');
```

### API Methods

```typescript
// Chat API
chatApi.getConversations();
chatApi.getMessages(conversationId, page, limit);
chatApi.sendMessage(conversationId, content, type);
chatApi.createConversation(participantIds, isGroup, name);
chatApi.markAsRead(conversationId);
```

---

## Notes Management

### Features
- **Create, read, update, delete notes**
- **Search notes** by title or content
- **Set reminders** for notes
- **Share notes** with other users
- **Persistent storage**

### Usage

```typescript
import { useNotesStore } from '@app/store';

const {
  notes,
  isLoading,
  isSaving,
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
  setReminder,
  getFilteredNotes,
} = useNotesStore();

// Fetch all notes
await fetchNotes();

// Create a note
const noteId = await createNote({
  title: 'Meeting Notes',
  content: 'Discussed Q4 goals...',
  reminderTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
});

// Update a note
await updateNote(noteId, { title: 'Updated Title' });

// Share with users
await shareNote(noteId, ['user-id-1', 'user-id-2']);

// Set reminder
await setReminder(noteId, new Date('2024-12-25T09:00:00'));

// Search notes
const filtered = getFilteredNotes(); // Uses searchQuery from store
```

---

## Calendar & Events

### Features
- **Create and manage events**
- **Multiple event types** (office, meeting, training, holiday)
- **Join/leave events**
- **Event reminders**
- **Attendee management**
- **Monthly/weekly views**

### Usage

```typescript
import { useEventsStore } from '@app/store';

const {
  events,
  isLoading,
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getEventsForDate,
  getEventsForMonth,
} = useEventsStore();

// Fetch events for a date range
await fetchEvents(startDate, endDate);

// Create an event
const eventId = await createEvent({
  title: 'Team Meeting',
  description: 'Weekly sync',
  eventType: 'meeting',
  startTime: new Date('2024-01-15T10:00:00'),
  endTime: new Date('2024-01-15T11:00:00'),
  location: 'Conference Room A',
});

// Get events for a specific date
const dayEvents = getEventsForDate(new Date());

// Join an event
await joinEvent(eventId);

// Leave an event
await leaveEvent(eventId);
```

---

## Document Management

### Features
- **Upload documents** with progress tracking
- **Categorize documents** (HR, Finance, Legal, etc.)
- **Download documents**
- **Share documents**
- **Search and filter**

### Usage

```typescript
import { useDocumentsStore } from '@app/store';

const {
  documents,
  isLoading,
  isUploading,
  uploadProgress,
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  shareDocument,
  getFilteredDocuments,
} = useDocumentsStore();

// Fetch documents
await fetchDocuments();

// Upload a document
await uploadDocument({
  file: selectedFile,
  name: 'Contract.pdf',
  category: 'Legal',
  description: 'Employment contract',
});

// Download a document
await downloadDocument(documentId, 'Contract.pdf');

// Share a document
await shareDocument(documentId, 'Contract.pdf');

// Filter by category and search
const filtered = getFilteredDocuments();
```

---

## Approval Workflow

### Features
- **Multi-type approvals** (leave, expense, timesheet, overtime)
- **Approve/reject requests**
- **View approval history**
- **Filter by status**
- **Statistics tracking**

### Usage

```typescript
import { useApprovalsStore } from '@app/store';

const {
  approvals,
  pendingCount,
  isLoading,
  isProcessing,
  fetchApprovals,
  approveRequest,
  rejectRequest,
  getFilteredApprovals,
  getPendingApprovals,
  getApprovalStats,
} = useApprovalsStore();

// Fetch all approvals
await fetchApprovals();

// Fetch pending approvals only
await fetchApprovals('pending');

// Approve a request
await approveRequest(approvalId, 'Approved, enjoy your vacation!');

// Reject a request
await rejectRequest(approvalId, 'Insufficient leave balance');

// Get statistics
const stats = getApprovalStats();
// { pending: 5, approved: 12, rejected: 3 }
```

---

## Payroll Management

### Features
- **Monthly payroll processing**
- **Individual payroll records**
- **Deductions breakdown** (tax, insurance, pension)
- **Export payroll** (CSV, PDF, Excel)
- **Payroll statistics**

### Usage

```typescript
import { usePayrollStore } from '@app/store';

const {
  payrollRecords,
  isLoading,
  isProcessing,
  fetchPayrollRecords,
  processPayroll,
  exportPayroll,
  getTotalGross,
  getTotalDeductions,
  getTotalNet,
  getPayrollStats,
} = usePayrollStore();

// Fetch payroll for a month
await fetchPayrollRecords(1, 2024); // January 2024

// Process payroll
await processPayroll(1, 2024);

// Export payroll
const downloadUrl = await exportPayroll(1, 2024, 'pdf');

// Get totals
const gross = getTotalGross();
const deductions = getTotalDeductions();
const net = getTotalNet();

// Get statistics
const stats = getPayrollStats();
// { total: 50, processed: 45, paid: 40, draft: 5 }
```

---

## Time Tracking

### Features
- **Real-time timer** with live duration
- **Project/task tracking**
- **Manual time entry**
- **Daily/weekly/monthly totals**
- **Project breakdown reports**
- **Billable/non-billable tracking**

### Usage

```typescript
import { useTimeTrackingStore } from '@app/store';

const {
  timeEntries,
  isTracking,
  currentSession,
  currentDuration,
  isLoading,
  fetchTimeEntries,
  startTracking,
  stopTracking,
  getTodayTotal,
  getWeekTotal,
  getMonthTotal,
  getProjectTotals,
} = useTimeTrackingStore();

// Start tracking
await startTracking('Upsen App', 'Feature Development', 'Working on auth');

// Stop tracking
await stopTracking();

// Fetch time entries
await fetchTimeEntries(startDate, endDate);

// Get totals (in minutes)
const todayMinutes = getTodayTotal();
const weekMinutes = getWeekTotal();
const monthMinutes = getMonthTotal();

// Get project breakdown
const projectTotals = getProjectTotals();
// [{ project: 'Upsen App', duration: 480 }, ...]
```

---

## Expense Management

### Features
- **Submit expenses** with receipts
- **Categorize expenses** (travel, meals, office, training, other)
- **Track approval status**
- **Monthly analytics**
- **Category breakdown**

### Usage

```typescript
import { useExpenseStore, expenseCategories } from '@app/store';

const {
  expenses,
  isLoading,
  isSubmitting,
  fetchExpenses,
  submitExpense,
  deleteExpense,
  getFilteredExpenses,
  getTotalByStatus,
  getCategoryTotals,
  getMonthlyTotals,
} = useExpenseStore();

// Fetch expenses
await fetchExpenses();

// Submit an expense
await submitExpense({
  category: 'travel',
  amount: 245.50,
  description: 'Flight to New York',
  date: new Date(),
  receipt: selectedFile, // optional
});

// Get totals
const pendingTotal = getTotalByStatus('pending');
const approvedTotal = getTotalByStatus('approved');

// Get category breakdown
const categoryTotals = getCategoryTotals();
// [{ category: 'travel', amount: 500, count: 2 }, ...]

// Get monthly totals
const monthlyTotals = getMonthlyTotals();
// [{ month: '2024-01', amount: 1200 }, ...]
```

---

## Reports & Analytics

### Features
- **Attendance reports**
- **Leave reports**
- **Payroll reports**
- **Performance reports**
- **Expense analytics**

### Usage

```typescript
import { reportsApi } from '@app/services';

// Attendance report
const attendanceReport = await reportsApi.getAttendanceReport(
  '2024-01-01',
  '2024-01-31'
);

// Leave report
const leaveReport = await reportsApi.getLeaveReport(2024);

// Payroll report
const payrollReport = await reportsApi.getPayrollReport(1, 2024);

// Performance report
const performanceReport = await reportsApi.getPerformanceReport('Q1-2024');

// Expense analytics
const expenseAnalytics = await reportsApi.getExpenseAnalytics('month');
```

---

## Complete API Reference

### Authentication
```typescript
import { useAuthStore } from '@app/store';

const { signIn, signUp, signOut, resetPassword, user, isAuthenticated } = useAuthStore();
```

### Attendance
```typescript
import { attendanceApi } from '@app/services';

attendanceApi.getTodayAttendance();
attendanceApi.getAttendanceHistory({ startDate, endDate, page });
attendanceApi.getAttendanceSummary(month, year);
attendanceApi.clockIn(location);
attendanceApi.clockOut();
```

### Employees
```typescript
import { employeeApi } from '@app/services';

employeeApi.getEmployees({ department, search, page, limit });
employeeApi.getEmployee(id);
employeeApi.createEmployee(data);
employeeApi.updateEmployee(id, data);
employeeApi.deleteEmployee(id);
employeeApi.onboardEmployee(data);
employeeApi.offboardEmployee(id, data);
```

### Leaves
```typescript
import { leaveApi } from '@app/services';

leaveApi.getLeaveRequests(status);
leaveApi.getLeaveBalance();
leaveApi.createLeaveRequest(data);
leaveApi.cancelLeaveRequest(id);
```

### Tasks
```typescript
import { taskApi } from '@app/services';

taskApi.getTasks(status);
taskApi.getTask(id);
taskApi.createTask(data);
taskApi.updateTask(id, data);
taskApi.deleteTask(id);
taskApi.assignTask(id, userId);
taskApi.completeTask(id);
```

### Notifications
```typescript
import { notificationApi } from '@app/services';

notificationApi.getNotifications(page, limit);
notificationApi.markAsRead(id);
notificationApi.markAllAsRead();
notificationApi.deleteNotification(id);
notificationApi.updatePreferences(preferences);
```

---

## Real-time Features

### Chat Real-time
```typescript
import { realtimeChat } from '@app/services';

// Subscribe to conversation
const channel = realtimeChat.subscribeToConversation(
  conversationId,
  (newMessage) => console.log('New message:', newMessage),
  (updatedMessage) => console.log('Updated:', updatedMessage),
  (deletedId) => console.log('Deleted:', deletedId)
);

// Send typing indicator
await realtimeChat.sendTypingIndicator(conversationId, true);

// Unsubscribe
channel.unsubscribe();
```

---

## Error Handling

All stores include built-in error handling with toast notifications:

```typescript
// Errors are automatically shown as toast notifications
Toast.show({
  type: 'error',
  text1: 'Error',
  text2: error.message,
});

// Success notifications
Toast.show({
  type: 'success',
  text1: 'Success',
  text2: 'Operation completed',
});
```

---

## State Persistence

All stores use Zustand with persistence:

```typescript
// Data is automatically persisted to AsyncStorage
// and restored on app launch

// Configure persistence
persist(
  (set, get) => ({ ... }),
  {
    name: 'storage_key',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({ ... }), // Select what to persist
  }
);
```

---

## Best Practices

1. **Always handle errors** - Stores show toast notifications automatically
2. **Use loading states** - Check `isLoading` and `isSaving` before actions
3. **Subscribe to real-time updates** - Use `subscribeToConversation` for chat
4. **Filter on the client** - Use `getFiltered*` methods for search/filter
5. **Persist user preferences** - Theme, language are automatically persisted
