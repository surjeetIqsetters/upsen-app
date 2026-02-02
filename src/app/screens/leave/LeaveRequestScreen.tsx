import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@app/types';
import { Header, Card, Button } from '@app/components';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Calendar } from 'react-native-calendars';

export const LeaveRequestScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedDates, setSelectedDates] = useState<any>({});
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const onDayPress = (day: any) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate(null);
      setSelectedDates({
        [day.dateString]: { selected: true, startingDay: true, color: Colors.primary },
      });
    } else {
      const start = new Date(startDate);
      const end = new Date(day.dateString);
      
      if (end < start) {
        setStartDate(day.dateString);
        setEndDate(null);
        setSelectedDates({
          [day.dateString]: { selected: true, startingDay: true, color: Colors.primary },
        });
      } else {
        setEndDate(day.dateString);
        const markedDates: any = {};
        let current = new Date(startDate);
        
        while (current <= end) {
          const dateStr = current.toISOString().split('T')[0];
          markedDates[dateStr] = {
            selected: true,
            color: Colors.primary,
            startingDay: dateStr === startDate,
            endingDay: dateStr === day.dateString,
          };
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(markedDates);
      }
    }
  };

  const handleContinue = () => {
    if (startDate && endDate) {
      navigation.navigate('LeaveRequestForm', { startDate, endDate });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Book Leave Request" />
      <View style={styles.content}>
        <Card style={styles.calendarCard}>
          <Calendar
            onDayPress={onDayPress}
            markedDates={selectedDates}
            markingType="period"
            theme={{
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.white,
              todayTextColor: Colors.primary,
              arrowColor: Colors.primary,
            }}
          />
        </Card>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Selected Dates</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <Text style={styles.dateValue}>{startDate || 'Select date'}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={Colors.gray400} />
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>End Date</Text>
              <Text style={styles.dateValue}>{endDate || 'Select date'}</Text>
            </View>
          </View>
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!startDate || !endDate}
          style={styles.continueButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    flex: 1,
    padding: Spacing.base,
  },
  calendarCard: {
    marginBottom: Spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBox: {
    flex: 1,
    backgroundColor: Colors.gray100,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  dateValue: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  continueButton: {
    marginTop: 'auto',
  },
});
