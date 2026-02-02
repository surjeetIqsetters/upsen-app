import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, Card, EmptyState, Loading } from '@app/components';
import { eventsApi } from '@app/services/api';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { formatDate, formatTime } from '@app/utils/helpers';

interface Event {
  id: string;
  title: string;
  description: string;
  eventType: string;
  startTime: string;
  endTime: string;
  location?: string;
}

export const EventsScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'office' | 'meeting' | 'training'>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await eventsApi.getEvents();
      setEvents(data as Event[]);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = filter === 'all' ? events : events.filter((e) => e.eventType === filter);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'videocam';
      case 'training':
        return 'school';
      case 'holiday':
        return 'calendar';
      default:
        return 'business';
    }
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <Card style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={[styles.eventIcon, { backgroundColor: Colors.primaryLighter }]}>
          <Ionicons name={getEventIcon(item.eventType) as any} size={24} color={Colors.primary} />
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventType}>{item.eventType}</Text>
        </View>
      </View>
      <View style={styles.eventDetails}>
        <View style={styles.detail}>
          <Ionicons name="calendar-outline" size={16} color={Colors.gray400} />
          <Text style={styles.detailText}>{formatDate(item.startTime)}</Text>
        </View>
        <View style={styles.detail}>
          <Ionicons name="time-outline" size={16} color={Colors.gray400} />
          <Text style={styles.detailText}>
            {formatTime(item.startTime)} - {formatTime(item.endTime)}
          </Text>
        </View>
        {item.location && (
          <View style={styles.detail}>
            <Ionicons name="location-outline" size={16} color={Colors.gray400} />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'office', label: 'Office' },
    { key: 'meeting', label: 'Meeting' },
    { key: 'training', label: 'Training' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Events" />

      {/* Filter */}
      <View style={styles.filterContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key as any)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          isLoading ? (
            <Loading fullscreen={false} />
          ) : (
            <EmptyState
              title="No events found"
              message="Check back later for upcoming company events"
              icon="calendar-outline"
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
    fontWeight: Typography.weight.medium,
  },
  list: {
    padding: Spacing.base,
  },
  eventCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  eventType: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  eventDetails: {
    gap: Spacing.xs,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
});
