import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@app/types';
import { useAuthStore } from '@app/store';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Card, Avatar } from '@app/components';
import Toast from 'react-native-toast-message';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, signOut } = useAuthStore();

  const menuItems = [
    { icon: 'person-outline', label: 'Personal Info', screen: 'PersonalInfo' },
    { icon: 'card-outline', label: 'Payment Methods', screen: 'PaymentMethods' },
    { icon: 'notifications-outline', label: 'Notifications', screen: 'NotificationSettings' },
    { icon: 'briefcase-outline', label: 'Manage Work', screen: 'ManageWork' },
    { icon: 'business-outline', label: 'Company Profile', screen: 'CompanyProfile' },
    { icon: 'receipt-outline', label: 'Payslip', screen: 'Payslip' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      Toast.show({ type: 'success', text1: 'Signed Out', text2: 'You have been signed out successfully.' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to sign out.' });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Avatar source={user?.avatarUrl} name={user?.fullName || 'User'} size="2xl" />
        <Text style={styles.name}>{user?.fullName || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.position}>{user?.position || 'Employee'}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('PersonalInfo')}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </Card>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.screen} style={styles.menuItem} onPress={() => navigation.navigate(item.screen as any)}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={22} color={Colors.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.base,
  },
  profileCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  name: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  email: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  position: {
    fontSize: Typography.size.sm,
    color: Colors.gray400,
    marginTop: Spacing.xs,
  },
  editButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryLighter,
    borderRadius: BorderRadius.full,
  },
  editButtonText: {
    fontSize: Typography.size.base,
    color: Colors.primary,
    fontWeight: Typography.weight.medium,
  },
  menu: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  signOutText: {
    fontSize: Typography.size.base,
    color: Colors.error,
    fontWeight: Typography.weight.medium,
    marginLeft: Spacing.sm,
  },
  version: {
    textAlign: 'center',
    fontSize: Typography.size.sm,
    color: Colors.gray400,
  },
});
