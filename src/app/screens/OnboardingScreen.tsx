import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Button } from '@app/components';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    id: '1',
    title: 'Connect, Collaborate, Create',
    description: 'Foster collaboration effortlessly through our integrated chat feature, connecting you with your team in real-time.',
    image: null,
  },
  {
    id: '2',
    title: 'Goodbye paperwork. Hello hassle-free leave requests',
    description: 'Submit, track, and manage your time off directly from the app. It\'s like having your own leave genie.',
    image: null,
  },
  {
    id: '3',
    title: 'Rest assured, your privacy is our priority',
    description: 'Your data is protected like the crown jewels. We\'re GDPR compliant and committed to keeping your information safe.',
    image: null,
  },
  {
    id: '4',
    title: 'Discover the Power of Insights',
    description: 'Gain valuable insights into your work patterns, productivity trends, and achievements.',
    image: null,
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollToIndex(currentIndex + 1);
    } else {
      onComplete();
      navigation.navigate('GetStarted');
    }
  };

  const handleSkip = () => {
    onComplete();
    navigation.navigate('GetStarted');
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      {item.image && <Image source={item.image} style={styles.image} resizeMode="cover" />}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToIndex(index)}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  skipButton: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.base,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  slide: {
    width,
    flex: 1,
  },
  image: {
    width: '100%',
    height: '55%',
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
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray300,
    marginHorizontal: Spacing.xs,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  buttons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  signInButton: {
    flex: 1,
  },
  signUpButton: {
    flex: 1,
  },
});
