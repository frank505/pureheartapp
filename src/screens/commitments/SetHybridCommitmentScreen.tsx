/**
 * Set Hybrid Commitment Screen
 * 
 * Allows users to set both financial and action commitments.
 * This combines the functionality of both commitment types.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenHeader, Icon } from '../../components';
import { Colors } from '../../constants';

type Props = NativeStackScreenProps<any, 'SetHybridCommitment'>;

const SetHybridCommitmentScreen: React.FC<Props> = ({ navigation }) => {
  const [financialAmount, setFinancialAmount] = useState<number>(25);
  const [selectedAction, setSelectedAction] = useState<string>('');

  const handleContinue = () => {
    // For now, navigate to SetTargetDate
    // TODO: Implement hybrid commitment logic
    navigation.navigate('SetTargetDate');
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/appbackgroundimage.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader
          title="Hybrid Commitment"
          navigation={navigation}
          showBackButton={true}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Icon name="flash" size={64} color={Colors.primary.main} />
            <Text style={styles.title}>Set Your Hybrid Commitment</Text>
            <Text style={styles.subtitle}>
              Combine both financial and action commitments for maximum accountability.
            </Text>
          </View>

          {/* Financial Section */}
          <Surface style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="cash" size={24} color="#10b981" />
              <Text style={styles.sectionTitle}>Financial Commitment</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Amount to donate if you relapse
            </Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <Text style={styles.amountText}>{financialAmount}</Text>
            </View>
          </Surface>

          {/* Action Section */}
          <Surface style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="heart" size={24} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Action Commitment</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Good deed to complete if you relapse
            </Text>
            <Surface style={styles.actionPlaceholder}>
              <Icon name="add" size={32} color={Colors.text.secondary} />
              <Text style={styles.actionPlaceholderText}>
                Choose an action from the browse screen
              </Text>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('BrowseActions')}
                style={styles.browseButton}
              >
                Browse Actions
              </Button>
            </Surface>
          </Surface>

          {/* Coming Soon Notice */}
          <Surface style={styles.comingSoonCard}>
            <View style={styles.comingSoonHeader}>
              <Icon name="construct" size={32} color={Colors.primary.main} />
              <Text style={styles.comingSoonTitle}>Coming Soon</Text>
            </View>
            <Text style={styles.comingSoonText}>
              The hybrid commitment feature is currently under development. 
              For now, please choose either a Financial or Action commitment from the previous screen.
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              Choose Different Type
            </Button>
          </Surface>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#2d2d2d',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginRight: 4,
  },
  amountText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#10b981',
  },
  actionPlaceholder: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderWidth: 2,
    borderColor: Colors.border.primary,
    borderStyle: 'dashed',
  },
  actionPlaceholderText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginVertical: 12,
  },
  browseButton: {
    marginTop: 8,
  },
  comingSoonCard: {
    borderRadius: 16,
    padding: 24,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
    marginTop: 16,
  },
  comingSoonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  comingSoonText: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary.main,
  },
});

export default SetHybridCommitmentScreen;