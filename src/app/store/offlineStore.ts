import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { StorageKeys } from '@app/utils/constants';

export type QueueAction = 'create' | 'update' | 'delete';

export interface QueueItem {
  id: string;
  entity: string;
  action: QueueAction;
  data: Record<string, any>;
  timestamp: number;
  retryCount: number;
}

interface OfflineState {
  // Network state
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  
  // Sync queue
  syncQueue: QueueItem[];
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingChanges: number;
  
  // Cached data
  cachedData: Record<string, any>;
  
  // Actions
  initializeNetwork: () => () => void;
  updateNetworkState: (state: NetInfoState) => void;
  addToQueue: (item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>) => void;
  removeFromQueue: (id: string) => void;
  processQueue: () => Promise<void>;
  processQueueItem: (item: QueueItem) => Promise<void>;
  clearQueue: () => void;
  incrementRetry: (id: string) => void;
  cacheData: (key: string, data: any) => void;
  getCachedData: (key: string) => any;
  clearCache: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: true,
      isInternetReachable: true,
      connectionType: null,
      syncQueue: [],
      isSyncing: false,
      lastSyncTime: null,
      pendingChanges: 0,
      cachedData: {},

      // Initialize network listener
      initializeNetwork: () => {
        const unsubscribe = NetInfo.addEventListener((state) => {
          get().updateNetworkState(state);
        });
        
        // Initial check
        NetInfo.fetch().then((state) => {
          get().updateNetworkState(state);
        });
        
        return unsubscribe;
      },

      // Update network state
      updateNetworkState: (state) => {
        const wasOffline = !get().isConnected;
        const isConnected = state.isConnected ?? false;
        
        set({
          isConnected,
          isInternetReachable: state.isInternetReachable,
          connectionType: state.type,
        });
        
        // Auto-sync when coming back online
        if (wasOffline && isConnected && get().syncQueue.length > 0) {
          get().processQueue();
        }
      },

      // Add item to sync queue
      addToQueue: (item) => {
        const newItem: QueueItem = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          retryCount: 0,
        };
        
        set((state) => ({
          syncQueue: [...state.syncQueue, newItem],
          pendingChanges: state.pendingChanges + 1,
        }));
      },

      // Remove item from queue
      removeFromQueue: (id) => {
        set((state) => ({
          syncQueue: state.syncQueue.filter((item) => item.id !== id),
          pendingChanges: Math.max(0, state.pendingChanges - 1),
        }));
      },

      // Process sync queue
      processQueue: async () => {
        const { syncQueue, isConnected, isSyncing } = get();
        
        if (!isConnected || isSyncing || syncQueue.length === 0) return;
        
        set({ isSyncing: true });
        
        const failedItems: QueueItem[] = [];
        
        for (const item of syncQueue) {
          try {
            // Process based on entity and action
            await get().processQueueItem(item);
          } catch (error) {
            // If retry count exceeded, keep in queue for later
            if (item.retryCount < 3) {
              failedItems.push({ ...item, retryCount: item.retryCount + 1 });
            }
          }
        }
        
        set({
          syncQueue: failedItems,
          isSyncing: false,
          lastSyncTime: Date.now(),
          pendingChanges: failedItems.length,
        });
      },

      // Process individual queue item (override in implementation)
      processQueueItem: async (item: QueueItem) => {
        // This will be implemented based on specific entity types
        console.log('Processing queue item:', item);
      },

      // Clear entire queue
      clearQueue: () => {
        set({ syncQueue: [], pendingChanges: 0 });
      },

      // Increment retry count
      incrementRetry: (id) => {
        set((state) => ({
          syncQueue: state.syncQueue.map((item) =>
            item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
          ),
        }));
      },

      // Cache data locally
      cacheData: (key, data) => {
        set((state) => ({
          cachedData: { ...state.cachedData, [key]: { data, timestamp: Date.now() } },
        }));
      },

      // Get cached data
      getCachedData: (key) => {
        const cached = get().cachedData[key];
        return cached?.data;
      },

      // Clear all cached data
      clearCache: () => {
        set({ cachedData: {} });
      },
    }),
    {
      name: StorageKeys.offline,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        syncQueue: state.syncQueue, 
        cachedData: state.cachedData,
        lastSyncTime: state.lastSyncTime,
        pendingChanges: state.pendingChanges,
      }),
    }
  )
);
