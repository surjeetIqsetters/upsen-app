import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@app/types';
import { useEmployeeStore } from '@app/store';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Card, Avatar, Loading, EmptyState } from '@app/components';

export const EmployeeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { employees, departments, fetchEmployees, fetchDepartments, isLoading, hasMore } = useEmployeeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees(true);
    fetchDepartments();
  }, []);

  const renderEmployee = ({ item }: { item: any }) => (
    <Card style={styles.employeeCard} onPress={() => navigation.navigate('EmployeeDetails', { employeeId: item.id })}>
      <Avatar source={item.avatarUrl} name={item.fullName} size="md" />
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.fullName}</Text>
        <Text style={styles.employeePosition}>{item.position || 'Employee'}</Text>
        <Text style={styles.employeeDepartment}>{item.department?.name || 'No Department'}</Text>
      </View>
      <View style={styles.employeeActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('PhoneCall', { userId: item.id })}>
          <Ionicons name="call" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Chat', { conversationId: item.id })}>
          <Ionicons name="chatbubble" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search employees..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Department Filter */}
      <View style={styles.departmentFilter}>
        <TouchableOpacity
          style={[styles.departmentChip, !selectedDepartment && styles.departmentChipActive]}
          onPress={() => setSelectedDepartment(null)}
        >
          <Text style={[styles.departmentChipText, !selectedDepartment && styles.departmentChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {departments.map((dept) => (
          <TouchableOpacity
            key={dept.id}
            style={[styles.departmentChip, selectedDepartment === dept.id && styles.departmentChipActive]}
            onPress={() => setSelectedDepartment(dept.id)}
          >
            <Text style={[styles.departmentChipText, selectedDepartment === dept.id && styles.departmentChipTextActive]}>
              {dept.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Employee List */}
      <FlatList
        data={employees}
        renderItem={renderEmployee}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onEndReached={() => hasMore && fetchEmployees()}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isLoading ? (
            <Loading fullscreen={false} />
          ) : (
            <EmptyState
              title="No employees found"
              message="Try adjusting your search or filters"
              icon="people-outline"
            />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: Spacing.base,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.size.base,
  },
  departmentFilter: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  departmentChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
  },
  departmentChipActive: {
    backgroundColor: Colors.primary,
  },
  departmentChipText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  departmentChipTextActive: {
    color: Colors.white,
    fontWeight: Typography.weight.medium,
  },
  list: {
    padding: Spacing.base,
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  employeeInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  employeeName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  employeePosition: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  employeeDepartment: {
    fontSize: Typography.size.xs,
    color: Colors.gray400,
    marginTop: 2,
  },
  employeeActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
