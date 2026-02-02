import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Header, Button } from '@app/components';
import Toast from 'react-native-toast-message';

export const CardDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'CardDetail'>>();
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleSave = () => {
    Toast.show({
      type: 'success',
      text1: 'Card Saved!',
      text2: 'Your card details have been saved.',
    });
    navigation.goBack();
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\//g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <View style={styles.container}>
      <Header title="Card Details" />
      <ScrollView style={styles.content}>
        {/* Card Preview */}
        <View style={styles.cardPreview}>
          <View style={styles.card}>
            <View style={styles.cardChip} />
            <Text style={styles.cardNumber}>{cardNumber || '**** **** **** ****'}</Text>
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardLabel}>Card Holder</Text>
                <Text style={styles.cardValue}>{cardHolder || 'YOUR NAME'}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>Expires</Text>
                <Text style={styles.cardValue}>{expiryDate || 'MM/YY'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              keyboardType="number-pad"
              maxLength={19}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Card Holder Name</Text>
            <TextInput style={styles.input} placeholder="John Doe" value={cardHolder} onChangeText={setCardHolder} autoCapitalize="words" />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: Spacing.md }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput style={styles.input} placeholder="123" value={cvv} onChangeText={setCvv} keyboardType="number-pad" maxLength={3} secureTextEntry />
            </View>
          </View>

          <Button title="Save Card" onPress={handleSave} style={styles.saveButton} />
        </View>
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
  cardPreview: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  card: {
    width: '100%',
    aspectRatio: 1.6,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  cardChip: {
    width: 50,
    height: 35,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  cardNumber: {
    fontSize: Typography.size.xl,
    color: Colors.white,
    letterSpacing: 2,
    fontWeight: Typography.weight.medium,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: Typography.size.xs,
    color: Colors.white + '80',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: Typography.size.base,
    color: Colors.white,
    fontWeight: Typography.weight.medium,
  },
  form: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
