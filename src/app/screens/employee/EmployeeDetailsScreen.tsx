import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@app/types';
import { useEmployeeStore } from '@app/store';
import { Colors, Typography, Spacing } from '@app/utils/constants';
import { Header, Card, Avatar, Loading } from '@app/components';

export const EmployeeDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EmployeeDetails'>>();
  const { employeeId } = route.params;
  const { selectedEmployee, fetchEmployeeDetails, isLoading } = useEmployeeStore();

  useEffect(() => {
    fetchEmployeeDetails(employeeId);
  }, [employeeId]);

  if (isLoading || !selectedEmployee) {
    return (
      <View style={styles.container}>
        <Header title="Employee Details" />
        <Loading fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Employee Details" />
      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Avatar source={selectedEmployee.avatarUrl} name={selectedEmployee.fullName} size="2xl" />
          <Text style={styles.name}>{selectedEmployee.fullName}</Text>
          <Text style={styles.position}>{selectedEmployee.position || 'Employee'}</Text>
          <Text style={styles.department}>{selectedEmployee.department?.name || 'No Department'}</Text>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('PhoneCall', { userId: employeeId })}>
              <Ionicons name="call" size={24} color={Colors.white} />
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Chat', { conversationId: employeeId })}>
              <Ionicons name="chatbubble" size={24} color={Colors.white} />
              <Text style={styles.actionText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('LeaveRequest')}>
              <Ionicons name="calendar" size={24} color={Colors.white} />
              <Text style={styles.actionText}>Leave</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Information */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Employee ID</Text>
            <Text style={styles.infoValue}>{selectedEmployee.employeeId || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{selectedEmployee.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{selectedEmployee.phoneNumber || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Joining</Text>
            <Text style={styles.infoValue}>{selectedEmployee.dateOfJoining || 'N/A'}</Text>
          </View>
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
  profileCard: {
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  name: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  position: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  department: {
    fontSize: Typography.size.sm,
    color: Colors.gray400,
    marginTop: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  actionText: {
    color: Colors.white,
    fontSize: Typography.size.sm,
    marginTop: Spacing.xs,
    fontWeight: Typography.weight.medium,
  },
  infoCard: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.medium,
  },
});
