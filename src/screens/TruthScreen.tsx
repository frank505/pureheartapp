/**
 * TruthScreen Component
 * 
 * "Lies vs Truth Center" helping users identify lies and replace them with biblical truth.
 * Features common lies, custom lie input, biblical truth response, and progress tracking.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Text,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import ProfileDropdown from '../components/ProfileDropdown';
import { Colors, Icons } from '../constants';

interface TruthScreenProps {
  navigation?: any;
  route?: any;
}

const TruthScreen: React.FC<TruthScreenProps> = ({ navigation }) => {
  const [customLie, setCustomLie] = useState('');
  const [biblicalTruth, setBiblicalTruth] = useState('');
  
  // Common lies with add functionality
  const commonLies = [
    "I am beyond God's grace",
    "This is my only way to cope", 
    "I will never be free"
  ];

  const handleAddLie = (lie: string) => {
    console.log('Adding lie:', lie);
    // Here you would add logic to track this lie
  };

  const openScriptureBrowser = () => {
    if (navigation) navigation.navigate('ScriptureBrowser');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Lies vs Truth Center</Text>
        <ProfileDropdown navigation={navigation} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Identify Lies Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identify Lies</Text>
          <Text style={styles.sectionDescription}>
            Recognize the lies the devil might be telling you that fuel your struggle. Understanding these falsehoods is the first step towards freedom.
          </Text>
        </View>

        {/* Common Lies */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Common Lies</Text>
          <View style={styles.liesContainer}>
            {commonLies.map((lie, index) => (
              <Surface key={index} style={styles.lieCard} elevation={2}>
                <Text style={styles.lieText}>{lie}</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => handleAddLie(lie)}
                >
                  <Icon 
                    name="add-circle-outline" 
                    color={Colors.primary.main} 
                    size="md" 
                  />
                </TouchableOpacity>
              </Surface>
            ))}
          </View>
        </View>

        {/* Custom Lie Input */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Custom Lie</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a lie you are believing..."
            placeholderTextColor={Colors.text.secondary}
            value={customLie}
            onChangeText={setCustomLie}
            multiline={false}
          />
        </View>

        {/* Biblical Truth Response */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Biblical Truth Response</Text>
            <TouchableOpacity onPress={openScriptureBrowser}>
              <Text style={{ color: Colors.primary.main, fontWeight: '600' }}>Browse Scripture</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionDescription}>
            Combat lies with the power of God's Word. Select or write a biblical truth to replace the lie.
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder='e.g., "I can do all things through Christ who strengthens me." - Philippians 4:13'
            placeholderTextColor={Colors.text.secondary}
            value={biblicalTruth}
            onChangeText={setBiblicalTruth}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Progress Tracking */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Progress Tracking</Text>
          <Surface style={styles.progressCard} elevation={2}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Truths Embraced</Text>
              <Text style={styles.progressPercentage}>75%</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '75%' }]} />
              </View>
            </View>
            
            <Text style={styles.progressDescription}>
              You have successfully replaced 3 out of 4 identified lies with biblical truth.
            </Text>
          </Surface>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary, // Consistent with other screens
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.primary, // Consistent with other tab screens
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary, // Consistent text color
    textAlign: 'center',
    flex: 1,
    paddingRight: 24, // Offset for back button
  },
  headerSpacer: {
    width: 24,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 96, // Account for tab bar
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },

  // Common Lies
  liesContainer: {
    gap: 12,
  },
  lieCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lieText: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  addButton: {
    padding: 4,
  },

  // Input Fields
  input: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.background.tertiary,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.text.primary,
    marginTop: 16,
  },
  textArea: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.background.tertiary,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 128,
    marginTop: 16,
  },

  // Progress Tracking
  progressCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 5,
  },
  progressBarFill: {
    height: 10,
    backgroundColor: Colors.primary.main,
    borderRadius: 5,
  },
  progressDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
});

export default TruthScreen;