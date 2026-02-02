import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { approvalsApi } from '@app/services/api';
import { StorageKeys } from '@app/utils/constants';
import Toast from 'react-native-toast-message';

export type ApprovalType = 'leave' | 'expense' | 'timesheet' | 'overtime';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  id: string;
  type: ApprovalType;
  status: ApprovalStatus;
  requesterName: string;
  requesterAvatar?: string;
  requesterId: string;
  title: string;
  description: string;
  requestedAt: Date;
  amount?: string;
  dates?: string;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

interface ApprovalsState {
  approvals: Approval[];
  pendingCount: number;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  activeFilter: ApprovalStatus | 'all';
  
  // Actions
  fetchApprovals: (status?: ApprovalStatus) => Promise<void>;
  approveRequest: (id: string, comment?: string) => Promise<void>;
  rejectRequest: (id: string, reason: string) => Promise<void>;
  fetchPendingCount: () => Promise<void>;
  setActiveFilter: (filter: ApprovalStatus | 'all') => void;
  getFilteredApprovals: () => Approval[];
  getPendingApprovals: () => Approval[];
  getApprovalStats: () => { pending: number; approved: number; rejected: number };
}

export const useApprovalsStore = create<ApprovalsState>()(
  persist(
    (set, get) => ({
      approvals: [],
      pendingCount: 0,
      isLoading: false,
      isProcessing: false,
      error: null,
      activeFilter: 'all',

      fetchApprovals: async (status) => {
        set({ isLoading: true, error: null });
        try {
          const approvals = await approvalsApi.getApprovals(status);
          set({
            approvals: approvals.map((a: any) => ({
              ...a,
              requestedAt: new Date(a.requested_at),
              reviewedAt: a.reviewed_at ? new Date(a.reviewed_at) : undefined,
            })),
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch approvals', isLoading: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load approvals',
          });
        }
      },

      approveRequest: async (id, comment) => {
        set({ isProcessing: true });
        try {
          await approvalsApi.approveRequest(id, comment);
          
          set((state) => ({
            approvals: state.approvals.map((a) =>
              a.id === id
                ? { ...a, status: 'approved', reviewedAt: new Date() }
                : a
            ),
            pendingCount: Math.max(0, state.pendingCount - 1),
            isProcessing: false,
          }));

          Toast.show({
            type: 'success',
            text1: 'Approved',
            text2: 'Request has been approved',
          });
        } catch (error: any) {
          set({ error: error.message, isProcessing: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to approve request',
          });
          throw error;
        }
      },

      rejectRequest: async (id, reason) => {
        set({ isProcessing: true });
        try {
          await approvalsApi.rejectRequest(id, reason);
          
          set((state) => ({
            approvals: state.approvals.map((a) =>
              a.id === id
                ? { ...a, status: 'rejected', reviewedAt: new Date(), rejectionReason: reason }
                : a
            ),
            pendingCount: Math.max(0, state.pendingCount - 1),
            isProcessing: false,
          }));

          Toast.show({
            type: 'success',
            text1: 'Rejected',
            text2: 'Request has been rejected',
          });
        } catch (error: any) {
          set({ error: error.message, isProcessing: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to reject request',
          });
          throw error;
        }
      },

      fetchPendingCount: async () => {
        try {
          const pending = get().approvals.filter((a) => a.status === 'pending').length;
          set({ pendingCount: pending });
        } catch (error) {
          console.error('Failed to fetch pending count:', error);
        }
      },

      setActiveFilter: (filter) => {
        set({ activeFilter: filter });
        if (filter !== 'all') {
          get().fetchApprovals(filter);
        } else {
          get().fetchApprovals();
        }
      },

      getFilteredApprovals: () => {
        const { approvals, activeFilter } = get();
        if (activeFilter === 'all') return approvals;
        return approvals.filter((a) => a.status === activeFilter);
      },

      getPendingApprovals: () => {
        return get().approvals.filter((a) => a.status === 'pending');
      },

      getApprovalStats: () => {
        const { approvals } = get();
        return {
          pending: approvals.filter((a) => a.status === 'pending').length,
          approved: approvals.filter((a) => a.status === 'approved').length,
          rejected: approvals.filter((a) => a.status === 'rejected').length,
        };
      },
    }),
    {
      name: StorageKeys.authUser + '_approvals',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ approvals: state.approvals }),
    }
  )
);
