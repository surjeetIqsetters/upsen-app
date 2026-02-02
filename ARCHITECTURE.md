# Upsen HR Management App - Complete Architecture

## App Overview
**Upsen** is a comprehensive HR Management mobile application that empowers workplace journeys through:
- Attendance tracking with Clock In/Out
- Employee directory and department structure
- Leave request management
- Real-time chat and communication
- Task management
- Payslip and payment management
- Company news and announcements
- Profile management

---

## 1. COMPLETE FLOW MAP

### 1.1 Authentication Flow

| Screen | Purpose | Access | Navigation |
|--------|---------|--------|------------|
| Splash | App branding, loading | Public | Auto-navigate to Onboarding or Home |
| Onboarding 1-3 | Feature introduction | Public | Next/Skip to Get Started |
| Get Started | Entry point choice | Public | Sign In or Sign Up |
| Sign In | Authenticate user | Public | Home (success) or Forgot Password |
| Sign Up | Create account | Public | Verification Code |
| Verification Code | Phone/email verification | Public | Face ID Setup or Home |
| Face ID Setup | Biometric authentication | Authenticated | Home or Skip |
| Forgot Password | Reset password flow | Public | Verification → New Password |
| New Password | Set new password | Verified | Success → Login |

**User Actions:**
- Tap: Navigate between screens, toggle Email/Phone
- Submit: Sign In, Sign Up, Verify, Change Password
- Input: Email, Password, Phone, OTP

**State:**
- Local: Form inputs, validation errors
- Global: Auth token, user profile
- Server: User credentials, verification status

**Validation:**
- Email: Valid format required
- Password: Min 8 chars, 1 uppercase, 1 number
- Phone: Valid country code + number
- OTP: 4 digits

---

### 1.2 Main App Flow (Bottom Tab Navigation)

| Tab | Screens | Purpose |
|-----|---------|---------|
| Home | Home, Attendance List, Attendance Summary, My Attendance | Dashboard, Clock In/Out, Attendance tracking |
| Employee | Employee List, Employee Details, Department Structure | Employee directory, contact, org chart |
| Task | Task List, New Task, Task Details | Task management, assignment |
| News | News List, News Detail | Company announcements |
| Profile | Profile, Personal Info, Payment, Notifications, Manage Work | User settings and info |

---

### 1.3 Home Flow

| Screen | Purpose | Actions |
|--------|---------|---------|
| Home | Dashboard with Clock In/Out, Notes, Events | Clock In/Out, View Notes, View Events |
| Attendance List | Daily attendance history | View details, Filter |
| Attendance Summary | Monthly statistics | View breakdown |
| My Attendance | Personal attendance chart | View Today/Weekly/Monthly |

**API Calls:**
- GET /api/attendance/today - Current day status
- POST /api/attendance/clock-in - Clock in
- POST /api/attendance/clock-out - Clock out
- GET /api/attendance/history - Attendance list
- GET /api/attendance/summary - Statistics
- GET /api/events/upcoming - Upcoming events
- GET /api/notes - User notes

---

### 1.4 Employee Flow

| Screen | Purpose | Actions |
|--------|---------|---------|
| Employee List | Browse employees by department | Search, Filter by dept, Call, Message |
| Employee Details | View employee info | View tabs (Info, Document, Notes), Leave Request |
| Department Structure | Org chart view | View hierarchy |

**API Calls:**
- GET /api/employees - List with pagination
- GET /api/employees/:id - Employee details
- GET /api/departments - Department list
- GET /api/departments/:id/structure - Department hierarchy
- POST /api/calls - Initiate call
- POST /api/messages - Send message

---

### 1.5 Leave Request Flow

| Screen | Purpose | Actions |
|--------|---------|---------|
| Leave Request Calendar | Select leave dates | Select date range |
| Leave Request Form | Submit leave request | Fill form, Upload document, Submit |
| Submission List | View request status | Filter (All, Waiting, Approved, Cancelled) |

**API Calls:**
- POST /api/leave-requests - Create request
- GET /api/leave-requests - List my requests
- GET /api/leave-requests/all - List all (HR/Manager)
- PATCH /api/leave-requests/:id - Update status
- DELETE /api/leave-requests/:id - Cancel request

---

### 1.6 Chat Flow

| Screen | Purpose | Actions |
|--------|---------|---------|
| Chat List | Conversation list | Select conversation |
| Chat | Messaging interface | Send text, image, video call |
| Phone Call | Voice call | Mute, Speaker, End call |

**API Calls:**
- GET /api/conversations - List conversations
- GET /api/messages/:conversationId - Load messages
- POST /api/messages - Send message
- POST /api/calls - Initiate call

---

### 1.7 Task Flow

| Screen | Purpose | Actions |
|--------|---------|---------|
| Task List | View tasks by date | Toggle completion, View details |
| New Task | Create task | Fill form, Assign members, Set priority |
| Task Details | View task info | Update status, View team |

**API Calls:**
- GET /api/tasks - List tasks
- POST /api/tasks - Create task
- GET /api/tasks/:id - Task details
- PATCH /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

---

### 1.8 Payslip Flow

| Screen | Purpose | Actions |
|--------|---------|---------|
| Payslip | Monthly payslip view | Navigate months, Download |
| Payslip Detail | Detailed breakdown | Share, Download |
| Card Detail | Payment card info | Edit card details |

**API Calls:**
- GET /api/payslips - List payslips
- GET /api/payslips/:id - Payslip details
- GET /api/payslips/:id/download - Download PDF
- GET /api/payment-cards - Card info
- PUT /api/payment-cards - Update card

---

### 1.9 News Flow

| Screen | Purpose | Actions |
|--------|---------|---------|
| News List | Company news feed | Scroll, Search |
| News Detail | Full article | Like, Comment, Share |

**API Calls:**
- GET /api/news - List news
- GET /api/news/:id - News details
- POST /api/news/:id/like - Like news
- POST /api/news/:id/comments - Add comment

---

### 1.10 Profile Flow

| Screen | Purpose | Actions |
|--------|---------|---------|
| Profile | Settings menu | Navigate to sub-screens, Logout |
| Personal Info | Edit profile | Update info, Change photo |
| Payment | Payment methods | View cards, Add/Edit |
| Notifications | Notification settings | Toggle preferences |
| Manage Work | Work preferences | Update settings |

**API Calls:**
- GET /api/profile - User profile
- PUT /api/profile - Update profile
- POST /api/profile/avatar - Upload avatar
- GET /api/settings/notifications - Notification settings
- PUT /api/settings/notifications - Update settings

---

## 2. DATABASE SCHEMA (Supabase)

### 2.1 Core Tables

```sql
-- Users table (extends Supabase auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  phone_number text,
  country_code text default '+1',
  avatar_url text,
  position text,
  department_id uuid references public.departments,
  employee_id text unique,
  date_of_joining date,
  date_applied date default current_date,
  head_division_id uuid references public.profiles,
  address text,
  role text default 'employee' check (role in ('employee', 'manager', 'hr', 'admin')),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Departments
create table public.departments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  head_id uuid references public.profiles,
  parent_id uuid references public.departments,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Attendance
create table public.attendance (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  date date not null default current_date,
  clock_in timestamp with time zone,
  clock_out timestamp with time zone,
  status text default 'attending' check (status in ('attending', 'late', 'absent', 'on_leave', 'sick_leave')),
  work_hours decimal(4,2),
  overtime_minutes integer default 0,
  location text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, date)
);

-- Leave Requests
create table public.leave_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  leave_type text not null check (leave_type in ('casual', 'sick', 'annual', 'unpaid')),
  start_date date not null,
  end_date date not null,
  reason text,
  document_url text,
  status text default 'waiting' check (status in ('waiting', 'approved', 'rejected', 'cancelled')),
  approved_by uuid references public.profiles,
  approved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tasks
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  created_by uuid references public.profiles not null,
  assigned_to uuid references public.profiles,
  project_name text,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  estimated_hours decimal(4,2),
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Task Members (many-to-many)
create table public.task_members (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(task_id, user_id)
);

-- Messages/Chat
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  type text default 'direct' check (type in ('direct', 'group')),
  name text,
  created_by uuid references public.profiles,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table public.conversation_members (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  last_read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(conversation_id, user_id)
);

create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations on delete cascade,
  sender_id uuid references public.profiles on delete cascade,
  content text not null,
  type text default 'text' check (type in ('text', 'image', 'file', 'voice')),
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Events
create table public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  event_type text default 'office' check (event_type in ('office', 'meeting', 'training', 'holiday')),
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  location text,
  attendees_scope text default 'all' check (attendees_scope in ('all', 'department', 'custom')),
  created_by uuid references public.profiles,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Event Attendees
create table public.event_attendees (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  status text default 'invited' check (status in ('invited', 'accepted', 'declined')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(event_id, user_id)
);

-- Payslips
create table public.payslips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  month integer not null check (month between 1 and 12),
  year integer not null,
  gross_pay decimal(10,2) not null,
  total_deductions decimal(10,2) default 0,
  overtime_amount decimal(10,2) default 0,
  net_pay decimal(10,2) not null,
  tax_code text,
  details jsonb default '{}',
  pdf_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, month, year)
);

-- Payment Cards
create table public.payment_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  card_number text not null,
  card_holder_name text not null,
  expiry_date text not null,
  cvv text not null,
  card_type text default 'visa',
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- News
create table public.news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  image_url text,
  author_id uuid references public.profiles,
  likes_count integer default 0,
  comments_count integer default 0,
  is_published boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- News Comments
create table public.news_comments (
  id uuid default gen_random_uuid() primary key,
  news_id uuid references public.news on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- News Likes
create table public.news_likes (
  id uuid default gen_random_uuid() primary key,
  news_id uuid references public.news on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(news_id, user_id)
);

-- Notifications
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  type text not null check (type in ('leave_approved', 'leave_rejected', 'task_assigned', 'message', 'event_reminder', 'clock_in_reminder')),
  title text not null,
  content text not null,
  data jsonb default '{}',
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Notes
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  title text not null,
  content text,
  reminder_time timestamp with time zone,
  is_shared boolean default false,
  shared_with uuid[],
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Company Info
create table public.company_info (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  legal_name text,
  logo_url text,
  ceo_name text,
  employee_count integer,
  headquarters text,
  sector text,
  industry text,
  description text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

### 2.2 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.attendance enable row level security;
alter table public.leave_requests enable row level security;
alter table public.tasks enable row level security;
alter table public.messages enable row level security;
alter table public.payslips enable row level security;
alter table public.notifications enable row level security;

-- Profiles: Users can read all profiles, update only their own
create policy "Profiles are viewable by all authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Attendance: Users can view own attendance, managers can view department
create policy "Users can view own attendance"
  on public.attendance for select
  to authenticated
  using (user_id = auth.uid() or 
         exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'hr', 'admin')));

create policy "Users can create own attendance"
  on public.attendance for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own attendance"
  on public.attendance for update
  to authenticated
  using (user_id = auth.uid());

-- Leave Requests: Users can manage own requests, managers can approve
create policy "Users can view own leave requests"
  on public.leave_requests for select
  to authenticated
  using (user_id = auth.uid() or 
         exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'hr', 'admin')));

create policy "Users can create own leave requests"
  on public.leave_requests for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Managers can update leave requests"
  on public.leave_requests for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'hr', 'admin')));

-- Messages: Users can view conversations they're part of
create policy "Users can view own conversations"
  on public.conversations for select
  to authenticated
  using (exists (select 1 from public.conversation_members where conversation_id = id and user_id = auth.uid()));

create policy "Users can view messages in their conversations"
  on public.messages for select
  to authenticated
  using (exists (select 1 from public.conversation_members where conversation_id = conversation_id and user_id = auth.uid()));

create policy "Users can send messages to their conversations"
  on public.messages for insert
  to authenticated
  with check (sender_id = auth.uid() and 
              exists (select 1 from public.conversation_members where conversation_id = conversation_id and user_id = auth.uid()));

-- Payslips: Users can only view own payslips
create policy "Users can view own payslips"
  on public.payslips for select
  to authenticated
  using (user_id = auth.uid());

-- Tasks: Users can view assigned tasks
create policy "Users can view assigned tasks"
  on public.tasks for select
  to authenticated
  using (created_by = auth.uid() or assigned_to = auth.uid() or 
         exists (select 1 from public.task_members where task_id = id and user_id = auth.uid()));

-- Notifications: Users can only view own notifications
create policy "Users can view own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid());
```

---

## 3. API DEFINITIONS

### 3.1 Authentication APIs

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| /auth/signin | POST | Sign in with email/phone | {email, password} or {phone, password} | {user, session, token} |
| /auth/signup | POST | Create new account | {fullName, email, password, phone, countryCode} | {user, session} |
| /auth/verify-otp | POST | Verify OTP code | {phone, code} | {verified: true} |
| /auth/resend-otp | POST | Resend OTP | {phone} | {sent: true} |
| /auth/forgot-password | POST | Request password reset | {email} or {phone} | {resetSent: true} |
| /auth/reset-password | POST | Set new password | {token, newPassword} | {success: true} |
| /auth/signout | POST | Sign out user | - | {success: true} |
| /auth/refresh | POST | Refresh session | {refreshToken} | {session, token} |

### 3.2 Attendance APIs

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| /attendance/today | GET | Get today's attendance | - | Attendance object |
| /attendance/clock-in | POST | Clock in | {location?} | Attendance object |
| /attendance/clock-out | POST | Clock out | {location?} | Attendance object |
| /attendance/history | GET | Get attendance history | {startDate, endDate, page, limit} | Attendance[] |
| /attendance/summary | GET | Get monthly summary | {month, year} | Summary object |
| /attendance/stats | GET | Get attendance statistics | {period: 'week' \| 'month' \| 'year'} | Stats object |

### 3.3 Employee APIs

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| /employees | GET | List employees | {departmentId, search, page, limit} | Employee[] |
| /employees/:id | GET | Get employee details | - | Employee object |
| /employees/:id/contact | POST | Contact employee | {type: 'call' \| 'message'} | {success: true} |
| /departments | GET | List departments | - | Department[] |
| /departments/:id/structure | GET | Get department structure | - | Department with employees |

### 3.4 Leave Request APIs

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| /leave-requests | GET | List my leave requests | {status, page, limit} | LeaveRequest[] |
| /leave-requests/all | GET | List all requests (HR/Manager) | {status, departmentId, page, limit} | LeaveRequest[] |
| /leave-requests | POST | Create leave request | {leaveType, startDate, endDate, reason, document?} | LeaveRequest |
| /leave-requests/:id | GET | Get request details | - | LeaveRequest |
| /leave-requests/:id | PATCH | Update request status | {status, notes?} | LeaveRequest |
| /leave-requests/:id | DELETE | Cancel request | - | {success: true} |

### 3.5 Task APIs

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| /tasks | GET | List tasks | {status, priority, date, page, limit} | Task[] |
| /tasks | POST | Create task | {title, description, assignedTo, priority, dueDate, members[]} | Task |
| /tasks/:id | GET | Get task details | - | Task |
| /tasks/:id | PATCH | Update task | {status, title, description, etc.} | Task |
| /tasks/:id | DELETE | Delete task | - | {success: true} |
| /tasks/:id/status | PATCH | Update task status | {status} | Task |

### 3.6 Chat APIs

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| /conversations | GET | List conversations | - | Conversation[] |
| /conversations | POST | Create conversation | {type, name?, members[]} | Conversation |
| /conversations/:id/messages | GET | Get messages | {before, limit} | Message[] |
| /conversations/:id/messages | POST | Send message | {content, type?, file?} | Message |
| /conversations/:id/read | POST | Mark as read | - | {success: true} |

### 3.7 Payslip APIs

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| /payslips | GET | List payslips | {year} | Payslip[] |
| /payslips/:id | GET | Get payslip details | - | Payslip |
| /payslips/:id/download | GET | Download payslip PDF | - | PDF file |
| /payment-cards | GET | Get payment cards | - | PaymentCard[] |
| /payment-cards | POST | Add payment card | {cardNumber, holderName, expiry, cvv} | PaymentCard |
| /payment-cards/:id | PUT | Update payment card | {cardNumber?, holderName?, expiry?, cvv?} | PaymentCard |

### 3.8 News APIs

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| /news | GET | List news | {page, limit} | News[] |
| /news/:id | GET | Get news details | - | News |
| /news/:id/like | POST | Like news | - | {liked: true} |
| /news/:id/unlike | DELETE | Unlike news | - | {liked: false} |
| /news/:id/comments | GET | Get comments | {page, limit} | Comment[] |
| /news/:id/comments | POST | Add comment | {content} | Comment |

### 3.9 Notification APIs

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| /notifications | GET | List notifications | {page, limit, unreadOnly} | Notification[] |
| /notifications/:id/read | PATCH | Mark as read | - | Notification |
| /notifications/read-all | POST | Mark all as read | - | {success: true} |
| /notifications/settings | GET | Get notification settings | - | Settings |
| /notifications/settings | PUT | Update settings | {settings} | Settings |

### 3.10 Profile APIs

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| /profile | GET | Get user profile | - | Profile |
| /profile | PUT | Update profile | {fullName, phone, address, etc.} | Profile |
| /profile/avatar | POST | Upload avatar | {file} | {avatarUrl} |
| /profile/password | PUT | Change password | {currentPassword, newPassword} | {success: true} |

---

## 4. STATE MANAGEMENT

### 4.1 Zustand Store Structure

```typescript
// Auth Store
interface AuthStore {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Attendance Store
interface AttendanceStore {
  todayAttendance: Attendance | null;
  attendanceHistory: Attendance[];
  summary: AttendanceSummary | null;
  isLoading: boolean;
  clockIn: (location?: string) => Promise<void>;
  clockOut: (location?: string) => Promise<void>;
  fetchToday: () => Promise<void>;
  fetchHistory: (params: HistoryParams) => Promise<void>;
  fetchSummary: (month: number, year: number) => Promise<void>;
}

// Employee Store
interface EmployeeStore {
  employees: Employee[];
  departments: Department[];
  selectedEmployee: Employee | null;
  isLoading: boolean;
  fetchEmployees: (params?: EmployeeParams) => Promise<void>;
  fetchDepartments: () => Promise<void>;
  fetchEmployeeDetails: (id: string) => Promise<void>;
}

// Leave Store
interface LeaveStore {
  myRequests: LeaveRequest[];
  allRequests: LeaveRequest[]; // For managers
  isLoading: boolean;
  fetchMyRequests: (status?: string) => Promise<void>;
  fetchAllRequests: (params?: RequestParams) => Promise<void>;
  createRequest: (data: CreateRequestData) => Promise<void>;
  updateRequest: (id: string, status: string) => Promise<void>;
  cancelRequest: (id: string) => Promise<void>;
}

// Task Store
interface TaskStore {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  fetchTasks: (params?: TaskParams) => Promise<void>;
  createTask: (data: CreateTaskData) => Promise<void>;
  updateTask: (id: string, data: UpdateTaskData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

// Chat Store
interface ChatStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (members: string[]) => Promise<void>;
}

// Notification Store
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}
```

---

## 5. ERROR HANDLING

### 5.1 Error Categories

| Code | Description | User Message | Action |
|------|-------------|--------------|--------|
| NETWORK_ERROR | No internet connection | "Please check your internet connection" | Retry button |
| UNAUTHORIZED | Token expired/invalid | "Session expired. Please sign in again" | Navigate to login |
| FORBIDDEN | Insufficient permissions | "You don't have permission" | Back button |
| NOT_FOUND | Resource not found | "Resource not found" | Back button |
| VALIDATION_ERROR | Invalid input | "Please check your input" | Highlight fields |
| SERVER_ERROR | Server error | "Something went wrong. Please try again" | Retry button |
| CONFLICT | Resource conflict | "This action cannot be completed" | - |

### 5.2 API Error Response Format

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  statusCode: number;
}
```

---

## 6. SECURITY CONSIDERATIONS

1. **Token Storage**: Use SecureStore for JWT tokens
2. **Biometric Auth**: Support Face ID/Touch ID
3. **Certificate Pinning**: Pin SSL certificates
4. **Data Encryption**: Encrypt sensitive data at rest
5. **Input Sanitization**: Sanitize all user inputs
6. **Rate Limiting**: Implement API rate limiting
7. **Session Timeout**: Auto-logout after inactivity

---

## 7. PERFORMANCE OPTIMIZATIONS

1. **Image Optimization**: Use react-native-fast-image
2. **List Virtualization**: Use FlashList for long lists
3. **State Persistence**: Persist critical state
4. **Lazy Loading**: Load screens on demand
5. **Cache Strategy**: Cache API responses appropriately
6. **Background Fetch**: Sync data in background

---

## 8. TESTING STRATEGY

1. **Unit Tests**: Jest for utilities, stores
2. **Integration Tests**: Test API integrations
3. **E2E Tests**: Detox for critical flows
4. **Manual Testing**: Device testing on iOS/Android
