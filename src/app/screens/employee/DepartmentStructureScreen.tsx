import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header, Card, Avatar } from '@app/components';
import { Colors, Typography, Spacing } from '@app/utils/constants';

export const DepartmentStructureScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header title="Department Structure" />
      <ScrollView style={styles.content}>
        <Card style={styles.orgCard}>
          <View style={styles.level}>
            <View style={styles.node}>
              <Avatar name="John Smith" size="lg" />
              <Text style={styles.nodeName}>John Smith</Text>
              <Text style={styles.nodeTitle}>CEO</Text>
            </View>
          </View>
          <View style={styles.connector} />
          <View style={styles.level}>
            <View style={styles.node}>
              <Avatar name="Sarah Johnson" size="md" />
              <Text style={styles.nodeName}>Sarah Johnson</Text>
              <Text style={styles.nodeTitle}>HR Manager</Text>
            </View>
            <View style={styles.node}>
              <Avatar name="Mike Brown" size="md" />
              <Text style={styles.nodeName}>Mike Brown</Text>
              <Text style={styles.nodeTitle}>Tech Lead</Text>
            </View>
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
  orgCard: {
    padding: Spacing.lg,
  },
  level: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  node: {
    alignItems: 'center',
  },
  nodeName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  nodeTitle: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  connector: {
    width: 2,
    height: 40,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginVertical: Spacing.sm,
  },
});
