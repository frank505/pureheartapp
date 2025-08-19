import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components';
import { Colors } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

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
    description: 'A fast from sunrise to sunset.',
    prayerFocus: 'Gratitude for daily blessings',
    verse: 'Give thanks in all circumstances; for this is God\'s will for you in Christ Jesus. - 1 Thessalonians 5:18'
  },
  {
    id: 'nightly',
    title: 'Nightly Fast',
    icon: 'moon',
    description: 'A fast from sunset to sunset.',
    prayerFocus: 'Reflection and repentance',
    verse: 'Search me, God, and know my heart; test me and know my anxious thoughts. - Psalm 139:23'
  },
  {
    id: 'weekly',
    title: 'Weekly Fast',
    icon: 'calendar',
    description: 'A fast from sunrise to sunset.',
    prayerFocus: 'Community and intercession',
    verse: 'Therefore confess your sins to each other and pray for each other so that you may be healed. - James 5:16'
  },
  {
    id: 'custom',
    title: 'Custom Fast',
    icon: 'time',
    description: 'A fast from sunrise to sunset.',
    prayerFocus: 'Personal growth and discernment',
    verse: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you. - James 1:5'
  },
  {
    id: 'breakthrough',
    title: 'Breakthrough: 24-Hour Fast',
    icon: 'link-broken',
    description: 'A 24-hour fast, effective for seeking freedom from addictions.',
    prayerFocus: 'Breaking chains of addiction',
    verse: 'So if the Son sets you free, you will be free indeed. - John 8:36'
  }
];

const StartFastScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedFastType, setSelectedFastType] = useState<FastType | null>(null);

  const handleNext = () => {
    if (selectedFastType) {
      navigation.navigate('NewFast', { fastType: selectedFastType });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Icon name="close" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Start a Fast</Text>
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
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginLeft: -48, // To center the title accounting for the close button
  },
  headerSpacer: {
    width: 48, // To balance the close button
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
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
    color: Colors.white,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.inactiveTab,
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
    color: Colors.white,
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
    color: Colors.white,
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
