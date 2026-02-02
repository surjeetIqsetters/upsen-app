import { APIConfig } from '@app/utils/constants';
import { useAuthStore } from '@app/store/authStore';

// Custom fetch-based API client for React Native compatibility
class FetchAPIClient {
  private baseURL: string;
  private timeout: number;

  constructor(config: { baseURL: string; timeout: number }) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const { session } = useAuthStore.getState();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    try {
      const response = await this.fetchWithTimeout(fullUrl, {
        ...options,
        headers,
      });

      // Handle 401 - try to refresh token
      if (response.status === 401) {
        try {
          const { refreshSession } = useAuthStore.getState();
          await refreshSession();
          const { session: newSession } = useAuthStore.getState();
          
          if (newSession?.accessToken) {
            headers.Authorization = `Bearer ${newSession.accessToken}`;
            const retryResponse = await this.fetchWithTimeout(fullUrl, {
              ...options,
              headers,
            });
            
            if (!retryResponse.ok) {
              throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
            }
            
            const contentType = retryResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              return await retryResponse.json();
            }
            return await retryResponse.text() as unknown as T;
          }
        } catch (refreshError) {
          const { signOut } = useAuthStore.getState();
          await signOut();
          throw refreshError;
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text() as unknown as T;
    } catch (error) {
      throw error;
    }
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${url}${queryString}`, { method: 'GET' });
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' });
  }

  async upload<T>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    const { session } = useAuthStore.getState();
    const headers: Record<string, string> = {};

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    // Note: fetch doesn't support onUploadProgress natively
    // For progress tracking, you'd need to use XMLHttpRequest or a library like expo-file-system
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Create API client instance
const apiClient = new FetchAPIClient({
  baseURL: APIConfig.baseURL,
  timeout: APIConfig.timeout,
});

// Generic API methods
export const api = {
  get: <T>(url: string, params?: Record<string, any>) => apiClient.get<T>(url, params),
  post: <T>(url: string, data?: any) => apiClient.post<T>(url, data),
  put: <T>(url: string, data?: any) => apiClient.put<T>(url, data),
  patch: <T>(url: string, data?: any) => apiClient.patch<T>(url, data),
  delete: <T>(url: string) => apiClient.delete<T>(url),
  upload: <T>(url: string, formData: FormData, onProgress?: (progress: number) => void) => 
    apiClient.upload<T>(url, formData, onProgress),
};

// Chat API
export const chatApi = {
  getConversations: () => api.get<any[]>('/chat/conversations'),
  getMessages: (conversationId: string, page = 1, limit = 50) => 
    api.get<any[]>(`/chat/conversations/${conversationId}/messages`, { page, limit }),
  sendMessage: (conversationId: string, content: string, type = 'text') => 
    api.post<any>(`/chat/conversations/${conversationId}/messages`, { content, type }),
  createConversation: (participantIds: string[], isGroup = false, name?: string) => 
    api.post<any>('/chat/conversations', { participantIds, isGroup, name }),
  markAsRead: (conversationId: string) => 
    api.post(`/chat/conversations/${conversationId}/read`),
  getUnreadCount: () => api.get<number>('/chat/unread-count'),
};

// Notes API
export const notesApi = {
  getNotes: () => api.get<any[]>('/notes'),
  getNote: (id: string) => api.get<any>(`/notes/${id}`),
  createNote: (data: { title: string; content?: string; reminderTime?: Date }) => 
    api.post<any>('/notes', data),
  updateNote: (id: string, data: Partial<{ title: string; content: string; reminderTime?: Date | null }>) => 
    api.patch<any>(`/notes/${id}`, data),
  deleteNote: (id: string) => api.delete(`/notes/${id}`),
  shareNote: (id: string, userIds: string[]) => 
    api.post(`/notes/${id}/share`, { userIds }),
};

// Events API
export const eventsApi = {
  getEvents: (startDate?: string, endDate?: string) => 
    api.get<any[]>('/events', { startDate, endDate }),
  getEvent: (id: string) => api.get<any>(`/events/${id}`),
  createEvent: (data: {
    title: string;
    description?: string;
    eventType: string;
    startTime: Date;
    endTime: Date;
    location?: string;
  }) => api.post<any>('/events', data),
  updateEvent: (id: string, data: Partial<any>) => api.patch<any>(`/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/events/${id}`),
  joinEvent: (id: string) => api.post(`/events/${id}/join`),
  leaveEvent: (id: string) => api.post(`/events/${id}/leave`),
  getAttendees: (id: string) => api.get<any[]>(`/events/${id}/attendees`),
};

// Company API
export const companyApi = {
  getCompanyInfo: () => api.get<any>('/company'),
  updateCompanyInfo: (data: any) => api.patch<any>('/company', data),
};

// Documents API
export const documentsApi = {
  getDocuments: (category?: string) => api.get<any[]>('/documents', { category }),
  uploadDocument: (formData: FormData, onProgress?: (progress: number) => void) => 
    api.upload<any>('/documents', formData, onProgress),
  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
  downloadDocument: (id: string) => api.get<string>(`/documents/${id}/download`),
};

// Approvals API
export const approvalsApi = {
  getApprovals: (status?: string) => api.get<any[]>('/approvals', { status }),
  approveRequest: (id: string, comment?: string) => 
    api.post(`/approvals/${id}/approve`, { comment }),
  rejectRequest: (id: string, reason: string) => 
    api.post(`/approvals/${id}/reject`, { reason }),
};

// Payroll API
export const payrollApi = {
  getPayrollRecords: (month: number, year: number) => 
    api.get<any[]>('/payroll', { month, year }),
  getPayrollDetail: (id: string) => api.get<any>(`/payroll/${id}`),
  processPayroll: (month: number, year: number) => 
    api.post('/payroll/process', { month, year }),
  exportPayroll: (month: number, year: number, format: 'csv' | 'pdf' | 'excel') => 
    api.get<string>('/payroll/export', { month, year, format }),
};

// News API
export const newsApi = {
  getNews: (params?: any) => api.get<any[]>('/news', params),
  getNewsItem: (id: string) => api.get<any>(`/news/${id}`),
  getNewsDetail: (id: string) => api.get<any>(`/news/${id}`),
  likeNews: (id: string) => api.post(`/news/${id}/like`, {}),
  unlikeNews: (id: string) => api.delete(`/news/${id}/like`),
  addComment: (id: string, content: string) => api.post(`/news/${id}/comments`, { content }),
  commentOnNews: (id: string, content: string) => api.post(`/news/${id}/comments`, { content }),
  getComments: (id: string) => api.get<any>(`/news/${id}/comments`),
};

// Payslip API
export const payslipApi = {
  getPayslips: (year?: number) => api.get<any[]>('/payslips', { year }),
  getPayslip: (id: string) => api.get<any>(`/payslips/${id}`),
  getPayslipDetail: (id: string) => api.get<any>(`/payslips/${id}`),
  downloadPayslip: (id: string) => api.get<string>(`/payslips/${id}/download`),
  getPaymentCards: () => api.get<any[]>('/payment-methods/cards'),
};

// Time Tracking API
export const timeTrackingApi = {
  getTimeEntries: (startDate?: string, endDate?: string) => 
    api.get<any[]>('/time-tracking', { startDate, endDate }),
  startTimer: (project: string, task: string, notes?: string) => 
    api.post<any>('/time-tracking/start', { project, task, notes }),
  stopTimer: () => api.post<any>('/time-tracking/stop'),
  getCurrentSession: () => api.get<any>('/time-tracking/current'),
  getTimeReport: (period: 'day' | 'week' | 'month') => 
    api.get<any>(`/time-tracking/report`, { period }),
};

// Expense API
export const expenseApi = {
  getExpenses: (status?: string) => api.get<any[]>('/expenses', { status }),
  submitExpense: (data: {
    category: string;
    amount: number;
    description: string;
    date: Date;
    receipt?: File;
  }) => {
    const formData = new FormData();
    formData.append('category', data.category);
    formData.append('amount', data.amount.toString());
    formData.append('description', data.description);
    formData.append('date', data.date.toISOString());
    if (data.receipt) {
      formData.append('receipt', data.receipt);
    }
    return api.upload<any>('/expenses', formData);
  },
  deleteExpense: (id: string) => api.delete(`/expenses/${id}`),
};

// Reports API
export const reportsApi = {
  getAttendanceReport: (startDate: string, endDate: string) => 
    api.get<any>('/reports/attendance', { startDate, endDate }),
  getLeaveReport: (year: number) => api.get<any>('/reports/leaves', { year }),
  getPayrollReport: (month: number, year: number) => 
    api.get<any>('/reports/payroll', { month, year }),
  getPerformanceReport: (period: string) => 
    api.get<any>('/reports/performance', { period }),
  getExpenseAnalytics: (period: string) => 
    api.get<any>('/reports/expenses', { period }),
};

// Employee API
export const employeeApi = {
  getEmployees: (params?: { departmentId?: string; search?: string; page?: number; limit?: number }) => 
    api.get<any[]>('/employees', params),
  getEmployee: (id: string) => api.get<any>(`/employees/${id}`),
  createEmployee: (data: any) => api.post<any>('/employees', data),
  updateEmployee: (id: string, data: any) => api.patch<any>(`/employees/${id}`, data),
  deleteEmployee: (id: string) => api.delete(`/employees/${id}`),
  onboardEmployee: (data: any) => api.post<any>('/employees/onboard', data),
  offboardEmployee: (id: string, data: any) => api.post<any>(`/employees/${id}/offboard`, data),
  getDepartments: () => api.get<any[]>('/departments'),
  getDepartmentStructure: (id: string) => api.get<any>(`/departments/${id}/structure`),
};

// Leave API
export const leaveApi = {
  getLeaveRequests: (status?: string) => api.get<any[]>('/leaves', { status }),
  getMyRequests: (status?: string) => api.get<any[]>('/leaves/me', { status }),
  getAllRequests: (params?: any) => api.get<any>('/leaves/all', params),
  getLeaveBalance: () => api.get<any>('/leaves/balance'),
  createLeaveRequest: (data: any) => api.post<any>('/leaves', data),
  createRequest: (data: any) => api.post<any>('/leaves', data), // Alias
  cancelLeaveRequest: (id: string) => api.post(`/leaves/${id}/cancel`),
  cancelRequest: (id: string) => api.post(`/leaves/${id}/cancel`), // Alias
  updateRequest: (id: string, status: string, notes?: string) => 
    api.patch(`/leaves/${id}`, { status, notes }),
};

// Task API
export const taskApi = {
  getTasks: (params?: any) => api.get<any[]>('/tasks', params),
  getTask: (id: string) => api.get<any>(`/tasks/${id}`),
  createTask: (data: any) => api.post<any>('/tasks', data),
  updateTask: (id: string, data: any) => api.patch<any>(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  assignTask: (id: string, userId: string) => api.post(`/tasks/${id}/assign`, { userId }),
  completeTask: (id: string) => api.post(`/tasks/${id}/complete`),
  updateStatus: (id: string, status: string) => api.patch(`/tasks/${id}/status`, { status }),
};

// Attendance API
export const attendanceApi = {
  getTodayAttendance: () => api.get<any>('/attendance/today'),
  getAttendanceHistory: (params?: { startDate?: string; endDate?: string; page?: number }) => 
    api.get<any[]>('/attendance/history', params),
  getAttendanceSummary: (month: number, year: number) => 
    api.get<any>('/attendance/summary', { month, year }),
  clockIn: (location?: { lat: number; lng: number }) => 
    api.post<any>('/attendance/clock-in', { location }),
  clockOut: () => api.post<any>('/attendance/clock-out'),
};

// Notification API
export const notificationsApi = {
    getNotifications: (params?: any) => api.get<any[]>('/notifications', params),
    markAsRead: (id: string) => api.post(`/notifications/${id}/read`, {}),
    markAllAsRead: () => api.post('/notifications/read-all', {}),
    deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
    getSettings: () => api.get<any>('/notifications/settings'),
    updateSettings: (settings: any) => api.put('/notifications/settings', settings),
    updatePreferences: (preferences: any) => api.put('/notifications/preferences', preferences),
};

export const notificationApi = notificationsApi;

export default apiClient;
