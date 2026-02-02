import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Button } from '@app/components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const issueTypes = [
  { id: 'bug', label: 'Bug Report', icon: 'bug-outline' },
  { id: 'feature', label: 'Feature Request', icon: 'lightbulb-outline' },
  { id: 'account', label: 'Account Issue', icon: 'person-outline' },
  { id: 'other', label: 'Other', icon: 'help-circle-outline' },
];

export const ContactSupportScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedIssue, setSelectedIssue] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedIssue) {
      Alert.alert('Error', 'Please select an issue type');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setIsSubmitting(true);
    try {
      // API call to submit support ticket
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert(
        'Success',
        'Your support ticket has been submitted. We will get back to you soon.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Issue Type Selection */}
        <Text style={styles.sectionTitle}>What can we help you with?</Text>
        <View style={styles.issueTypesContainer}>
          {issueTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.issueTypeButton,
                selectedIssue === type.id && styles.selectedIssueType,
              ]}
              onPress={() => setSelectedIssue(type.id)}
            >
              <Ionicons
                name={type.icon as any}
                size={20}
                color={selectedIssue === type.id ? Colors.primary : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.issueTypeText,
                  selectedIssue === type.id && styles.selectedIssueTypeText,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subject Input */}
        <Text style={styles.sectionTitle}>Subject</Text>
        <TextInput
          style={styles.subjectInput}
          placeholder="Brief description of your issue"
          placeholderTextColor={Colors.gray400}
          value={subject}
          onChangeText={setSubject}
        />

        {/* Message Input */}
        <Text style={styles.sectionTitle}>Message</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Please describe your issue in detail..."
          placeholderTextColor={Colors.gray400}
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
        />

        {/* Contact Info */}
        <View style={styles.contactInfo}>
          <Ionicons name="mail-outline" size={20} color={Colors.primary} />
          <Text style={styles.contactText}>support@upsen.com</Text>
        </View>

        <View style={styles.contactInfo}>
          <Ionicons name="call-outline" size={20} color={Colors.primary} />
          <Text style={styles.contactText}>+1 (800) 123-4567</Text>
        </View>

        {/* Submit Button */}
        <Button
          title="Submit Ticket"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          style={styles.submitButton}
        />
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
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  issueTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  issueTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  selectedIssueType: {
    backgroundColor: Colors.primaryLighter,
    borderColor: Colors.primary,
  },
  issueTypeText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    fontWeight: Typography.weight.medium,
  },
  selectedIssueTypeText: {
    color: Colors.primary,
  },
  subjectInput: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  messageInput: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    minHeight: 150,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  contactText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.xl,
  },
});
