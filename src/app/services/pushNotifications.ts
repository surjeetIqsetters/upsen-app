import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushTokenData {
  token: string;
  platform: string;
}

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Register for push notifications
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    // Check if it's a physical device
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permissions not granted');
      return null;
    }

    // Get push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PROJECT_ID,
    });

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90E2',
      });
    }

    return tokenData.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Save push token to Supabase
 */
export const savePushToken = async (userId: string, token: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_push_tokens')
      .upsert({
        user_id: userId,
        push_token: token,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving push token:', error);
    throw error;
  }
};

/**
 * Remove push token from Supabase
 */
export const removePushToken = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_push_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing push token:', error);
    throw error;
  }
};

/**
 * Schedule a local notification
 */
export const scheduleLocalNotification = async (
  notification: NotificationData,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> => {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: 'default',
      },
      trigger: trigger || null,
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};

/**
 * Schedule a reminder notification
 */
export const scheduleReminder = async (
  title: string,
  body: string,
  date: Date,
  data?: Record<string, any>
): Promise<string> => {
  return scheduleLocalNotification(
    { title, body, data },
    { date }
  );
};

/**
 * Cancel a scheduled notification
 */
export const cancelNotification = async (identifier: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Set badge count
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
};

/**
 * Clear badge count
 */
export const clearBadgeCount = async (): Promise<void> => {
  await setBadgeCount(0);
};

/**
 * Get badge count
 */
export const getBadgeCount = async (): Promise<number> => {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
};

/**
 * Add notification received listener
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Add notification response listener (when user taps notification)
 */
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Remove notification listener
 */
export const removeNotificationListener = (subscription: Notifications.Subscription): void => {
  Notifications.removeNotificationSubscription(subscription);
};

/**
 * Present a local notification immediately
 */
export const presentLocalNotification = async (
  notification: NotificationData
): Promise<void> => {
  try {
    await Notifications.presentNotificationAsync({
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      sound: 'default',
    });
  } catch (error) {
    console.error('Error presenting notification:', error);
  }
};

// Notification types for the app
export enum NotificationType {
  LEAVE_APPROVED = 'leave_approved',
  LEAVE_REJECTED = 'leave_rejected',
  LEAVE_REQUEST = 'leave_request',
  TASK_ASSIGNED = 'task_assigned',
  TASK_DUE = 'task_due',
  TASK_COMPLETED = 'task_completed',
  ATTENDANCE_REMINDER = 'attendance_reminder',
  CHECK_IN_CONFIRMED = 'check_in_confirmed',
  CHECK_OUT_CONFIRMED = 'check_out_confirmed',
  ANNOUNCEMENT = 'announcement',
  BIRTHDAY = 'birthday',
  WORK_ANNIVERSARY = 'work_anniversary',
}

// Predefined notification templates
export const notificationTemplates: Record<NotificationType, (data?: any) => NotificationData> = {
  [NotificationType.LEAVE_APPROVED]: (data) => ({
    title: 'Leave Approved',
    body: `Your ${data?.leaveType || 'leave'} request has been approved!`,
    data: { type: NotificationType.LEAVE_APPROVED, ...data },
  }),
  [NotificationType.LEAVE_REJECTED]: (data) => ({
    title: 'Leave Rejected',
    body: `Your ${data?.leaveType || 'leave'} request was not approved.`,
    data: { type: NotificationType.LEAVE_REJECTED, ...data },
  }),
  [NotificationType.LEAVE_REQUEST]: (data) => ({
    title: 'New Leave Request',
    body: `${data?.employeeName || 'Someone'} requested ${data?.leaveType || 'leave'}`,
    data: { type: NotificationType.LEAVE_REQUEST, ...data },
  }),
  [NotificationType.TASK_ASSIGNED]: (data) => ({
    title: 'New Task Assigned',
    body: `You've been assigned: ${data?.taskTitle || 'a new task'}`,
    data: { type: NotificationType.TASK_ASSIGNED, ...data },
  }),
  [NotificationType.TASK_DUE]: (data) => ({
    title: 'Task Due Soon',
    body: `"${data?.taskTitle || 'Your task'}" is due ${data?.dueTime || 'soon'}`,
    data: { type: NotificationType.TASK_DUE, ...data },
  }),
  [NotificationType.TASK_COMPLETED]: (data) => ({
    title: 'Task Completed',
    body: `${data?.employeeName || 'Someone'} completed "${data?.taskTitle || 'a task'}"`,
    data: { type: NotificationType.TASK_COMPLETED, ...data },
  }),
  [NotificationType.ATTENDANCE_REMINDER]: (data) => ({
    title: 'Attendance Reminder',
    body: `Don't forget to check in! Your shift starts at ${data?.shiftTime || '9:00 AM'}`,
    data: { type: NotificationType.ATTENDANCE_REMINDER, ...data },
  }),
  [NotificationType.CHECK_IN_CONFIRMED]: (data) => ({
    title: 'Checked In',
    body: `You've checked in at ${data?.time || new Date().toLocaleTimeString()}`,
    data: { type: NotificationType.CHECK_IN_CONFIRMED, ...data },
  }),
  [NotificationType.CHECK_OUT_CONFIRMED]: (data) => ({
    title: 'Checked Out',
    body: `You've checked out at ${data?.time || new Date().toLocaleTimeString()}`,
    data: { type: NotificationType.CHECK_OUT_CONFIRMED, ...data },
  }),
  [NotificationType.ANNOUNCEMENT]: (data) => ({
    title: data?.title || 'New Announcement',
    body: data?.message || 'Check out the latest company update!',
    data: { type: NotificationType.ANNOUNCEMENT, ...data },
  }),
  [NotificationType.BIRTHDAY]: (data) => ({
    title: '🎉 Birthday Alert!',
    body: `Wish ${data?.employeeName || 'your colleague'} a happy birthday!`,
    data: { type: NotificationType.BIRTHDAY, ...data },
  }),
  [NotificationType.WORK_ANNIVERSARY]: (data) => ({
    title: '🎊 Work Anniversary!',
    body: `${data?.employeeName || 'Someone'} is celebrating ${data?.years || 'another'} year!`,
    data: { type: NotificationType.WORK_ANNIVERSARY, ...data },
  }),
};

/**
 * Send a templated notification
 */
export const sendTemplatedNotification = async (
  type: NotificationType,
  data?: any,
  delay?: number
): Promise<string | void> => {
  const template = notificationTemplates[type];
  if (!template) {
    console.error(`Unknown notification type: ${type}`);
    return;
  }

  const notification = template(data);
  
  if (delay) {
    const triggerDate = new Date(Date.now() + delay);
    return scheduleLocalNotification(notification, { date: triggerDate });
  } else {
    await presentLocalNotification(notification);
  }
};
