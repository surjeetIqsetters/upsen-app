# Upsen HR Management App

A comprehensive, production-ready React Native HR Management application built with Expo, TypeScript, and Supabase.

## Features

### Authentication
- Email/Phone sign-in with toggle
- User registration with country code selection
- OTP verification
- Face ID / Biometric authentication setup
- Forgot password with email/phone options
- Social login integration (Apple, Google, Facebook)

### Core Features
- **Home Dashboard**: Clock in/out, notes, upcoming events, attendance chart
- **Attendance Tracking**: Daily clock-in/out, history, summary statistics
- **Employee Directory**: Browse employees, department filter, contact options
- **Department Structure**: Organizational chart view
- **Leave Management**: Calendar-based leave requests, submission tracking
- **Task Management**: Create, assign, and track tasks with priorities
- **Chat & Communication**: Real-time messaging, voice calls
- **Payslip Management**: Monthly payslip view, download, payment cards
- **News & Announcements**: Company news feed with likes and comments
- **Profile Management**: Personal info, settings, notifications

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: Zustand with persistence
- **Backend**: Supabase (Auth + PostgreSQL)
- **Forms**: React Hook Form + Zod validation
- **Styling**: StyleSheet + NativeWind compatible
- **API Client**: Axios with interceptors
- **Real-time**: Supabase Realtime subscriptions

## Project Structure

```
src/
├── app/
│   ├── navigation/       # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── screens/          # All screen components
│   │   ├── auth/         # Authentication screens
│   │   ├── home/         # Home dashboard screens
│   │   ├── attendance/   # Attendance tracking screens
│   │   ├── employee/     # Employee management screens
│   │   ├── leave/        # Leave request screens
│   │   ├── chat/         # Chat and call screens
│   │   ├── task/         # Task management screens
│   │   ├── news/         # News and announcements screens
│   │   ├── payslip/      # Payslip and payment screens
│   │   ├── profile/      # Profile and settings screens
│   │   ├── company/      # Company info screens
│   │   ├── events/       # Events screens
│   │   └── notifications/# Notifications screens
│   ├── components/       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   ├── Header.tsx
│   │   ├── Badge.tsx
│   │   ├── Loading.tsx
│   │   └── EmptyState.tsx
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   │   ├── supabase.ts   # Supabase client
│   │   └── api.ts        # API methods
│   ├── store/            # Zustand stores
│   │   ├── authStore.ts
│   │   ├── attendanceStore.ts
│   │   ├── employeeStore.ts
│   │   ├── leaveStore.ts
│   │   ├── taskStore.ts
│   │   └── notificationStore.ts
│   ├── utils/            # Utilities
│   │   ├── constants.ts  # Colors, spacing, etc.
│   │   └── helpers.ts    # Helper functions
│   └── types/            # TypeScript types
│       └── index.ts
└── assets/               # Images, fonts
```

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Supabase account

## Setup Instructions

### 1. Clone and Install

```bash
cd upsen-app
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=your_api_url
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql`
3. Enable Row Level Security (RLS) policies
4. Set up authentication providers (Email, Phone)
5. Create storage buckets for avatars and documents

### 4. Run the App

```bash
# Start Expo development server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## Database Schema

The app uses the following Supabase tables:

- `profiles` - User profiles extending auth
- `departments` - Company departments
- `attendance` - Daily attendance records
- `leave_requests` - Leave applications
- `tasks` - Task management
- `task_members` - Task assignments
- `conversations` - Chat conversations
- `messages` - Chat messages
- `events` - Company events
- `payslips` - Employee payslips
- `payment_cards` - Payment methods
- `news` - Company announcements
- `news_comments` - News comments
- `notifications` - User notifications

See `ARCHITECTURE.md` for complete schema details.

## API Endpoints

The app communicates with the backend via RESTful APIs:

### Authentication
- `POST /auth/signin` - Sign in
- `POST /auth/signup` - Sign up
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/forgot-password` - Reset password

### Attendance
- `GET /attendance/today` - Today's attendance
- `POST /attendance/clock-in` - Clock in
- `POST /attendance/clock-out` - Clock out
- `GET /attendance/history` - Attendance history

### Employees
- `GET /employees` - List employees
- `GET /employees/:id` - Employee details
- `GET /departments` - List departments

### Leave Requests
- `GET /leave-requests` - My requests
- `POST /leave-requests` - Create request
- `PATCH /leave-requests/:id` - Update status

### Tasks
- `GET /tasks` - List tasks
- `POST /tasks` - Create task
- `PATCH /tasks/:id` - Update task

See `ARCHITECTURE.md` for complete API documentation.

## State Management

The app uses Zustand for state management with the following stores:

- **authStore** - Authentication state, user session
- **attendanceStore** - Attendance data, clock in/out
- **employeeStore** - Employee list, departments
- **leaveStore** - Leave requests
- **taskStore** - Tasks and assignments
- **notificationStore** - Notifications, real-time updates

## Security

- JWT-based authentication with Supabase Auth
- Row Level Security (RLS) on all database tables
- Secure token storage with Expo SecureStore
- Biometric authentication support
- Input validation with Zod
- API request/response interceptors

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests (Detox)
npx detox test
```

## Building for Production

### iOS
```bash
npx expo prebuild --platform ios
cd ios
fastlane beta
```

### Android
```bash
npx expo prebuild --platform android
cd android
fastlane beta
```

## Deployment

### Expo EAS Build
```bash
# Configure EAS
npx eas-cli login
npx eas-cli build:configure

# Build for production
npx eas-cli build --platform all

# Submit to stores
npx eas-cli submit
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@upsen.com or join our Slack channel.

---

## Screenshots

| Splash Screen | Onboarding | Sign In | Home |
|--------------|------------|---------|------|
| ![Splash](docs/screenshots/splash.png) | ![Onboarding](docs/screenshots/onboarding.png) | ![SignIn](docs/screenshots/signin.png) | ![Home](docs/screenshots/home.png) |

| Attendance | Employees | Tasks | Profile |
|------------|-----------|-------|---------|
| ![Attendance](docs/screenshots/attendance.png) | ![Employees](docs/screenshots/employees.png) | ![Tasks](docs/screenshots/tasks.png) | ![Profile](docs/screenshots/profile.png) |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      React Native App                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Screens    │  │  Components  │  │    Hooks     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Store     │  │    Utils     │  │    Types     │      │
│  │   (Zustand)  │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Backend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │  PostgreSQL  │  │    Storage   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │   Realtime   │  │  Edge Funcs  │                          │
│  └──────────────┘  └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## Feature Checklist

### Authentication
- [x] Splash Screen
- [x] Onboarding (4 slides)
- [x] Sign In (Email/Phone toggle)
- [x] Sign Up with country selection
- [x] OTP Verification
- [x] Face ID Setup
- [x] Forgot Password
- [x] New Password
- [x] Password Success

### Home
- [x] Dashboard with Clock In/Out
- [x] Notes section
- [x] Upcoming Events
- [x] Attendance Chart
- [x] Notifications

### Attendance
- [x] Attendance List
- [x] Attendance Summary
- [x] My Attendance with stats

### Employees
- [x] Employee List with search
- [x] Department filter
- [x] Employee Details
- [x] Department Structure

### Leave
- [x] Leave Request Calendar
- [x] Leave Request Form
- [x] Submission List with filters

### Chat
- [x] Chat Screen
- [x] Phone Call Screen

### Tasks
- [x] Task List with calendar
- [x] New Task Form
- [x] Task Details

### News
- [x] News List
- [x] News Detail with comments

### Payslip
- [x] Payslip Monthly View
- [x] Payslip Detail
- [x] Card Management

### Profile
- [x] Profile Screen
- [x] Personal Info
- [x] Payment Methods
- [x] Notification Settings
- [x] Manage Work
- [x] Company Profile

## Known Issues

1. Calendar library may need additional configuration for some locales
2. Biometric authentication requires device setup
3. Push notifications require FCM/APNS configuration

## Roadmap

- [ ] Dark mode support
- [ ] Offline mode
- [ ] Push notifications
- [ ] File attachments in chat
- [ ] Video calls
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Admin dashboard

---

Built with ❤️ by the Upsen Team
