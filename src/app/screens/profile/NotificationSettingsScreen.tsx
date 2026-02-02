import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Header, Card } from '@app/components';
import { notificationApi } from '@app/services/api';
import { Colors, Typography, Spacing } from '@app/utils/constants';
import Toast from 'react-native-toast-message';

export const NotificationSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState({
    leaveRequests: true,
    taskAssignments: true,
    messages: true,
    eventReminders: true,
    clockInReminders: false,
    payslipNotifications: true,
    newsUpdates: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await notificationApi.getSettings();
      setSettings(data as any);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const toggleSetting = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    try {
      await notificationApi.updateSettings(newSettings);
      Toast.show({ type: 'success', text1: 'Settings Updated' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update settings.' });
      setSettings(settings);
    }
  };

  const notificationOptions = [
    { key: 'leaveRequests', label: 'Leave Requests', description: 'Get notified about leave request updates' },
    { key: 'taskAssignments', label: 'Task Assignments', description: 'Get notified when assigned to a task' },
    { key: 'messages', label: 'Messages', description: 'Get notified about new messages' },
    { key: 'eventReminders', label: 'Event Reminders', description: 'Get reminded about upcoming events' },
    { key: 'clockInReminders', label: 'Clock-in Reminders', description: 'Get reminded to clock in/out' },
    { key: 'payslipNotifications', label: 'Payslip Notifications', description: 'Get notified when payslip is available' },
    { key: 'newsUpdates', label: 'News Updates', description: 'Get notified about company news' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Notifications" />
      <ScrollView style={styles.content}>
        <Card style={styles.settingsCard}>
          {notificationOptions.map((option, index) => (
            <View key={option.key} style={[styles.settingItem, index < notificationOptions.length - 1 && styles.settingItemBorder]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{option.label}</Text>
                <Text style={styles.settingDescription}>{option.description}</Text>
              </View>
              <Switch
                value={settings[option.key as keyof typeof settings]}
                onValueChange={() => toggleSetting(option.key as keyof typeof settings)}
                trackColor={{ false: Colors.gray300, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          ))}
        </Card>
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
  settingsCard: {
    padding: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.textPrimary,
  },
  settingDescription: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
