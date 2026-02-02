import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { getStatusColor, getStatusBgColor } from '@app/utils/helpers';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'status';
  status?: string;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  status,
  size = 'medium',
  style,
}) => {
  const getVariantStyles = () => {
    if (variant === 'status' && status) {
      return {
        backgroundColor: getStatusBgColor(status),
        borderColor: getStatusColor(status),
      };
    }

    const variantStyles: Record<string, ViewStyle> = {
      default: { backgroundColor: Colors.gray100 },
      primary: { backgroundColor: Colors.primaryLighter },
      success: { backgroundColor: Colors.successLight },
      warning: { backgroundColor: Colors.warningLight },
      error: { backgroundColor: Colors.errorLight },
      info: { backgroundColor: Colors.infoLight },
    };

    return variantStyles[variant] || variantStyles.default;
  };

  const getTextColor = () => {
    if (variant === 'status' && status) {
      return getStatusColor(status);
    }

    const textColors: Record<string, string> = {
      default: Colors.gray600,
      primary: Colors.primary,
      success: Colors.success,
      warning: Colors.warning,
      error: Colors.error,
      info: Colors.info,
    };

    return textColors[variant] || textColors.default;
  };

  return (
    <View style={[styles.base, getVariantStyles(), styles[size], style]}>
      <Text style={[styles.text, { color: getTextColor() }, styles[`${size}Text` as keyof typeof styles]]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: Typography.weight.medium,
  },
  small: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  smallText: {
    fontSize: Typography.size.xs,
  },
  mediumText: {
    fontSize: Typography.size.sm,
  },
});
