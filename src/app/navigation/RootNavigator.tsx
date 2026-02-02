import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@app/store';
import { Loading } from '@app/components';
import { Colors } from '@app/utils/constants';

// Navigators
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

// Screens
import { SplashScreen } from '@app/screens/SplashScreen';
import { OnboardingScreen } from '@app/screens/OnboardingScreen';
import { GetStartedScreen } from '@app/screens/GetStartedScreen';

// Types
import { RootStackParamList } from '@app/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  // Show splash screen for 2 seconds
  useEffect(() => {
    if (isInitialized) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  if (!isInitialized || showSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={Colors.white} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!hasSeenOnboarding ? (
          <>
            <Stack.Screen name="Onboarding">
              {(props) => (
                <OnboardingScreen
                  {...props}
                  onComplete={() => setHasSeenOnboarding(true)}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="GetStarted" component={GetStartedScreen} />
          </>
        ) : null}
        
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
