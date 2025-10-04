import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components';
import { Colors } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FastingStackParamList } from '../navigation/FastingNavigator';

type FastType = 'daily' | 'nightly' | 'weekly' | 'custom' | 'breakthrough';

interface FastOption {
  id: FastType;
  title: string;
  icon: string;
  description: string;
  verse: string;
  prayerFocus: string;
}

const fastOptions: FastOption[] = [
  {
    id: 'daily',
    title: 'Daily Fast',
    icon: 'sunny',
  description: 'Set a daily fasting window (e.g., 9 AM–3 PM) and build consistency every day.',
  prayerFocus: 'Gratitude and daily obedience',
  verse: '“Give thanks in all circumstances.” — 1 Thessalonians 5:18'
  },
  {
    id: 'nightly',
    title: 'Nightly Fast',
    icon: 'moon',
  description: 'Fast overnight by default (6 PM–6 AM) to reset and refocus.',
  prayerFocus: 'Reflection and renewal',
  verse: '“Search me, God, and know my heart.” — Psalm 139:23'
  },
  {
    id: 'weekly',
    title: 'Weekly Fast',
    icon: 'calendar',
  description: 'Choose specific days (e.g., Mon/Wed/Fri) and a time window to fast each week.',
  prayerFocus: 'Intercession and community',
  verse: '“Pray for each other so that you may be healed.” — James 5:16'
  },
  {
    id: 'custom',
    title: 'Custom Fast',
    icon: 'time',
  description: 'Create a fixed (one-time) fast like 12h/24h/3d, or set a recurring schedule.',
  prayerFocus: 'Personal growth and discernment',
  verse: '“If any of you lacks wisdom, ask God.” — James 1:5'
  },
  {
    id: 'breakthrough',
    title: 'Breakthrough: 24-Hour Fast',
    icon: 'rocket',
  description: 'A focused 24-hour fast seeking freedom from strongholds and addictions.',
  prayerFocus: 'Freedom and deliverance',
  verse: '“If the Son sets you free, you will be free indeed.” — John 8:36'
  }
];

const StartFastScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<FastingStackParamList>>();

  const [selectedFastType, setSelectedFastType] = useState<FastType | null>(null);

  // Enhanced back button handler with multiple fallback options
  const goBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    if (selectedFastType) {
      navigation.navigate('ConfigureFast', { fastType: selectedFastType });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={goBack} 
          style={styles.closeButton}
          activeOpacity={0.7}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Icon name="close" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select a Fast Type</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.sectionTitle}>Choose a Fast</Text>

      <ScrollView style={styles.content}>
        {fastOptions.map((option) => (
          <TouchableOpacity 
            key={option.id} 
            style={[
              styles.optionContainer,
              selectedFastType === option.id && styles.selectedOption
            ]}
            onPress={() => setSelectedFastType(option.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              selectedFastType === option.id && styles.selectedIconContainer
            ]}>
              <Icon name={option.icon} size={24} color={Colors.white} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[
                styles.optionTitle,
                selectedFastType === option.id && styles.selectedText
              ]}>{option.title}</Text>
              <Text style={[
                styles.optionDescription,
                selectedFastType === option.id && styles.selectedDescription
              ]}>
                {option.description} Prayer Focus: {option.prayerFocus}. Verse: {option.verse}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.nextButton,
            !selectedFastType && styles.nextButtonDisabled
          ]} 
          onPress={handleNext}
          disabled={!selectedFastType}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.nextButtonText,
            !selectedFastType && styles.nextButtonTextDisabled
          ]}>Next</Text>
        </TouchableOpacity>
        <View style={styles.bottomSpacer} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    // Add some visual feedback and ensure it's touchable
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)', // Subtle background to see the button area
    // Remove any potential blocking styles
    zIndex: 1000,
    elevation: 1000, // For Android
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginLeft: -48, // To center the title accounting for the close button
  },
  headerSpacer: {
    width: 48, // To balance the close button
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 20,
  },
  content: {
    flex: 1,
  },
  optionContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6a6a6a',
    lineHeight: 20,
  },
  footer: {
    padding: 12,
    paddingHorizontal: 16,
  },
  nextButton: {
    backgroundColor: Colors.primary.main,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 20,
  },
  selectedOption: {
    backgroundColor: Colors.primary.main + '20',
  },
  selectedIconContainer: {
    backgroundColor: Colors.primary.main,
  },
  selectedText: {
    color: Colors.primary.main,
  },
  selectedDescription: {
    color: '#2a2a2a',
  },
  nextButtonDisabled: {
    backgroundColor: Colors.background.tertiary,
    opacity: 0.6,
  },
  nextButtonTextDisabled: {
    color: Colors.text.secondary,
  },
});

export default StartFastScreen;