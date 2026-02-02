import { create } from 'zustand';
import { LeaveRequest, CreateLeaveRequestData } from '@app/types';
import { leaveApi } from '@app/services/api';

interface LeaveState {
  // State
  myRequests: LeaveRequest[];
  allRequests: LeaveRequest[];
  selectedRequest: LeaveRequest | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  isSubmitting: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  activeFilter: string | null;

  // Actions
  fetchMyRequests: (refresh?: boolean, status?: string) => Promise<void>;
  fetchAllRequests: (refresh?: boolean, status?: string) => Promise<void>;
  createRequest: (data: CreateLeaveRequestData) => Promise<void>;
  cancelRequest: (id: string) => Promise<void>;
  approveRequest: (id: string, notes?: string) => Promise<void>;
  rejectRequest: (id: string, notes?: string) => Promise<void>;
  setFilter: (filter: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  myRequests: [],
  allRequests: [],
  selectedRequest: null,
  isLoading: false,
  isLoadingMore: false,
  isSubmitting: false,
  error: null,
  hasMore: true,
  page: 1,
  activeFilter: null,
};

export const useLeaveStore = create<LeaveState>((set, get) => ({
  ...initialState,

  // Fetch my leave requests
  fetchMyRequests: async (refresh = false, status) => {
    try {
      const { page, myRequests, hasMore, activeFilter } = get();
      const filterStatus = status || activeFilter;
      
      if (!refresh && !hasMore) return;
      
      set(refresh ? { isLoading: true, error: null } : { isLoadingMore: true, error: null });
      
      const currentPage = refresh ? 1 : page;
      
      const response = await leaveApi.getMyRequests(filterStatus || undefined);
      
      const newRequests = Array.isArray(response) ? response : (response as any).data || [];
      const hasMoreData = Array.isArray(response) ? false : (response as any).hasMore;
      
      set({
        myRequests: refresh ? newRequests : [...myRequests, ...newRequests],
        page: currentPage + 1,
        hasMore: hasMoreData,
        isLoading: false,
        isLoadingMore: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch requests',
      });
    }
  },

  // Fetch all leave requests (for managers/HR)
  fetchAllRequests: async (refresh = false, status) => {
    try {
      const { page, allRequests, hasMore, activeFilter } = get();
      const filterStatus = status || activeFilter;
      
      if (!refresh && !hasMore) return;
      
      set(refresh ? { isLoading: true, error: null } : { isLoadingMore: true, error: null });
      
      const currentPage = refresh ? 1 : page;
      
      const response = await leaveApi.getAllRequests({
        status: filterStatus || undefined,
        page: currentPage,
        limit: 20,
      });
      
      const newRequests = Array.isArray(response) ? response : (response as any).data || [];
      const hasMoreData = Array.isArray(response) ? false : (response as any).hasMore;
      
      set({
        allRequests: refresh ? newRequests : [...allRequests, ...newRequests],
        page: currentPage + 1,
        hasMore: hasMoreData,
        isLoading: false,
        isLoadingMore: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch requests',
      });
    }
  },

  // Create leave request
  createRequest: async (data) => {
    try {
      set({ isSubmitting: true, error: null });
      
      let requestData: FormData | Record<string, unknown>;
      
      if (data.document) {
        const formData = new FormData();
        formData.append('leaveType', data.leaveType);
        formData.append('startDate', data.startDate);
        formData.append('endDate', data.endDate);
        if (data.reason) formData.append('reason', data.reason);
        formData.append('document', data.document);
        requestData = formData;
      } else {
        requestData = {
          leaveType: data.leaveType,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
        };
      }
      
      await leaveApi.createRequest(requestData);
      
      // Refresh my requests
      await get().fetchMyRequests(true);
      
      set({ isSubmitting: false });
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to create request',
      });
      throw error;
    }
  },

  // Cancel leave request
  cancelRequest: async (id) => {
    try {
      set({ isSubmitting: true, error: null });
      await leaveApi.cancelRequest(id);
      
      // Update local state
      set((state) => ({
        myRequests: state.myRequests.map((req) =>
          req.id === id ? { ...req, status: 'cancelled' as const } : req
        ),
        isSubmitting: false,
      }));
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to cancel request',
      });
      throw error;
    }
  },

  // Approve leave request
  approveRequest: async (id, notes) => {
    try {
      set({ isSubmitting: true, error: null });
      await leaveApi.updateRequest(id, 'approved', notes);
      
      // Update local state
      set((state) => ({
        allRequests: state.allRequests.map((req) =>
          req.id === id ? { ...req, status: 'approved' as const } : req
        ),
        isSubmitting: false,
      }));
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to approve request',
      });
      throw error;
    }
  },

  // Reject leave request
  rejectRequest: async (id, notes) => {
    try {
      set({ isSubmitting: true, error: null });
      await leaveApi.updateRequest(id, 'rejected', notes);
      
      // Update local state
      set((state) => ({
        allRequests: state.allRequests.map((req) =>
          req.id === id ? { ...req, status: 'rejected' as const } : req
        ),
        isSubmitting: false,
      }));
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to reject request',
      });
      throw error;
    }
  },

  // Set filter
  setFilter: (filter) => {
    set({ activeFilter: filter, page: 1, hasMore: true });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset state
  reset: () => set(initialState),
}));
