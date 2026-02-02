import React, { useState, useCallback, useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

interface RefreshOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

interface RefreshState {
  isRefreshing: boolean;
  lastRefreshed: Date | null;
  error: Error | null;
}

/**
 * Hook for handling pull-to-refresh functionality
 */
export function useRefresh(
  refreshFunction: () => Promise<void>,
  options: RefreshOptions = {}
) {
  const [state, setState] = useState<RefreshState>({
    isRefreshing: false,
    lastRefreshed: null,
    error: null,
  });

  const { isConnected } = useNetworkStatus();

  const refresh = useCallback(async () => {
    if (!isConnected) {
      setState((prev) => ({
        ...prev,
        error: new Error('No internet connection'),
      }));
      return;
    }

    setState((prev) => ({ ...prev, isRefreshing: true, error: null }));

    try {
      await refreshFunction();
      setState({
        isRefreshing: false,
        lastRefreshed: new Date(),
        error: null,
      });
      options.onSuccess?.();
    } catch (error) {
      const refreshError = error instanceof Error ? error : new Error('Refresh failed');
      setState((prev) => ({
        ...prev,
        isRefreshing: false,
        error: refreshError,
      }));
      options.onError?.(refreshError);
    }
  }, [refreshFunction, isConnected, options]);

  const reset = useCallback(() => {
    setState({
      isRefreshing: false,
      lastRefreshed: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    refresh,
    reset,
    canRefresh: isConnected,
  };
}

/**
 * Hook for auto-refresh functionality
 */
export function useAutoRefresh(
  refreshFunction: () => Promise<void>,
  interval: number = 30000, // 30 seconds
  enabled: boolean = true
) {
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(async () => {
      setIsAutoRefreshing(true);
      try {
        await refreshFunction();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      } finally {
        setIsAutoRefreshing(false);
      }
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [refreshFunction, interval, enabled]);

  return { isAutoRefreshing };
}
