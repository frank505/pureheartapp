/**
 * Choose Commitment Type Screen
 * 
 * First screen in the commitment creation flow.
 * Users choose between Financial, Action, or Hybrid commitment types.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenHeader, Icon } from '../../components';
import { Colors } from '../../constants';
import type { CommitmentType } from '../../types/commitments';

type Props = NativeStackScreenProps<any, 'ChooseCommitmentType'>;

interface CommitmentOption {
  type: CommitmentType;
  title: string;
  description: string;
  icon: string;
  color: string;
  example: string;
}

const COMMITMENT_OPTIONS: CommitmentOption[] = [
  {
    type: 'FINANCIAL',
    title: 'Financial Commitment',
    description: 'Donate money to charity if you relapse. Amount is charged automatically.',
    icon: 'cash',
    color: '#10b981',
    example: 'Example: $25 donation to your chosen charity',
  },
  {
    type: 'ACTION',
    title: 'Action Commitment',
    description: 'Complete a good deed if you relapse. Upload photo/video proof within 48 hours.',
    icon: 'heart',
    color: '#3b82f6',
    example: 'Example: Serve at soup kitchen for 3 hours',
  },
  {
    type: 'HYBRID',
    title: 'Hybrid Commitment',
    description: 'Combines both financial and action commitments for maximum accountability.',
    icon: 'flash',
    color: '#f59e0b',
    example: 'Example: $10 donation + 2 hours of community service',
  },
];

const ChooseCommitmentTypeScreen: React.FC<Props> = ({ navigation }) => {
  const handleSelectType = (type: CommitmentType) => {
    // Navigate to appropriate next screen based on type
    if (type === 'ACTION') {
      navigation.navigate('BrowseActions');
    } else if (type === 'FINANCIAL') {
      navigation.navigate('SetFinancialAmount');
    } else {
      navigation.navigate('SetHybridCommitment');
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/appbackgroundimage.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader
          title="Create Commitment"
          navigation={navigation}
          showBackButton={true}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header Section */}
          <View style={styles.header}>
            <Icon name="shield-checkmark" size={64} color={Colors.primary.main} />
            <Text style={styles.title}>Choose Your Commitment Type</Text>
            <Text style={styles.subtitle}>
              Select how you want to hold yourself accountable. Each type provides powerful motivation to stay clean.
            </Text>
          </View>

          {/* Commitment Options */}
          <View style={styles.optionsContainer}>
            {COMMITMENT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.type}
                onPress={() => handleSelectType(option.type)}
                activeOpacity={0.7}
              >
                <Surface style={styles.optionCard}>
                  <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                    <Icon name={option.icon} size={32} color={Colors.white} />
                  </View>

                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                    <View style={styles.exampleContainer}>
                      <Icon name="information-circle-outline" size={16} color={Colors.text.secondary} />
                      <Text style={styles.exampleText}>{option.example}</Text>
                    </View>
                  </View>

                  <Icon name="chevron-forward" size={24} color={Colors.text.secondary} />
                </Surface>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Section */}
          <Surface style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Icon name="bulb" size={24} color={Colors.primary.main} />
              <Text style={styles.infoTitle}>How It Works</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>1.</Text>
              <Text style={styles.infoText}>
                Set a target date to stay clean until
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>2.</Text>
              <Text style={styles.infoText}>
                If you relapse, you'll need to complete your chosen commitment
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>3.</Text>
              <Text style={styles.infoText}>
                Your accountability partner verifies your completion
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>4.</Text>
              <Text style={styles.infoText}>
                Turn your struggle into positive impact for others
              </Text>
            </View>
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
  optionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  optionCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.background.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  exampleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },
  exampleText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    flex: 1,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: Colors.background.secondary,
    elevation: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  infoItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoBullet: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary.main,
    width: 20,
  },
  infoText: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    flex: 1,
  },
});

export default ChooseCommitmentTypeScreen;
