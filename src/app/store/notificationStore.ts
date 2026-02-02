import { create } from 'zustand';
import { Notification } from '@app/types';
import { notificationApi } from '@app/services/api';
import { supabase, subscribeToNotifications } from '@app/services/supabase';

interface NotificationState {
  // State
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  subscription: ReturnType<typeof subscribeToNotifications> | null;

  // Actions
  fetchNotifications: (refresh?: boolean, unreadOnly?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribe: (userId: string) => void;
  unsubscribe: () => void;
  addNotification: (notification: Notification) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  hasMore: true,
  page: 1,
  subscription: null,
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  ...initialState,

  // Fetch notifications
  fetchNotifications: async (refresh = false, unreadOnly = false) => {
    try {
      const { page, notifications, hasMore } = get();
      
      if (!refresh && !hasMore) return;
      
      set(refresh ? { isLoading: true, error: null } : { isLoadingMore: true, error: null });
      
      const currentPage = refresh ? 1 : page;
      
      const response = await notificationApi.getNotifications({
        page: currentPage,
        limit: 20,
        unreadOnly,
      });
      
      const newNotifications = Array.isArray(response) ? response : (response as any).data || [];
      const hasMoreData = Array.isArray(response) ? false : (response as any).hasMore;

      set({
        notifications: refresh ? newNotifications : [...notifications, ...newNotifications],
        page: currentPage + 1,
        hasMore: hasMoreData,
        isLoading: false,
        isLoadingMore: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        isLoadingMore: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
      });
    }
  },

  // Mark notification as read
  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(id);
      
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, get().unreadCount - 1),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark as read',
      });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark all as read',
      });
    }
  },

  // Subscribe to real-time notifications
  subscribe: (userId) => {
    const { subscription } = get();
    
    // Unsubscribe from existing subscription
    if (subscription) {
      subscription.unsubscribe();
    }
    
    // Create new subscription
    const newSubscription = subscribeToNotifications(userId, (payload: any) => {
      const newNotification = payload.new as Notification;
      get().addNotification(newNotification);
    });
    
    set({ subscription: newSubscription });
  },

  // Unsubscribe from real-time notifications
  unsubscribe: () => {
    const { subscription } = get();
    if (subscription) {
      subscription.unsubscribe();
      set({ subscription: null });
    }
  },

  // Add new notification (from real-time)
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    }));
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset state
  reset: () => {
    get().unsubscribe();
    set(initialState);
  },
}));
