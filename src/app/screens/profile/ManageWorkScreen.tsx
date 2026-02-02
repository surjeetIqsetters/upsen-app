import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, Card, Button } from '@app/components';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import Toast from 'react-native-toast-message';

export const ManageWorkScreen: React.FC = () => {
  const [workSchedule, setWorkSchedule] = useState('9:00 AM - 6:00 PM');
  const [workLocation, setWorkLocation] = useState('Office');
  const [remoteDays, setRemoteDays] = useState(2);

  const handleSave = () => {
    Toast.show({ type: 'success', text1: 'Settings Saved!', text2: 'Your work preferences have been updated.' });
  };

  return (
    <View style={styles.container}>
      <Header title="Manage Work" />
      <ScrollView style={styles.content}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Work Schedule</Text>
          <TouchableOpacity style={styles.option}>
            <View>
              <Text style={styles.optionLabel}>Working Hours</Text>
              <Text style={styles.optionValue}>{workSchedule}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
          </TouchableOpacity>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Work Location</Text>
          <TouchableOpacity style={styles.option}>
            <View>
              <Text style={styles.optionLabel}>Primary Location</Text>
              <Text style={styles.optionValue}>{workLocation}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
          </TouchableOpacity>

          <View style={styles.remoteSection}>
            <Text style={styles.optionLabel}>Remote Days per Week</Text>
            <View style={styles.remoteDaysSelector}>
              {[0, 1, 2, 3, 4, 5].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayButton, remoteDays === day && styles.dayButtonActive]}
                  onPress={() => setRemoteDays(day)}
                >
                  <Text style={[styles.dayButtonText, remoteDays === day && styles.dayButtonTextActive]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Time Off</Text>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Annual Leave</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Sick Leave</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Casual Leave</Text>
            </View>
          </View>
        </Card>

        <Button title="Save Changes" onPress={handleSave} style={styles.saveButton} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    padding: Spacing.base,
  },
  section: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionLabel: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  optionValue: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  remoteSection: {
    marginTop: Spacing.md,
  },
  remoteDaysSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: Colors.primary,
  },
  dayButtonText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  dayButtonTextActive: {
    color: Colors.white,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
