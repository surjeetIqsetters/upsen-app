# Upsen HR App - Advanced Features

This document outlines the advanced features added to the Upsen HR Management application.

## Table of Contents

1. [Theme & Dark Mode](#theme--dark-mode)
2. [Offline Support](#offline-support)
3. [Biometric Authentication](#biometric-authentication)
4. [Push Notifications](#push-notifications)
5. [Data Export & Import](#data-export--import)
6. [Internationalization (i18n)](#internationalization-i18n)
7. [Advanced Analytics](#advanced-analytics)
8. [Custom Hooks](#custom-hooks)
9. [Dependency Modernization](#dependency-modernization)

---

## Theme & Dark Mode

### Features
- **System-aware theme**: Automatically adapts to device theme settings
- **Manual theme toggle**: Users can override system preference
- **Persistent theme preference**: Theme choice is saved across app restarts
- **Complete color palette**: Full light and dark color schemes

### Usage

```typescript
import { useThemeStore } from '@app/store';

function MyComponent() {
  const { colors, isDark, toggleTheme, setMode } = useThemeStore();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello World</Text>
      <Button title="Toggle Theme" onPress={toggleTheme} />
    </View>
  );
}
```

### Store Location
`src/app/store/themeStore.ts`

---

## Offline Support

### Features
- **Network state monitoring**: Real-time connection status tracking
- **Offline queue**: Automatic queuing of actions when offline
- **Auto-sync**: Automatic synchronization when connection is restored
- **Data caching**: Local caching of frequently accessed data
- **Retry mechanism**: Automatic retry with exponential backoff

### Usage

```typescript
import { useOfflineStore } from '@app/store';

function MyComponent() {
  const { 
    isConnected, 
    syncQueue, 
    addToQueue, 
    processQueue,
    pendingChanges 
  } = useOfflineStore();
  
  const handleCreate = (data) => {
    if (!isConnected) {
      // Queue for later sync
      addToQueue({
        entity: 'tasks',
        action: 'create',
        data,
      });
    } else {
      // Create immediately
      createTask(data);
    }
  };
}
```

### Store Location
`src/app/store/offlineStore.ts`

---

## Biometric Authentication

### Features
- **Face ID / Touch ID support**: Full biometric authentication
- **Secure credential storage**: Credentials stored in Keychain/Keystore
- **Fallback support**: Passcode fallback when biometric fails
- **Enable/Disable toggle**: Users can opt-in/out of biometric login

### Usage

```typescript
import { 
  checkBiometricAvailability,
  enableBiometricAuth,
  biometricLogin,
  getBiometricTypeName 
} from '@app/services';

// Check availability
const status = await checkBiometricAvailability();
if (status.isAvailable) {
  console.log(getBiometricTypeName(status.biometricTypes));
}

// Enable biometric login
await enableBiometricAuth({ email, password });

// Login with biometrics
const result = await biometricLogin();
if (result.success) {
  // Authenticate with credentials
  await signIn(result.credentials);
}
```

### Service Location
`src/app/services/biometricAuth.ts`

---

## Push Notifications

### Features
- **Expo Push Notifications**: Full push notification support
- **Local notifications**: In-app scheduled notifications
- **Notification templates**: Pre-built notification types
- **Badge management**: Automatic badge count updates
- **Deep linking**: Navigate to specific screens from notifications

### Notification Types
- `LEAVE_APPROVED`
- `LEAVE_REJECTED`
- `LEAVE_REQUEST`
- `TASK_ASSIGNED`
- `TASK_DUE`
- `TASK_COMPLETED`
- `ATTENDANCE_REMINDER`
- `CHECK_IN_CONFIRMED`
- `CHECK_OUT_CONFIRMED`
- `ANNOUNCEMENT`
- `BIRTHDAY`
- `WORK_ANNIVERSARY`

### Usage

```typescript
import { 
  registerForPushNotifications,
  sendTemplatedNotification,
  scheduleReminder,
  NotificationType 
} from '@app/services';

// Register for push notifications
const token = await registerForPushNotifications();

// Send templated notification
await sendTemplatedNotification(NotificationType.TASK_ASSIGNED, {
  taskTitle: 'Complete Report',
});

// Schedule a reminder
await scheduleReminder(
  'Task Due',
  'Your task is due in 1 hour',
  new Date(Date.now() + 60 * 60 * 1000)
);
```

### Service Location
`src/app/services/pushNotifications.ts`

---

## Data Export & Import

### Features
- **Multiple formats**: CSV, JSON, PDF export
- **Share functionality**: Native share sheet integration
- **Import support**: Import data from CSV/JSON files
- **Progress tracking**: Real-time import progress
- **File management**: List and manage exported files

### Supported Data Types
- Employees
- Attendance
- Leaves
- Tasks
- Payroll
- Analytics

### Usage

```typescript
import { 
  exportData,
  exportAndShare,
  importData,
  listExportedFiles 
} from '@app/services';

// Export data
const result = await exportData({
  format: 'csv',
  dataType: 'attendance',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
});

// Export and share
await exportAndShare({
  format: 'pdf',
  dataType: 'employees',
});

// Import data
const importResult = await importData('employees', (progress) => {
  console.log(`Import progress: ${progress}%`);
});
```

### Service Location
`src/app/services/exportService.ts`

---

## Internationalization (i18n)

### Features
- **7 Languages**: English, Spanish, French, German, Chinese, Japanese, Arabic
- **RTL Support**: Full right-to-left text support
- **Device locale detection**: Automatic language detection
- **Persistent preference**: Language choice saved across sessions

### Supported Languages
| Code | Language | Flag |
|------|----------|------|
| en | English | 🇺🇸 |
| es | Español | 🇪🇸 |
| fr | Français | 🇫🇷 |
| de | Deutsch | 🇩🇪 |
| zh | 中文 | 🇨🇳 |
| ja | 日本語 | 🇯🇵 |
| ar | العربية | 🇸🇦 |

### Usage

```typescript
import { t, setLanguage, getCurrentLanguage, isRTL } from '@app/services';

// Translate
const greeting = t('home.goodMorning');

// Change language
await setLanguage('es');

// Check RTL
const rtl = isRTL(); // true for Arabic
```

### Service Location
`src/app/services/i18n.ts`

---

## Advanced Analytics

### Features
- **Dashboard statistics**: Key metrics with trend indicators
- **Department analytics**: Department-wise performance metrics
- **Time range selection**: Customizable date ranges
- **Chart data**: Attendance, leave, and task visualizations
- **Export capability**: Export analytics data

### Metrics Tracked
- Total Employees
- Attendance Rate
- Leave Utilization
- Task Completion Rate
- Average Check-in Time
- Overtime Hours

### Usage

```typescript
import { useAnalyticsStore } from '@app/store';

function AnalyticsDashboard() {
  const { 
    dashboardStats,
    departmentStats,
    attendanceChart,
    selectedTimeRange,
    setTimeRange,
    fetchDashboardStats 
  } = useAnalyticsStore();
  
  useEffect(() => {
    fetchDashboardStats();
  }, [selectedTimeRange]);
  
  return (
    <View>
      <Text>Attendance: {dashboardStats?.attendanceRate.value}%</Text>
    </View>
  );
}
```

### Store Location
`src/app/store/analyticsStore.ts`

---

## Custom Hooks

### useDebounce
Debounce values and callbacks for search inputs and API calls.

```typescript
import { useDebounce, useDebouncedCallback } from '@app/hooks';

const [searchQuery, setSearchQuery] = useState('');
const debouncedQuery = useDebounce(searchQuery, 500);

const handleSearch = useDebouncedCallback((query) => {
  searchAPI(query);
}, 300);
```

### useNetworkStatus
Monitor network connection status.

```typescript
import { useNetworkStatus, useIsOnline } from '@app/hooks';

const { isConnected, isWifi, isCellular } = useNetworkStatus();
const isOnline = useIsOnline();
```

### useRefresh
Handle pull-to-refresh with loading states.

```typescript
import { useRefresh } from '@app/hooks';

const { isRefreshing, refresh, lastRefreshed } = useRefresh(
  async () => {
    await fetchData();
  },
  { onSuccess: () => showToast('Refreshed!') }
);
```

### useAppState
Monitor app state changes (active/background).

```typescript
import { useAppState, useAppUsageTime } from '@app/hooks';

const { isActive, isBackground } = useAppState();
const { sessionTimeMinutes, totalTimeMinutes } = useAppUsageTime();
```

### Hooks Location
`src/app/hooks/`

---

## Dependency Modernization

### Changes Made

#### Package Updates
| Package | Old Version | New Version |
|---------|-------------|-------------|
| expo | ~51.0.14 | ~51.0.28 |
| react-native | 0.74.2 | 0.74.5 |
| @babel/core | ^7.24.7 | ^7.25.2 |
| eslint | ^8.57.0 | ^9.9.0 |
| typescript | ~5.3.3 | ~5.5.4 |

#### Overrides Added
```json
{
  "overrides": {
    "glob": "^10.4.5",
    "rimraf": "^5.0.10",
    "core-js": "^3.38.0"
  }
}
```

#### New Dependencies
- `i18n-js`: Internationalization
- `@react-native-community/netinfo`: Network status
- `expo-device`: Device information

#### ESLint Migration
- Migrated from `.eslintrc.js` to `eslint.config.js` (flat config format)
- Updated for ESLint v9 compatibility

### Node Version
- Added `.nvmrc` with Node 20.15.0
- Added `engines` field to package.json

---

## File Structure

```
src/
├── app/
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useAppState.ts
│   │   ├── useDebounce.ts
│   │   ├── useNetworkStatus.ts
│   │   └── useRefresh.ts
│   ├── services/
│   │   ├── index.ts
│   │   ├── biometricAuth.ts
│   │   ├── exportService.ts
│   │   ├── i18n.ts
│   │   └── pushNotifications.ts
│   ├── store/
│   │   ├── analyticsStore.ts
│   │   ├── offlineStore.ts
│   │   └── themeStore.ts
│   └── utils/
│       └── constants.ts (updated)
├── App.tsx (updated)
├── package.json (updated)
├── eslint.config.js (new)
└── .nvmrc (new)
```

---

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Run the app**:
   ```bash
   npm start
   ```

---

## Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PROJECT_ID=your_expo_project_id
```

---

## License

MIT License - See LICENSE file for details.
