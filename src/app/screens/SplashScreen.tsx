import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing } from '@app/utils/constants';

export const SplashScreen: React.FC = () => {
  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <View style={styles.logoInner}>
              <View style={styles.logoHead} />
              <View style={styles.logoArms}>
                <View style={styles.logoArmLeft} />
                <View style={styles.logoArmRight} />
              </View>
            </View>
          </View>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>Upsen</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Empowering Your Workplace{'\n'}Journey, One Tap at a Time!
        </Text>
      </View>

      {/* Bottom indicator */}
      <View style={styles.bottomIndicator} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    alignItems: 'center',
  },
  logoHead: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    marginBottom: -4,
  },
  logoArms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoArmLeft: {
    width: 28,
    height: 8,
    backgroundColor: Colors.white,
    borderRadius: 4,
    transform: [{ rotate: '-30deg' }],
    marginRight: -4,
  },
  logoArmRight: {
    width: 28,
    height: 8,
    backgroundColor: Colors.white,
    borderRadius: 4,
    transform: [{ rotate: '30deg' }],
    marginLeft: -4,
  },
  appName: {
    fontSize: Typography.size['4xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  tagline: {
    fontSize: Typography.size.base,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: 40,
    width: 120,
    height: 4,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
});
