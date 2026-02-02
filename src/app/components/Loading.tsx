import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing } from '@app/utils/constants';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  message?: string; // Alias for compatibility
  fullScreen?: boolean;
  fullscreen?: boolean; // Alias for compatibility
  style?: ViewStyle;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = Colors.primary,
  text,
  message,
  fullScreen = false,
  fullscreen = false,
  style,
}) => {
  const isFullScreen = fullScreen || fullscreen;
  const displayText = text || message;
  return (
    <View style={[styles.container, isFullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size={size} color={color} />
      {displayText && <Text style={styles.text}>{displayText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  text: {
    marginTop: Spacing.md,
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
});
