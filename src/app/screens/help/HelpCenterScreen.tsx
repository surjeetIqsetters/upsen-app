import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  articles: number;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqCategories: FAQCategory[] = [
  { id: '1', title: 'Getting Started', icon: 'rocket-outline', articles: 8 },
  { id: '2', title: 'Account & Security', icon: 'shield-checkmark-outline', articles: 12 },
  { id: '3', title: 'Attendance', icon: 'time-outline', articles: 6 },
  { id: '4', title: 'Leave Management', icon: 'calendar-outline', articles: 10 },
  { id: '5', title: 'Tasks & Projects', icon: 'checkbox-outline', articles: 7 },
  { id: '6', title: 'Payments & Payslips', icon: 'card-outline', articles: 9 },
];

const popularFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I reset my password?',
    answer: 'Go to Settings > Account > Change Password. Enter your current password and set a new one.',
  },
  {
    id: '2',
    question: 'How do I apply for leave?',
    answer: 'Navigate to the Leave section, tap "Apply for Leave", select your dates, and submit your request.',
  },
  {
    id: '3',
    question: 'How do I check my attendance?',
    answer: 'Go to Home > Attendance or My Attendance to view your daily, weekly, or monthly attendance records.',
  },
];

export const HelpCenterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor={Colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Contact Support Card */}
        <TouchableOpacity
          style={styles.supportCard}
          onPress={() => navigation.navigate('ContactSupport')}
        >
          <View style={styles.supportIconContainer}>
            <Ionicons name="headset-outline" size={28} color={Colors.primary} />
          </View>
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>Contact Support</Text>
            <Text style={styles.supportSubtitle}>Get help from our team</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
        </TouchableOpacity>

        {/* FAQ Categories */}
        <Text style={styles.sectionTitle}>Browse by Topic</Text>
        <View style={styles.categoriesGrid}>
          {faqCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => navigation.navigate('FAQCategory', { categoryId: category.id })}
            >
              <Ionicons name={category.icon as any} size={24} color={Colors.primary} />
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryArticles}>{category.articles} articles</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular FAQs */}
        <Text style={styles.sectionTitle}>Popular Questions</Text>
        <View style={styles.faqList}>
          {popularFAQs.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleFAQ(faq.id)}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={Colors.gray400}
                />
              </TouchableOpacity>
              {expandedFAQ === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLighter,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  supportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  supportTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  supportSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  categoryArticles: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  faqList: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.medium,
    marginRight: Spacing.sm,
  },
  faqAnswer: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    lineHeight: 20,
  },
});
