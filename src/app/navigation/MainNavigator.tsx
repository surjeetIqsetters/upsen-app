import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList } from '@app/types';
import { Colors, Typography, Spacing } from '@app/utils/constants';

// Tab Screens
import { HomeScreen } from '@app/screens/home/HomeScreen';
import { EmployeeScreen } from '@app/screens/employee/EmployeeScreen';
import { TaskScreen } from '@app/screens/task/TaskScreen';
import { NewsScreen } from '@app/screens/news/NewsScreen';
import { ProfileScreen } from '@app/screens/profile/ProfileScreen';

// Stack Screens (that can be navigated to from tabs)
import { AttendanceListScreen } from '@app/screens/attendance/AttendanceListScreen';
import { AttendanceSummaryScreen } from '@app/screens/attendance/AttendanceSummaryScreen';
import { MyAttendanceScreen } from '@app/screens/attendance/MyAttendanceScreen';
import { EmployeeDetailsScreen } from '@app/screens/employee/EmployeeDetailsScreen';
import { DepartmentStructureScreen } from '@app/screens/employee/DepartmentStructureScreen';
import { LeaveRequestScreen } from '@app/screens/leave/LeaveRequestScreen';
import { LeaveRequestFormScreen } from '@app/screens/leave/LeaveRequestFormScreen';
import { SubmissionListScreen } from '@app/screens/leave/SubmissionListScreen';
import { ChatScreen } from '@app/screens/chat/ChatScreen';
import { ChatListScreen } from '@app/screens/chat/ChatListScreen';
import { PhoneCallScreen } from '@app/screens/chat/PhoneCallScreen';
import { TaskDetailsScreen } from '@app/screens/task/TaskDetailsScreen';
import { NewTaskScreen } from '@app/screens/task/NewTaskScreen';
import { NewsDetailScreen } from '@app/screens/news/NewsDetailScreen';
import { PayslipScreen } from '@app/screens/payslip/PayslipScreen';
import { PayslipDetailScreen } from '@app/screens/payslip/PayslipDetailScreen';
import { CardDetailScreen } from '@app/screens/payslip/CardDetailScreen';
import { PersonalInfoScreen } from '@app/screens/profile/PersonalInfoScreen';
import { PaymentMethodsScreen } from '@app/screens/profile/PaymentMethodsScreen';
import { NotificationSettingsScreen } from '@app/screens/profile/NotificationSettingsScreen';
import { ManageWorkScreen } from '@app/screens/profile/ManageWorkScreen';
import { CompanyProfileScreen } from '@app/screens/company/CompanyProfileScreen';
import { EventsScreen } from '@app/screens/events/EventsScreen';
import { NotificationsScreen } from '@app/screens/notifications/NotificationsScreen';

// New Screens
import { NotesListScreen } from '@app/screens/notes/NotesListScreen';
import { NoteDetailScreen } from '@app/screens/notes/NoteDetailScreen';
import { CreateNoteScreen } from '@app/screens/notes/CreateNoteScreen';
import { CalendarScreen } from '@app/screens/calendar/CalendarScreen';
import { EventDetailScreen } from '@app/screens/calendar/EventDetailScreen';
import { CreateEventScreen } from '@app/screens/calendar/CreateEventScreen';
import { SettingsScreen } from '@app/screens/settings/SettingsScreen';
import { LanguageSettingsScreen } from '@app/screens/settings/LanguageSettingsScreen';
import { HelpCenterScreen } from '@app/screens/help/HelpCenterScreen';
import { ContactSupportScreen } from '@app/screens/help/ContactSupportScreen';
import { DocumentsScreen } from '@app/screens/documents/DocumentsScreen';
import { UploadDocumentScreen } from '@app/screens/documents/UploadDocumentScreen';
import { ApprovalWorkflowScreen } from '@app/screens/hr/ApprovalWorkflowScreen';
import { PayrollManagementScreen } from '@app/screens/hr/PayrollManagementScreen';
import { EmployeeOnboardingScreen } from '@app/screens/hr/EmployeeOnboardingScreen';
import { TimeTrackingScreen } from '@app/screens/timeexpense/TimeTrackingScreen';
import { ExpenseReportScreen } from '@app/screens/timeexpense/ExpenseReportScreen';
import { ReportsScreen } from '@app/screens/reports/ReportsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const tabBarIcon = (name: string) => {
  return ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
    <Ionicons
      name={focused ? (name as any) : (`${name}-outline` as any)}
      size={size}
      color={color}
    />
  );
};

const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AttendanceList" component={AttendanceListScreen} />
      <Stack.Screen name="AttendanceSummary" component={AttendanceSummaryScreen} />
      <Stack.Screen name="MyAttendance" component={MyAttendanceScreen} />
      <Stack.Screen name="Events" component={EventsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

const EmployeeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Employee" component={EmployeeScreen} />
      <Stack.Screen name="EmployeeDetails" component={EmployeeDetailsScreen} />
      <Stack.Screen name="DepartmentStructure" component={DepartmentStructureScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="PhoneCall" component={PhoneCallScreen} />
      <Stack.Screen name="LeaveRequest" component={LeaveRequestScreen} />
      <Stack.Screen name="LeaveRequestForm" component={LeaveRequestFormScreen} />
      <Stack.Screen name="SubmissionList" component={SubmissionListScreen} />
    </Stack.Navigator>
  );
};

const TaskStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Task" component={TaskScreen} />
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
      <Stack.Screen name="NewTask" component={NewTaskScreen} />
    </Stack.Navigator>
  );
};

const NewsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="News" component={NewsScreen} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
    </Stack.Navigator>
  );
};

const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="ManageWork" component={ManageWorkScreen} />
      <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
      <Stack.Screen name="Payslip" component={PayslipScreen} />
      <Stack.Screen name="PayslipDetail" component={PayslipDetailScreen} />
      <Stack.Screen name="CardDetail" component={CardDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
      <Stack.Screen name="NotesList" component={NotesListScreen} />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
      <Stack.Screen name="CreateNote" component={CreateNoteScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="UploadDocument" component={UploadDocumentScreen} />
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ApprovalWorkflow" component={ApprovalWorkflowScreen} />
      <Stack.Screen name="PayrollManagement" component={PayrollManagementScreen} />
      <Stack.Screen name="EmployeeOnboarding" component={EmployeeOnboardingScreen} />
      <Stack.Screen name="TimeTracking" component={TimeTrackingScreen} />
      <Stack.Screen name="ExpenseReport" component={ExpenseReportScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
    </Stack.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: Spacing.sm,
          paddingTop: Spacing.xs,
          height: 60 + Spacing.sm,
        },
        tabBarLabelStyle: {
          fontSize: Typography.size.xs,
          fontWeight: Typography.weight.medium,
          marginTop: Spacing.xs,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: tabBarIcon('home'),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Employee"
        component={EmployeeStackNavigator}
        options={{
          tabBarIcon: tabBarIcon('people'),
          tabBarLabel: 'Employee',
        }}
      />
      <Tab.Screen
        name="Task"
        component={TaskStackNavigator}
        options={{
          tabBarIcon: tabBarIcon('clipboard'),
          tabBarLabel: 'Task',
        }}
      />
      <Tab.Screen
        name="News"
        component={NewsStackNavigator}
        options={{
          tabBarIcon: tabBarIcon('newspaper'),
          tabBarLabel: 'News',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: tabBarIcon('person'),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};
