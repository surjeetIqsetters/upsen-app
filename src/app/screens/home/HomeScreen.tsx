import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '@app/types';
import { useAuthStore, useAttendanceStore, useNotificationStore } from '@app/store';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@app/utils/constants';
import { Avatar, Card, Badge, Loading } from '@app/components';
import { formatDate, formatTime, getStatusColor } from '@app/utils/helpers';
import Toast from 'react-native-toast-message';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();
  const {
    todayAttendance,
    fetchToday,
    clockIn,
    clockOut,
    isClocking,
    isLoading,
  } = useAttendanceStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchToday(), fetchNotifications(true)]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleClockIn = async () => {
    try {
      await clockIn();
      Toast.show({
        type: 'success',
        text1: 'Clocked In!',
        text2: `You clocked in at ${formatTime(new Date().toISOString())}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to clock in. Please try again.',
      });
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut();
      Toast.show({
        type: 'success',
        text1: 'Clocked Out!',
        text2: `You clocked out at ${formatTime(new Date().toISOString())}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to clock out. Please try again.',
      });
    }
  };

  const isClockedIn = todayAttendance?.clockIn && !todayAttendance?.clockOut;
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={Colors.white} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Avatar
                source={user?.avatarUrl}
                name={user?.fullName || 'User'}
                size="sm"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Clock In/Out Card */}
        <Card style={styles.clockCard}>
          <View style={styles.clockHeader}>
            <View>
              <Text style={styles.clockLabel}>
                {isClockedIn ? 'Clock Out' : 'Clock In'}
              </Text>
              <Text style={styles.clockTime}>{currentTime}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.clockButton,
                isClockedIn ? styles.clockOutButton : styles.clockInButton,
              ]}
              onPress={isClockedIn ? handleClockOut : handleClockIn}
              disabled={isClocking}
            >
              {isClocking ? (
                <Loading size="small" color={Colors.white} />
              ) : (
                <Ionicons
                  name={isClockedIn ? 'log-out-outline' : 'log-in-outline'}
                  size={24}
                  color={Colors.white}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.clockInfo}>
            <View style={styles.clockInfoItem}>
              <Text style={styles.clockInfoLabel}>Clock In</Text>
              <Text style={styles.clockInfoValue}>
                {todayAttendance?.clockIn
                  ? formatTime(todayAttendance.clockIn)
                  : '--:--'}
              </Text>
            </View>
            <View style={styles.clockInfoDivider} />
            <View style={styles.clockInfoItem}>
              <Text style={styles.clockInfoLabel}>Clock Out</Text>
              <Text style={styles.clockInfoValue}>
                {todayAttendance?.clockOut
                  ? formatTime(todayAttendance.clockOut)
                  : '--:--'}
              </Text>
            </View>
            <View style={styles.clockInfoDivider} />
            <View style={styles.clockInfoItem}>
              <Text style={styles.clockInfoLabel}>Total</Text>
              <Text style={styles.clockInfoValue}>
                {todayAttendance?.workHours
                  ? `${Math.floor(todayAttendance.workHours)}h ${Math.round(
                      (todayAttendance.workHours % 1) * 60
                    )}m`
                  : '--:--'}
              </Text>
            </View>
          </View>
        </Card>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TouchableOpacity>
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <Card style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <View style={styles.notesIcon}>
                <Ionicons name="document-text" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.notesTitle}>Meeting with client</Text>
            </View>
            <Text style={styles.notesDescription}>
              Discuss project requirements and timeline for the new mobile app development.
            </Text>
            <View style={styles.notesFooter}>
              <Ionicons name="time-outline" size={14} color={Colors.gray400} />
              <Text style={styles.notesTime}>Today, 10:00 AM</Text>
            </View>
          </Card>
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Events')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <Card style={styles.eventCard}>
            <View style={styles.eventImagePlaceholder}>
              <Ionicons name="calendar" size={32} color={Colors.primary} />
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>Team Building Activity</Text>
              <Text style={styles.eventDescription}>
                Join us for a fun team building activity at the park.
              </Text>
              <View style={styles.eventMeta}>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.gray400} />
                  <Text style={styles.eventMetaText}>Mon, 20 May 2024</Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.gray400} />
                  <Text style={styles.eventMetaText}>09:00 AM - 05:00 PM</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Attendance Chart Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Attendance</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyAttendance')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <Card style={styles.attendanceCard}>
            <View style={styles.attendanceStats}>
              <View style={styles.attendanceStat}>
                <Text style={styles.attendanceStatValue}>20</Text>
                <Text style={styles.attendanceStatLabel}>On time</Text>
              </View>
              <View style={styles.attendanceStat}>
                <Text style={styles.attendanceStatValue}>2</Text>
                <Text style={styles.attendanceStatLabel}>Late</Text>
              </View>
              <View style={styles.attendanceStat}>
                <Text style={styles.attendanceStatValue}>0</Text>
                <Text style={styles.attendanceStatLabel}>Absence</Text>
              </View>
              <View style={styles.attendanceStat}>
                <Text style={styles.attendanceStatValue}>1</Text>
                <Text style={styles.attendanceStatLabel}>Leaves</Text>
              </View>
            </View>
            {/* Simple bar chart representation */}
            <View style={styles.chartContainer}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
                <View key={day} style={styles.chartBarContainer}>
                  <View
                    style={[
                      styles.chartBar,
                      { height: [80, 60, 90, 70, 85][index] },
                    ]}
                  />
                  <Text style={styles.chartLabel}>{day}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl + 20,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.size.base,
    color: Colors.white,
    opacity: 0.8,
  },
  userName: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.white,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconButton: {
    position: 'relative',
    padding: Spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: Typography.size.xs,
    color: Colors.white,
    fontWeight: Typography.weight.bold,
  },
  avatarButton: {
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 20,
  },
  clockCard: {
    backgroundColor: Colors.white,
    marginTop: Spacing.md,
  },
  clockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  clockLabel: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  clockTime: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  clockButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockInButton: {
    backgroundColor: Colors.success,
  },
  clockOutButton: {
    backgroundColor: Colors.error,
  },
  clockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  clockInfoItem: {
    alignItems: 'center',
  },
  clockInfoLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  clockInfoValue: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  clockInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  content: {
    padding: Spacing.base,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: Typography.size.base,
    color: Colors.primary,
    fontWeight: Typography.weight.medium,
  },
  notesCard: {
    backgroundColor: Colors.white,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  notesIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  notesTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  notesDescription: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  notesFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  notesTime: {
    fontSize: Typography.size.sm,
    color: Colors.gray400,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: Spacing.md,
  },
  eventImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  eventDescription: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  eventMeta: {
    gap: Spacing.xs,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  eventMetaText: {
    fontSize: Typography.size.sm,
    color: Colors.gray400,
  },
  attendanceCard: {
    backgroundColor: Colors.white,
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  attendanceStat: {
    alignItems: 'center',
  },
  attendanceStatValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  attendanceStatLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    paddingTop: Spacing.md,
  },
  chartBarContainer: {
    alignItems: 'center',
  },
  chartBar: {
    width: 24,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  chartLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
});
