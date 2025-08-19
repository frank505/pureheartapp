import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components';
import { Colors } from '../constants';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type NewFastScreenRouteProp = RouteProp<RootStackParamList, 'NewFast'>;

const NewFastScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<NewFastScreenRouteProp>();

  // Tab state
  const [activeTab, setActiveTab] = useState('goals');

  // Goals tab state
  const [goal, setGoal] = useState('');
  const [smartGoal, setSmartGoal] = useState('');
  
  // Prayer Schedule tab state
  const [prayerTimes, setPrayerTimes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [widgetEnabled, setWidgetEnabled] = useState(false);
  
  // Accountability tab state
  const [partnerEmail, setPartnerEmail] = useState('');

  const handleNext = () => {
    // Navigate to next screen
  };

  const progressDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === 0 ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Fast</Text>
          <View style={styles.headerSpacer} />
        </View>

        {progressDots()}

        <View style={styles.tabContainer}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={[
              { value: 'goals', label: 'Goals' },
              { value: 'prayer', label: 'Prayer' },
              { value: 'accountability', label: 'Partner' },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'goals' && (
            <>
              <Text style={styles.sectionTitle}>What is your goal for this fast?</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={goal}
                  onChangeText={setGoal}
                  style={styles.input}
                  selectionColor={Colors.primary.main}
                  underlineStyle={{ display: 'none' }}
                  theme={{ colors: { text: Colors.white } }}
                />
              </View>

              <Text style={styles.sectionTitle}>SMART Goal Setting</Text>
              <Text style={styles.description}>
                Define a SMART goal to focus your fast and track progress in overcoming your addiction. 
                This will help you stay committed and see tangible results.
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={smartGoal}
                  onChangeText={setSmartGoal}
                  placeholder="Describe your SMART goal for addiction recovery"
                  multiline
                  numberOfLines={6}
                  style={[styles.input, styles.textArea]}
                  placeholderTextColor="#93acc8"
                  selectionColor={Colors.primary.main}
                  underlineStyle={{ display: 'none' }}
                  theme={{ colors: { text: Colors.white } }}
                />
              </View>
            </>
          )}

          {activeTab === 'prayer' && (
            <>
              <Text style={styles.sectionTitle}>Prayer Commitment</Text>
              <Text style={styles.description}>
                Commit to specific prayer times during your fast to strengthen your spiritual connection 
                and seek guidance. Consider setting reminders to stay consistent.
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={prayerTimes}
                  onChangeText={setPrayerTimes}
                  placeholder="Prayer Times (e.g., 6 AM, 12 PM, 6 PM)"
                  style={styles.input}
                  placeholderTextColor="#93acc8"
                  selectionColor={Colors.primary.main}
                  underlineStyle={{ display: 'none' }}
                  theme={{ colors: { text: Colors.white } }}
                />
              </View>

              <View style={styles.reminderContainer}>
                <View style={styles.reminderIcon}>
                  <Icon name="alarm" size={24} color={Colors.white} />
                </View>
                <View style={styles.reminderText}>
                  <Text style={styles.reminderTitle}>Set Prayer Reminders</Text>
                  <Text style={styles.reminderDescription}>
                    Receive notifications to remind you of your prayer times.
                  </Text>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: '#243447', true: '#1979e6' }}
                  thumbColor={Colors.white}
                  ios_backgroundColor="#243447"
                />
              </View>

              <View style={styles.reminderContainer}>
                <View style={styles.reminderIcon}>
                  <Icon name="apps" size={24} color={Colors.white} />
                </View>
                <View style={styles.reminderText}>
                  <Text style={styles.reminderTitle}>Add to Widget</Text>
                  <Text style={styles.reminderDescription}>
                    Add fast progress tracking to your home screen widget.
                  </Text>
                </View>
                <Switch
                  value={widgetEnabled}
                  onValueChange={setWidgetEnabled}
                  trackColor={{ false: '#243447', true: '#1979e6' }}
                  thumbColor={Colors.white}
                  ios_backgroundColor="#243447"
                />
              </View>

              <Text style={styles.sectionTitle}>Suggested Prayers</Text>
              <Text style={styles.description}>
                Since your goal is breaking addiction, consider incorporating prayers for 
                deliverance and spiritual warfare into your routine.
              </Text>

              <TouchableOpacity style={styles.prayerItem}>
                <View style={styles.prayerIcon}>
                  <Icon name="book" size={24} color={Colors.white} />
                </View>
                <Text style={styles.prayerText}>Prayers for Deliverance</Text>
                <Icon name="chevron-right" size={24} color={Colors.white} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.prayerItem}>
                <View style={styles.prayerIcon}>
                  <Icon name="shield" size={24} color={Colors.white} />
                </View>
                <Text style={styles.prayerText}>Prayers for Spiritual Warfare</Text>
                <Icon name="chevron-right" size={24} color={Colors.white} />
              </TouchableOpacity>
            </>
          )}

          {activeTab === 'accountability' && (
            <>
              <Text style={styles.sectionTitle}>Accountability Partner</Text>
              <Text style={styles.description}>
                Having an accountability partner can significantly boost your success. 
                They provide support, encouragement, and help you stay on track.
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  value={partnerEmail}
                  onChangeText={setPartnerEmail}
                  placeholder="Partner's email address"
                  style={styles.input}
                  placeholderTextColor="#93acc8"
                  selectionColor={Colors.primary.main}
                  underlineStyle={{ display: 'none' }}
                  theme={{ colors: { text: Colors.white } }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.inviteButton}>
                <Text style={styles.inviteButtonText}>Invite Accountability Partner</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
          <View style={styles.bottomSpacer} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.primary,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginRight: 48,
  },
  headerSpacer: {
    width: 24,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background.primary,
  },
  segmentedButtons: {
    backgroundColor: Colors.background.secondary,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#1979e6',
  },
  inactiveDot: {
    backgroundColor: '#344b65',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 20,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.white,
    marginBottom: 12,
    lineHeight: 24,
  },
  inputContainer: {
    marginVertical: 12,
  },
  input: {
    backgroundColor: '#1a2532',
    borderWidth: 1,
    borderColor: '#344b65',
    borderRadius: 8,
    color: Colors.white,
    paddingHorizontal: 15,
    height: 56,
    fontSize: 16,
  },
  textArea: {
    height: 144,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
  },
  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#243447',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reminderText: {
    flex: 1,
  },
  reminderTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  reminderDescription: {
    color: '#93acc8',
    fontSize: 14,
  },
  prayerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  prayerIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#243447',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  prayerText: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
  },
  inviteButton: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#243447',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginVertical: 12,
  },
  inviteButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    padding: 12,
  },
  nextButton: {
    height: 40,
    backgroundColor: '#1979e6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default NewFastScreen;
