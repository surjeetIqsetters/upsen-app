import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@app/types';

// Screens
import { SignInScreen } from '@app/screens/auth/SignInScreen';
import { SignUpScreen } from '@app/screens/auth/SignUpScreen';
import { VerificationCodeScreen } from '@app/screens/auth/VerificationCodeScreen';
import { FaceIdSetupScreen } from '@app/screens/auth/FaceIdSetupScreen';
import { ForgotPasswordScreen } from '@app/screens/auth/ForgotPasswordScreen';
import { NewPasswordScreen } from '@app/screens/auth/NewPasswordScreen';
import { PasswordSuccessScreen } from '@app/screens/auth/PasswordSuccessScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="VerificationCode" component={VerificationCodeScreen} />
      <Stack.Screen name="FaceIdSetup" component={FaceIdSetupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
      <Stack.Screen name="PasswordSuccess" component={PasswordSuccessScreen} />
    </Stack.Navigator>
  );
};
