// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  countryCode?: string;
  avatarUrl?: string;
  position?: string;
  departmentId?: string;
  employeeId?: string;
  dateOfJoining?: string;
  dateApplied?: string;
  headDivisionId?: string;
  address?: string;
  role: 'employee' | 'manager' | 'hr' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile extends User {
  department?: Department;
  headDivision?: User;
}

// Auth Types
export interface SignInCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  countryCode: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

// Department Types
export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  head?: User;
  parentId?: string;
  parent?: Department;
  createdAt: string;
}

export interface DepartmentStructure extends Department {
  employees: User[];
  subDepartments?: DepartmentStructure[];
}

// Attendance Types
export interface Attendance {
  id: string;
  userId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: 'attending' | 'late' | 'absent' | 'on_leave' | 'sick_leave';
  workHours?: number;
  overtimeMinutes: number;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  onTime: number;
  late: number;
  absent: number;
  onLeave: number;
  sickLeave: number;
  earlyLeave: number;
  totalDays: number;
  workHours?: number;
}

export interface AttendanceStats {
  date: string;
  clockIn?: string;
  status: string;
}

// Leave Request Types
export interface LeaveRequest {
  id: string;
  userId: string;
  user?: User;
  leaveType: 'casual' | 'sick' | 'annual' | 'unpaid';
  startDate: string;
  endDate: string;
  reason?: string;
  documentUrl?: string;
  status: 'waiting' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedByUser?: User;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestData {
  leaveType: 'casual' | 'sick' | 'annual' | 'unpaid';
  startDate: string;
  endDate: string;
  reason?: string;
  document?: File;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  createdByUser?: User;
  assignedTo?: string;
  assignedToUser?: User;
  projectName?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  estimatedHours?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  members?: TaskMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskMember {
  id: string;
  taskId: string;
  userId: string;
  user: User;
  createdAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  estimatedHours?: string;
  members: string[];
}

// Chat Types
export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  createdBy: string;
  members: ConversationMember[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
}

export interface ConversationMember {
  id: string;
  conversationId: string;
  userId: string;
  user: User;
  lastReadAt?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice';
  fileUrl?: string;
  createdAt: string;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: 'office' | 'meeting' | 'training' | 'holiday';
  startTime: string;
  endTime: string;
  location?: string;
  attendeesScope: 'all' | 'department' | 'custom';
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
}

// Payslip Types
export interface Payslip {
  id: string;
  userId: string;
  month: number;
  year: number;
  grossPay: number;
  totalDeductions: number;
  overtimeAmount: number;
  netPay: number;
  taxCode?: string;
  details: {
    deductions?: DeductionItem[];
    earnings?: EarningItem[];
  };
  pdfUrl?: string;
  createdAt: string;
}

export interface DeductionItem {
  name: string;
  amount: number;
}

export interface EarningItem {
  name: string;
  amount: number;
}

// Payment Card Types
export interface PaymentCard {
  id: string;
  userId: string;
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
  cardType: string;
  isDefault: boolean;
  createdAt: string;
}

// News Types
export interface News {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  author?: User;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}

export interface NewsComment {
  id: string;
  newsId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'leave_approved' | 'leave_rejected' | 'task_assigned' | 'message' | 'event_reminder' | 'clock_in_reminder';
  title: string;
  content: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// Note Types
export interface Note {
  id: string;
  userId: string;
  title: string;
  content?: string;
  reminderTime?: string;
  isShared: boolean;
  sharedWith?: string[];
  createdAt: string;
  updatedAt: string;
}

// Company Types
export interface CompanyInfo {
  id: string;
  name: string;
  legalName?: string;
  logoUrl?: string;
  ceoName?: string;
  employeeCount?: number;
  headquarters?: string;
  sector?: string;
  industry?: string;
  description?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  statusCode: number;
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  GetStarted: undefined;
  Auth: { screen: keyof AuthStackParamList } | undefined;
  Main: { screen: keyof MainTabParamList } | undefined;
  Home: undefined;
  Employee: undefined;
  Task: undefined;
  News: undefined;
  Profile: undefined;
  AttendanceList: undefined;
  AttendanceSummary: undefined;
  MyAttendance: undefined;
  EmployeeDetails: { employeeId: string };
  DepartmentStructure: { departmentId: string };
  LeaveRequest: undefined;
  LeaveRequestForm: { startDate: string; endDate: string };
  SubmissionList: undefined;
  Chat: { conversationId: string };
  ChatList: undefined;
  PhoneCall: { userId: string };
  TaskDetails: { taskId: string };
  NewTask: undefined;
  NewsDetail: { newsId: string };
  Payslip: undefined;
  PayslipDetail: { payslipId: string };
  CardDetail: { cardId?: string };
  PersonalInfo: undefined;
  PaymentMethods: undefined;
  NotificationSettings: undefined;
  ManageWork: undefined;
  CompanyProfile: undefined;
  Events: undefined;
  Notifications: undefined;
  // New Screens
  Settings: undefined;
  LanguageSettings: undefined;
  ThemeSettings: undefined;
  PrivacySettings: undefined;
  SecuritySettings: undefined;
  ChangePassword: undefined;
  TwoFactorAuth: undefined;
  ActivityLog: undefined;
  NotesList: undefined;
  NoteDetail: { noteId: string };
  CreateNote: undefined;
  ShareNote: { noteId: string };
  Calendar: undefined;
  EventDetail: { eventId: string };
  CreateEvent: { date?: Date };
  EditEvent: { eventId: string };
  HelpCenter: undefined;
  ContactSupport: undefined;
  FAQCategory: { categoryId: string };
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  Documents: undefined;
  DocumentDetail: { documentId: string };
  UploadDocument: undefined;
  ApprovalWorkflow: undefined;
  PayrollManagement: undefined;
  PayrollDetail: { payrollId: string };
  PayrollSettings: undefined;
  ExportPayroll: undefined;
  EmployeeOnboarding: undefined;
  EmployeeOffboarding: { employeeId: string };
  TimeTracking: undefined;
  StartTimer: undefined;
  TimeReports: undefined;
  TimeReport: { reportId: string }; // Added for compatibility with screen references
  ExpenseReport: undefined;
  SubmitExpense: undefined;
  ExpenseAnalytics: undefined;
  Reports: undefined;
  AttendanceReport: undefined;
  LeaveReport: undefined;
  PayrollReport: undefined;
  PerformanceReport: undefined;
  NewChat: undefined;
  BenefitsManagement: undefined;
  PerformanceReview: { employeeId?: string };
  TrainingManagement: undefined;
  Recruitment: undefined;
  JobPostings: undefined;
  Candidates: undefined;
  InterviewSchedule: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  VerificationCode: { phone: string; countryCode: string; email?: string };
  FaceIdSetup: undefined;
  ForgotPassword: undefined;
  NewPassword: { token: string };
  PasswordSuccess: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Employee: undefined;
  Task: undefined;
  News: undefined;
  Profile: undefined;
};

// Form Types
export interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  countryCode: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordFormData {
  email?: string;
  phone?: string;
  countryCode?: string;
}

export interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  estimatedHours: string;
  priority: 'low' | 'medium' | 'high';
  members: string[];
}

export interface LeaveRequestFormData {
  leaveType: 'casual' | 'sick' | 'annual' | 'unpaid';
  reason: string;
  document?: File;
}

export interface ProfileFormData {
  fullName: string;
  phone: string;
  address: string;
}

// Utility Types
export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}
