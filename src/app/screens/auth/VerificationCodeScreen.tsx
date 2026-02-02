import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '@app/types';
import { useAuthStore } from '@app/store';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Button } from '@app/components';
import Toast from 'react-native-toast-message';

export const VerificationCodeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'VerificationCode'>>();
  const { phone, countryCode, email } = route.params;
  const { verifyOTP, resendOTP, isLoading } = useAuthStore();
  
  const [code, setCode] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((c) => c !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (fullCode: string) => {
    try {
      await verifyOTP(phone, fullCode);
      Toast.show({
        type: 'success',
        text1: 'Verified!',
        text2: 'Your phone number has been verified.',
      });
      navigation.navigate('FaceIdSetup');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: 'Invalid code. Please try again.',
      });
      setCode(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP(phone);
      setTimer(60);
      Toast.show({
        type: 'success',
        text1: 'Code Resent',
        text2: 'A new verification code has been sent.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to resend code. Please try again.',
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Verification Code</Text>
        <Text style={styles.subtitle}>
          Please enter the 4-digit code sent to{'\n'}
          <Text style={styles.phoneText}>{countryCode} {phone.replace(countryCode, '')}</Text>
        </Text>
      </View>

      {/* Code Input */}
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.codeInput}
            value={digit}
            onChangeText={(value) => handleCodeChange(index, value)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {/* Resend */}
      <View style={styles.resendContainer}>
        {timer > 0 ? (
          <Text style={styles.timerText}>Resend code in {timer}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend} disabled={isLoading}>
            <Text style={styles.resendText}>Resend Code</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Verify Button */}
      <Button
        title="Verify"
        onPress={() => handleVerify(code.join(''))}
        isLoading={isLoading}
        disabled={code.some((c) => c === '') || isLoading}
        style={styles.verifyButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.base,
  },
  backButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.xs,
    alignSelf: 'flex-start',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  phoneText: {
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  codeInput: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  timerText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  resendText: {
    fontSize: Typography.size.base,
    color: Colors.primary,
    fontWeight: Typography.weight.semibold,
  },
  verifyButton: {
    marginTop: 'auto',
    marginBottom: Spacing.xl,
  },
});
