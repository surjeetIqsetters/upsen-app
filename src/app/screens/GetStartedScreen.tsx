import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing } from '@app/utils/constants';
import { Button } from '@app/components';

export const GetStartedScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      {/* Image placeholder */}
      <View style={styles.imagePlaceholder} />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Discover the Power of Insights</Text>
        <Text style={styles.description}>
          Gain valuable insights into your work patterns, productivity trends, and achievements.
        </Text>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Button
            title="Sign In"
            variant="outline"
            onPress={() => navigation.navigate('Auth', { screen: 'SignIn' })}
            style={styles.signInButton}
          />
          <Button
            title="Sign Up"
            onPress={() => navigation.navigate('Auth', { screen: 'SignUp' })}
            style={styles.signUpButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  imagePlaceholder: {
    width: '100%',
    height: '55%',
    backgroundColor: Colors.gray100,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    lineHeight: 32,
  },
  description: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  signInButton: {
    flex: 1,
  },
  signUpButton: {
    flex: 1,
  },
});
