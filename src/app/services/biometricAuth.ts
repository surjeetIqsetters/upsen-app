import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  warning?: string;
}

export interface BiometricStatus {
  isAvailable: boolean;
  isEnrolled: boolean;
  biometricTypes: LocalAuthentication.AuthenticationType[];
  hasHardware: boolean;
}

/**
 * Check if biometric authentication is available on the device
 */
export const checkBiometricAvailability = async (): Promise<BiometricStatus> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    return {
      isAvailable: hasHardware && isEnrolled,
      isEnrolled,
      biometricTypes,
      hasHardware,
    };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return {
      isAvailable: false,
      isEnrolled: false,
      biometricTypes: [],
      hasHardware: false,
    };
  }
};

/**
 * Authenticate user with biometrics
 */
export const authenticateWithBiometrics = async (
  promptMessage: string = 'Authenticate to access Upsen',
  fallbackLabel: string = 'Use passcode'
): Promise<BiometricAuthResult> => {
  try {
    const status = await checkBiometricAvailability();
    
    if (!status.hasHardware) {
      return { success: false, error: 'Biometric hardware not available' };
    }
    
    if (!status.isEnrolled) {
      return { success: false, error: 'No biometric credentials enrolled' };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      return { success: true };
    } else if (result.error === 'user_cancel') {
      return { success: false, error: 'Authentication cancelled' };
    } else {
      return { success: false, error: result.error || 'Authentication failed' };
    }
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Authentication error' 
    };
  }
};

/**
 * Check if biometric login is enabled
 */
export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking biometric enabled status:', error);
    return false;
  }
};

/**
 * Enable biometric authentication
 */
export const enableBiometricAuth = async (credentials: {
  email: string;
  password: string;
}): Promise<boolean> => {
  try {
    // First authenticate with biometrics to verify
    const authResult = await authenticateWithBiometrics(
      'Authenticate to enable biometric login'
    );
    
    if (!authResult.success) {
      return false;
    }

    // Store credentials securely
    await SecureStore.setItemAsync(
      BIOMETRIC_CREDENTIALS_KEY,
      JSON.stringify(credentials)
    );
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
    
    return true;
  } catch (error) {
    console.error('Error enabling biometric auth:', error);
    return false;
  }
};

/**
 * Disable biometric authentication
 */
export const disableBiometricAuth = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
  } catch (error) {
    console.error('Error disabling biometric auth:', error);
  }
};

/**
 * Get stored credentials for biometric login
 */
export const getBiometricCredentials = async (): Promise<{
  email: string;
  password: string;
} | null> => {
  try {
    const enabled = await isBiometricEnabled();
    if (!enabled) return null;

    const credentials = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    if (!credentials) return null;

    return JSON.parse(credentials);
  } catch (error) {
    console.error('Error getting biometric credentials:', error);
    return null;
  }
};

/**
 * Perform biometric login
 */
export const biometricLogin = async (): Promise<{
  success: boolean;
  credentials?: { email: string; password: string };
  error?: string;
}> => {
  try {
    const enabled = await isBiometricEnabled();
    if (!enabled) {
      return { success: false, error: 'Biometric login not enabled' };
    }

    const authResult = await authenticateWithBiometrics('Login with biometrics');
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const credentials = await getBiometricCredentials();
    if (!credentials) {
      return { success: false, error: 'No credentials stored' };
    }

    return { success: true, credentials };
  } catch (error) {
    console.error('Biometric login error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Login failed' 
    };
  }
};

/**
 * Get biometric type name for display
 */
export const getBiometricTypeName = (types: LocalAuthentication.AuthenticationType[]): string => {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Touch ID / Fingerprint';
  } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris Recognition';
  }
  return 'Biometric';
};
