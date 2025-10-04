import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../constants';
import { Icon } from '../../components';

const SetFinancialAmountScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [amount, setAmount] = useState('');

  const handleContinue = () => {
    // Store financial amount and continue to partner selection
    navigation.navigate('SetTargetDate', { financialAmount: parseFloat(amount) });
  };

  const isValid = parseFloat(amount) >= 5;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="cash-outline" size={64} color={Colors.primary.main} />
          <Text style={styles.title}>Set Financial Amount</Text>
          <Text style={styles.subtitle}>How much will you donate per relapse?</Text>
        </View>

        <Surface style={styles.infoCard}>
          <Text style={styles.infoTitle}>How It Works</Text>
          <Text style={styles.infoText}>
            Each time you relapse, you'll automatically donate this amount to a charity of your choice.
            This creates financial accountability for your commitment.
          </Text>
        </Surface>

        <Surface style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Donation Amount per Relapse</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                mode="outlined"
                value={amount}
                onChangeText={setAmount}
                placeholder="25"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            <Text style={styles.helper}>Minimum: $5 per relapse</Text>
          </View>

          <View style={styles.examplesCard}>
            <Text style={styles.examplesTitle}>Suggested Amounts:</Text>
            <View style={styles.suggestionButtons}>
              {['10', '25', '50', '100'].map((suggested) => (
                <Button
                  key={suggested}
                  mode={amount === suggested ? 'contained' : 'outlined'}
                  onPress={() => setAmount(suggested)}
                  style={styles.suggestionButton}
                >
                  ${suggested}
                </Button>
              ))}
            </View>
          </View>
        </Surface>

        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handleContinue}
            disabled={!isValid}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
          >
            Continue
          </Button>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
            Back
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.primary.light + '15',
    borderWidth: 1,
    borderColor: Colors.primary.light,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  formCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
  },
  helper: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  examplesCard: {
    backgroundColor: Colors.background.primary,
    padding: 16,
    borderRadius: 8,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary.main,
    marginBottom: 12,
  },
  suggestionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionButton: {
    flex: 1,
    minWidth: 70,
    borderRadius: 8,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
  },
  primaryButton: {
    borderRadius: 8,
    backgroundColor: Colors.primary.main,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default SetFinancialAmountScreen;
