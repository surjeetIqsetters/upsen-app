import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '@app/utils/constants';

export interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

export interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: string;
  }[];
}

export interface DashboardStats {
  totalEmployees: MetricData;
  attendanceRate: MetricData;
  leaveUtilization: MetricData;
  taskCompletion: MetricData;
  avgCheckInTime: MetricData;
  overtimeHours: MetricData;
}

export interface DepartmentStats {
  department: string;
  employeeCount: number;
  attendanceRate: number;
  leaveBalance: number;
  performance: number;
}

interface AnalyticsState {
  // Time range
  selectedTimeRange: TimeRange;
  availableTimeRanges: TimeRange[];
  
  // Dashboard data
  dashboardStats: DashboardStats | null;
  departmentStats: DepartmentStats[] | null;
  attendanceChart: ChartData | null;
  leaveChart: ChartData | null;
  taskChart: ChartData | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTimeRange: (range: TimeRange) => void;
  fetchDashboardStats: () => Promise<void>;
  fetchDepartmentStats: () => Promise<void>;
  fetchAttendanceChart: () => Promise<void>;
  fetchLeaveChart: () => Promise<void>;
  fetchTaskChart: () => Promise<void>;
  exportData: (format: 'csv' | 'pdf' | 'excel', dataType: string) => Promise<string>;
  clearError: () => void;
}

const createTimeRanges = (): TimeRange[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return [
    {
      start: today,
      end: now,
      label: 'Today',
    },
    {
      start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: now,
      label: 'Last 7 Days',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: now,
      label: 'This Month',
    },
    {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
      label: 'Last Month',
    },
    {
      start: new Date(today.getFullYear(), 0, 1),
      end: now,
      label: 'This Year',
    },
  ];
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedTimeRange: createTimeRanges()[1], // Default to Last 7 Days
      availableTimeRanges: createTimeRanges(),
      dashboardStats: null,
      departmentStats: null,
      attendanceChart: null,
      leaveChart: null,
      taskChart: null,
      isLoading: false,
      error: null,

      // Set time range
      setTimeRange: (range) => {
        set({ selectedTimeRange: range });
        // Refetch all data with new range
        get().fetchDashboardStats();
        get().fetchDepartmentStats();
        get().fetchAttendanceChart();
        get().fetchLeaveChart();
        get().fetchTaskChart();
      },

      // Fetch dashboard statistics
      fetchDashboardStats: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock data - replace with actual API call
          const mockStats: DashboardStats = {
            totalEmployees: { label: 'Total Employees', value: 156, change: 5.2, trend: 'up' },
            attendanceRate: { label: 'Attendance Rate', value: 94.5, change: 2.1, trend: 'up' },
            leaveUtilization: { label: 'Leave Utilization', value: 68.3, change: -3.5, trend: 'down' },
            taskCompletion: { label: 'Task Completion', value: 87.2, change: 4.8, trend: 'up' },
            avgCheckInTime: { label: 'Avg Check-in', value: 9.2, change: -0.3, trend: 'up' },
            overtimeHours: { label: 'Overtime Hours', value: 124, change: 12.5, trend: 'up' },
          };
          
          set({ dashboardStats: mockStats, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
            isLoading: false 
          });
        }
      },

      // Fetch department statistics
      fetchDepartmentStats: async () => {
        try {
          // Mock data - replace with actual API call
          const mockData: DepartmentStats[] = [
            { department: 'Engineering', employeeCount: 45, attendanceRate: 96.2, leaveBalance: 12.5, performance: 92 },
            { department: 'Sales', employeeCount: 32, attendanceRate: 91.8, leaveBalance: 8.3, performance: 88 },
            { department: 'Marketing', employeeCount: 18, attendanceRate: 94.5, leaveBalance: 15.2, performance: 85 },
            { department: 'HR', employeeCount: 12, attendanceRate: 97.1, leaveBalance: 18.5, performance: 90 },
            { department: 'Finance', employeeCount: 15, attendanceRate: 95.8, leaveBalance: 14.1, performance: 93 },
            { department: 'Operations', employeeCount: 34, attendanceRate: 92.3, leaveBalance: 10.8, performance: 87 },
          ];
          
          set({ departmentStats: mockData });
        } catch (error) {
          console.error('Failed to fetch department stats:', error);
        }
      },

      // Fetch attendance chart data
      fetchAttendanceChart: async () => {
        try {
          // Mock data - replace with actual API call
          const mockChart: ChartData = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            datasets: [
              { data: [95, 92, 96, 94, 91], color: '#4A90E2' },
              { data: [5, 8, 4, 6, 9], color: '#F44336' },
            ],
          };
          
          set({ attendanceChart: mockChart });
        } catch (error) {
          console.error('Failed to fetch attendance chart:', error);
        }
      },

      // Fetch leave chart data
      fetchLeaveChart: async () => {
        try {
          // Mock data - replace with actual API call
          const mockChart: ChartData = {
            labels: ['Annual', 'Sick', 'Casual', 'Maternity', 'Unpaid'],
            datasets: [
              { data: [45, 23, 18, 5, 8], color: '#4CAF50' },
            ],
          };
          
          set({ leaveChart: mockChart });
        } catch (error) {
          console.error('Failed to fetch leave chart:', error);
        }
      },

      // Fetch task chart data
      fetchTaskChart: async () => {
        try {
          // Mock data - replace with actual API call
          const mockChart: ChartData = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
              { data: [78, 82, 88, 91], color: '#7B68EE' },
              { data: [22, 18, 12, 9], color: '#FF9800' },
            ],
          };
          
          set({ taskChart: mockChart });
        } catch (error) {
          console.error('Failed to fetch task chart:', error);
        }
      },

      // Export data
      exportData: async (format, dataType) => {
        try {
          // Implementation will depend on export service
          console.log(`Exporting ${dataType} as ${format}`);
          return `/downloads/${dataType}_${Date.now()}.${format}`;
        } catch (error) {
          throw error instanceof Error ? error : new Error('Export failed');
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: StorageKeys.analytics,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        selectedTimeRange: state.selectedTimeRange,
        dashboardStats: state.dashboardStats,
      }),
    }
  )
);
