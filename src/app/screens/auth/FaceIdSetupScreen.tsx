import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { AuthStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Button } from '@app/components';
import Toast from 'react-native-toast-message';

export const FaceIdSetupScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSetupFaceId = async () => {
    try {
      setIsSettingUp(true);
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware) {
        Toast.show({
          type: 'error',
          text1: 'Not Supported',
          text2: 'Your device does not support biometric authentication.',
        });
        return;
      }

      if (!isEnrolled) {
        Toast.show({
          type: 'error',
          text1: 'Not Enrolled',
          text2: 'Please set up biometric authentication in your device settings.',
        });
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Set up Face ID',
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Face ID has been set up successfully.',
        });
        // Navigate to main app
        navigation.getParent()?.navigate('Main');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to set up Face ID. Please try again.',
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSkip = () => {
    navigation.getParent()?.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Face ID Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="scan-outline" size={80} color={Colors.primary} />
        </View>

        {/* Title & Description */}
        <Text style={styles.title}>Set Up Face ID</Text>
        <Text style={styles.subtitle}>
          Use Face ID to sign in quickly and securely without entering your password.
        </Text>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark-outline" size={24} color={Colors.success} />
            <Text style={styles.featureText}>Enhanced Security</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="flash-outline" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>Quick Access</Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Button
          title="Set Up Face ID"
          onPress={handleSetupFaceId}
          isLoading={isSettingUp}
          style={styles.setupButton}
        />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.base,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  features: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  feature: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  buttons: {
    marginTop: 'auto',
    paddingBottom: Spacing.xl,
  },
  setupButton: {
    marginBottom: Spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  skipText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
});
