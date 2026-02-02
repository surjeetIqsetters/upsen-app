import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  isWifi: boolean;
  isCellular: boolean;
}

/**
 * Hook for monitoring network status
 */
export function useNetworkStatus(): NetworkStatus {
  const [networkState, setNetworkState] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    connectionType: null,
    isWifi: false,
    isCellular: false,
  });

  useEffect(() => {
    // Initial check
    NetInfo.fetch().then((state) => {
      updateNetworkState(state);
    });

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      updateNetworkState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateNetworkState = (state: NetInfoState) => {
    setNetworkState({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      connectionType: state.type,
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
    });
  };

  return networkState;
}

/**
 * Hook that triggers a callback when network status changes
 */
export function useNetworkChange(
  onConnect?: () => void,
  onDisconnect?: () => void
): void {
  const { isConnected } = useNetworkStatus();
  const [wasConnected, setWasConnected] = useState(isConnected);

  useEffect(() => {
    if (isConnected && !wasConnected) {
      onConnect?.();
    } else if (!isConnected && wasConnected) {
      onDisconnect?.();
    }
    setWasConnected(isConnected);
  }, [isConnected, wasConnected, onConnect, onDisconnect]);
}

/**
 * Hook that returns whether the device is online
 */
export function useIsOnline(): boolean {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  return isConnected && (isInternetReachable ?? true);
}
