import React, { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Hook for monitoring app state (active, background, inactive)
 */
export function useAppState() {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appStateRef.current = nextAppState;
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    appState,
    isActive: appState === 'active',
    isBackground: appState === 'background',
    isInactive: appState === 'inactive',
    previousState: appStateRef.current,
  };
}

/**
 * Hook that triggers callbacks when app becomes active or inactive
 */
export function useAppStateChange(
  onBecomeActive?: () => void,
  onBecomeInactive?: () => void
) {
  const { appState, isActive } = useAppState();
  const wasActive = useRef(isActive);

  useEffect(() => {
    if (isActive && !wasActive.current) {
      onBecomeActive?.();
    } else if (!isActive && wasActive.current) {
      onBecomeInactive?.();
    }
    wasActive.current = isActive;
  }, [appState, isActive, onBecomeActive, onBecomeInactive]);
}

/**
 * Hook for tracking time spent in app
 */
export function useAppUsageTime() {
  const [totalTime, setTotalTime] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const sessionStartTime = useRef<number | null>(null);
  const { isActive } = useAppState();

  useEffect(() => {
    if (isActive) {
      sessionStartTime.current = Date.now();
      const interval = setInterval(() => {
        if (sessionStartTime.current) {
          setSessionTime(Math.floor((Date.now() - sessionStartTime.current) / 1000));
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        if (sessionStartTime.current) {
          const sessionDuration = Date.now() - sessionStartTime.current;
          setTotalTime((prev) => prev + sessionDuration);
        }
      };
    } else {
      if (sessionStartTime.current) {
        const sessionDuration = Date.now() - sessionStartTime.current;
        setTotalTime((prev) => prev + sessionDuration);
        setSessionTime(0);
        sessionStartTime.current = null;
      }
    }
  }, [isActive]);

  return {
    totalTimeSeconds: Math.floor(totalTime / 1000),
    sessionTimeSeconds: sessionTime,
    totalTimeMinutes: Math.floor(totalTime / 60000),
    sessionTimeMinutes: Math.floor(sessionTime / 60),
  };
}
