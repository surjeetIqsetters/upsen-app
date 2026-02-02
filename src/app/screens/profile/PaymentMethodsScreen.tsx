import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, PaymentCard } from '@app/types';
import { payslipApi } from '@app/services/api';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Header, Card, EmptyState } from '@app/components';
import { maskCardNumber } from '@app/utils/helpers';

export const PaymentMethodsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const data = await payslipApi.getPaymentCards();
      setCards(data as PaymentCard[]);
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCard = ({ item }: { item: PaymentCard }) => (
    <Card style={styles.cardItem} onPress={() => navigation.navigate('CardDetail', { cardId: item.id })}>
      <View style={styles.cardIcon}>
        <Ionicons name="card" size={32} color={Colors.primary} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardNumber}>{maskCardNumber(item.cardNumber)}</Text>
        <Text style={styles.cardHolder}>{item.cardHolderName}</Text>
        <Text style={styles.cardExpiry}>Expires {item.expiryDate}</Text>
      </View>
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>Default</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header title="Payment Methods" />
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!isLoading ? <EmptyState icon="card-outline" title="No Cards" message="Add a payment method to get started." /> : null}
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CardDetail', { cardId: undefined })}>
        <Ionicons name="add" size={24} color={Colors.white} />
        <Text style={styles.addButtonText}>Add New Card</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  list: {
    padding: Spacing.base,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardNumber: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  cardHolder: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardExpiry: {
    fontSize: Typography.size.xs,
    color: Colors.gray400,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: Spacing.sm,
  },
  defaultText: {
    fontSize: Typography.size.xs,
    color: Colors.success,
    fontWeight: Typography.weight.medium,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    margin: Spacing.base,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  addButtonText: {
    fontSize: Typography.size.base,
    color: Colors.white,
    fontWeight: Typography.weight.semibold,
  },
});
