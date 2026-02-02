import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { useAuthStore, useThemeStore } from '@app/store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  icon: string;
  label: string;
  value?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
}

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { signOut } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Personal Information',
          onPress: () => navigation.navigate('PersonalInfo'),
        },
        {
          icon: 'lock-closed-outline',
          label: 'Change Password',
          onPress: () => navigation.navigate('ChangePassword'),
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Two-Factor Authentication',
          onPress: () => navigation.navigate('TwoFactorAuth'),
        },
        {
          icon: 'time-outline',
          label: 'Activity Log',
          onPress: () => navigation.navigate('ActivityLog'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          hasSwitch: true,
          switchValue: isDark,
          onSwitchChange: toggleTheme,
        },
        {
          icon: 'language-outline',
          label: 'Language',
          value: 'English',
          onPress: () => navigation.navigate('LanguageSettings'),
        },
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          onPress: () => navigation.navigate('NotificationSettings'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help Center',
          onPress: () => navigation.navigate('HelpCenter'),
        },
        {
          icon: 'chatbubble-outline',
          label: 'Contact Support',
          onPress: () => navigation.navigate('ContactSupport'),
        },
        {
          icon: 'document-text-outline',
          label: 'Terms of Service',
          onPress: () => navigation.navigate('TermsOfService'),
        },
        {
          icon: 'shield-outline',
          label: 'Privacy Policy',
          onPress: () => navigation.navigate('PrivacyPolicy'),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle-outline',
          label: 'About Upsen',
          value: 'v1.0.0',
        },
      ],
    },
  ];

  const renderSettingsItem = (item: SettingsItem, index: number, isLast: boolean) => (
    <TouchableOpacity
      key={item.label}
      style={[
        styles.settingsItem,
        !isLast && styles.settingsItemBorder,
        item.danger && styles.dangerItem,
      ]}
      onPress={item.onPress}
      disabled={!item.onPress && !item.hasSwitch}
      activeOpacity={item.onPress ? 0.7 : 1}
    >
      <View style={styles.itemLeft}>
        <Ionicons
          name={item.icon as any}
          size={22}
          color={item.danger ? Colors.error : Colors.primary}
        />
        <Text style={[styles.itemLabel, item.danger && styles.dangerText]}>
          {item.label}
        </Text>
      </View>

      <View style={styles.itemRight}>
        {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
        {item.hasSwitch ? (
          <Switch
            value={item.switchValue}
            onValueChange={item.onSwitchChange}
            trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
            thumbColor={item.switchValue ? Colors.primary : Colors.gray400}
          />
        ) : item.onPress ? (
          <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, index) =>
                renderSettingsItem(item, index, index === section.items.length - 1)
              )}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Upsen HR v1.0.0</Text>
          <Text style={styles.footerSubtext}>© 2024 Upsen Inc. All rights reserved.</Text>
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
  },
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  sectionContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dangerItem: {
    backgroundColor: Colors.errorLight,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  dangerText: {
    color: Colors.error,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    marginRight: Spacing.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.lg,
  },
  logoutText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.error,
    marginLeft: Spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  footerSubtext: {
    fontSize: Typography.size.xs,
    color: Colors.gray400,
  },
});
