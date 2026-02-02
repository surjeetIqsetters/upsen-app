import 'react-native-gesture-handler';
import React, { useEffect, useCallback, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { Ionicons } from '@expo/vector-icons';
import { RootNavigator } from '@app/navigation';
import { Colors, StorageKeys } from '@app/utils/constants';
import { useAuthStore, useThemeStore, useOfflineStore } from '@app/store';
import {
  registerForPushNotifications,
  savePushToken,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  loadLanguagePreference,
} from '@app/services';
import { useAppStateChange } from '@app/hooks';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Toast config
const toastConfig = {
  success: (props: any) => (
    <Toast
      {...props}
      style={{ borderLeftColor: Colors.success }}
      text1Style={{ fontSize: 16, fontWeight: '600' }}
      text2Style={{ fontSize: 14 }}
    />
  ),
  error: (props: any) => (
    <Toast
      {...props}
      style={{ borderLeftColor: Colors.error }}
      text1Style={{ fontSize: 16, fontWeight: '600' }}
      text2Style={{ fontSize: 14 }}
    />
  ),
  info: (props: any) => (
    <Toast
      {...props}
      style={{ borderLeftColor: Colors.info }}
      text1Style={{ fontSize: 16, fontWeight: '600' }}
      text2Style={{ fontSize: 14 }}
    />
  ),
};

// Notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function AppContent() {
  const { isAuthenticated, user, initialize: initializeAuth } = useAuthStore();
  const { isDark, colors } = useThemeStore();
  const { initializeNetwork, processQueue } = useOfflineStore();
  const [appIsReady, setAppIsReady] = useState(false);

  // Initialize app
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          ...Ionicons.font,
        });

        // Initialize auth
        await initializeAuth();

        // Initialize language preference
        await loadLanguagePreference();

        // Initialize network monitoring
        const unsubscribeNetwork = initializeNetwork();
        
        // Return cleanup for network if needed, but in this specific block structure 
        // we can't easily return the unsubscribe inside the async function.
        // Network init is usually global and persistent.
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // Register push notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      registerForPushNotifications().then((token) => {
        if (token) {
          savePushToken(user.id, token);
        }
      });
    }
  }, [isAuthenticated, user]);

  // Handle notification listeners
  useEffect(() => {
    // Notification received while app is foregrounded
    const notificationListener = addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // User tapped notification
    const responseListener = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);
      // Handle navigation based on notification type
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // Handle app coming to foreground
  useAppStateChange(
    useCallback(() => {
      // App became active - process offline queue
      processQueue();
    }, [processQueue])
  );

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      <RootNavigator />
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

export default function App() {
  return <AppContent />;
}
