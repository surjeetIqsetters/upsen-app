import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar as RNCalendar, LocaleConfig, DateData } from 'react-native-calendars';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { useEventsStore } from '@app/store/eventsStore';
import { Loading, EmptyState } from '@app/components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LocalEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  eventType: 'office' | 'meeting' | 'training' | 'holiday';
  location?: string;
}

const eventTypeColors = {
  office: Colors.primary,
  meeting: Colors.warning,
  training: Colors.success,
  holiday: Colors.error,
};

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { events, isLoading, fetchEvents } = useEventsStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const getMarkedDates = () => {
    const marked: any = {};
    events.forEach((event) => {
      const dateStr = format(new Date(event.startTime), 'yyyy-MM-dd');
      if (!marked[dateStr]) {
        marked[dateStr] = { dots: [] };
      }
      marked[dateStr].dots.push({
        color: eventTypeColors[event.eventType],
      });
    });
    return marked;
  };

  const selectedDateEvents = events.filter((event) =>
    isSameDay(new Date(event.startTime), selectedDate)
  );

  const onDayPress = (day: DateData) => {
    setSelectedDate(new Date(day.timestamp));
  };

  const renderEventItem = (event: LocalEvent) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventItem}
      onPress={() => navigation.navigate('EventDetail', { eventId: (event as any).id })}
    >
      <View style={[styles.eventIndicator, { backgroundColor: eventTypeColors[event.eventType] }]} />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventTime}>
          {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
        </Text>
        {event.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.locationText}>{event.location}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return <Loading fullscreen message="Loading calendar..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateEvent', { date: undefined })}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <RNCalendar
            current={format(currentMonth, 'yyyy-MM-dd')}
            onDayPress={onDayPress}
            markedDates={{
              ...getMarkedDates(),
              [format(selectedDate, 'yyyy-MM-dd')]: {
                selected: true,
                selectedColor: Colors.primary,
                ...(getMarkedDates()[format(selectedDate, 'yyyy-MM-dd')] || {}),
              },
            }}
            markingType="multi-dot"
            theme={{
              calendarBackground: Colors.white,
              textSectionTitleColor: Colors.textPrimary,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.white,
              todayTextColor: Colors.primary,
              dayTextColor: Colors.textPrimary,
              textDisabledColor: Colors.gray300,
              dotColor: Colors.primary,
              selectedDotColor: Colors.white,
              arrowColor: Colors.primary,
              monthTextColor: Colors.textPrimary,
              textMonthFontWeight: 'bold',
              textDayFontSize: 14,
              textMonthFontSize: 16,
            }}
            onMonthChange={(month) => setCurrentMonth(new Date(month.timestamp))}
          />
        </View>

        {/* Selected Date Events */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <Text style={styles.eventsTitle}>
              Events for {format(selectedDate, 'MMM dd, yyyy')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CreateEvent', { date: undefined })}>
              <Ionicons name="add" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map((item: LocalEvent) => renderEventItem(item))
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="No events"
              message="No events scheduled for this day"
              actionLabel="Add Event"
              onAction={() => navigation.navigate('CreateEvent', { date: selectedDate })}
            />
          )}
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
  calendarContainer: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventsSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  eventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  eventsTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventIndicator: {
    width: 4,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.md,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  eventTime: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },
});
