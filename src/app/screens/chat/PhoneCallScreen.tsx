import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Avatar } from '@app/components';

export const PhoneCallScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'PhoneCall'>>();
  const { userId } = route.params;
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Caller Info */}
      <View style={styles.callerInfo}>
        <Avatar name="John Doe" size="2xl" />
        <Text style={styles.callerName}>John Doe</Text>
        <Text style={styles.callStatus}>{formatDuration(callDuration)}</Text>
      </View>

      {/* Call Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={28} color={isMuted ? Colors.white : Colors.textPrimary} />
          <Text style={[styles.controlLabel, isMuted && styles.controlLabelActive]}>Mute</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isSpeaker && styles.controlButtonActive]}
          onPress={() => setIsSpeaker(!isSpeaker)}
        >
          <Ionicons name={isSpeaker ? 'volume-high' : 'volume-medium'} size={28} color={isSpeaker ? Colors.white : Colors.textPrimary} />
          <Text style={[styles.controlLabel, isSpeaker && styles.controlLabelActive]}>Speaker</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="videocam" size={28} color={Colors.textPrimary} />
          <Text style={styles.controlLabel}>Video</Text>
        </TouchableOpacity>
      </View>

      {/* End Call */}
      <TouchableOpacity style={styles.endCallButton}>
        <Ionicons name="call" size={32} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  callerInfo: {
    alignItems: 'center',
    marginBottom: Spacing['5xl'],
  },
  callerName: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  callStatus: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing['5xl'],
  },
  controlButton: {
    alignItems: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    ...{
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  },
  controlButtonActive: {
    backgroundColor: Colors.primary,
  },
  controlLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  controlLabelActive: {
    color: Colors.white,
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
});
