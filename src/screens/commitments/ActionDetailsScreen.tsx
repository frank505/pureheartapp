/**
 * Action Details Screen
 * 
 * Third screen in the action commitment flow.
 * Shows full details of the selected action before proceeding.
 */

import React from 'react';
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
import { useAppSelector } from '../../store/hooks';

type Props = NativeStackScreenProps<any, 'ActionDetails'>;

const ActionDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const selectedAction = useAppSelector((state) => state.commitments.selectedAction);

  if (!selectedAction) {
    // No action selected, go back
    navigation.goBack();
    return null;
  }

  const handleContinue = () => {
    navigation.navigate('SetTargetDate');
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      COMMUNITY_SERVICE: 'people',
      CHURCH_SERVICE: 'church',
      CHARITY_DONATION: 'heart',
      HELPING_INDIVIDUALS: 'hand-left',
      ENVIRONMENTAL: 'leaf',
      EDUCATIONAL: 'school',
      CUSTOM: 'create',
    };
    return icons[category] || 'star';
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colors: Record<string, string> = {
      EASY: '#10b981',
      MEDIUM: '#f59e0b',
      HARD: '#ef4444',
    };
    return colors[difficulty] || Colors.primary.main;
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/appbackgroundimage.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader
          title="Action Details"
          navigation={navigation}
          showBackButton={true}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <Surface style={styles.headerCard}>
            <View style={styles.headerContent}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: getDifficultyColor(selectedAction.difficulty) },
                ]}
              >
                <Icon
                  name={getCategoryIcon(selectedAction.category)}
                  size={40}
                  color={Colors.white}
                />
              </View>
              <Text style={styles.title}>{selectedAction.title}</Text>
              <View style={styles.badges}>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(selectedAction.difficulty) },
                  ]}
                >
                  <Text style={styles.badgeText}>{selectedAction.difficulty}</Text>
                </View>
                <View style={styles.hoursBadge}>
                  <Icon name="time-outline" size={16} color={Colors.primary.main} />
                  <Text style={styles.hoursText}>{selectedAction.estimatedHours}h</Text>
                </View>
              </View>
            </View>
          </Surface>

          {/* Description Section */}
          <Surface style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="information-circle" size={24} color={Colors.primary.main} />
              <Text style={styles.sectionTitle}>What You'll Do</Text>
            </View>
            <Text style={styles.description}>{selectedAction.description}</Text>
          </Surface>

          {/* Proof Requirements Section */}
          <Surface style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="camera" size={24} color={Colors.primary.main} />
              <Text style={styles.sectionTitle}>Proof Requirements</Text>
            </View>
            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <Icon name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.requirementText}>
                  Photo or video required within 48 hours
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.requirementText}>
                  Your face must be visible in the photo
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.requirementText}>
                  Photo must be taken at the location
                </Text>
              </View>
              {(selectedAction.requiresLocation ?? true) && (
                <View style={styles.requirementItem}>
                  <Icon name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={styles.requirementText}>
                    GPS location will be captured automatically
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsLabel}>Specific Instructions:</Text>
              <Text style={styles.instructionsText}>
                {selectedAction.proofInstructions || 'Take clear photos showing yourself completing this service action. Make sure your face is visible and the location/activity is clearly documented.'}
              </Text>
            </View>
          </Surface>

          {/* What Happens Section */}
          <Surface style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="help-circle" size={24} color={Colors.primary.main} />
              <Text style={styles.sectionTitle}>What Happens If You Relapse?</Text>
            </View>
            <View style={styles.timelineContainer}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>1. Report Relapse</Text>
                  <Text style={styles.timelineText}>
                    Honestly acknowledge your relapse in the app
                  </Text>
                </View>
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>2. Complete Action (48 hours)</Text>
                  <Text style={styles.timelineText}>
                    Go and complete this action within 48 hours
                  </Text>
                </View>
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>3. Upload Proof</Text>
                  <Text style={styles.timelineText}>
                    Take a photo/video as proof and upload it
                  </Text>
                </View>
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotFinal]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>4. Partner Verification</Text>
                  <Text style={styles.timelineText}>
                    Your accountability partner verifies your completion
                  </Text>
                </View>
              </View>
            </View>
          </Surface>

          {/* Impact Section */}
          <Surface style={[styles.section, styles.impactSection]}>
            <Icon name="heart" size={32} color="#ef4444" />
            <Text style={styles.impactTitle}>Turn Your Struggle Into Service</Text>
            <Text style={styles.impactText}>
              If you relapse, you'll transform that moment into positive impact by serving others. 
              This action will add {selectedAction.estimatedHours} hours to your service record and 
              help those in need.
            </Text>
          </Surface>

          {/* Continue Button */}
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.continueButton}
            contentStyle={styles.continueButtonContent}
            labelStyle={styles.continueButtonLabel}
          >
            Continue
          </Button>
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
  headerCard: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: Colors.background.secondary,
    marginBottom: 16,
    elevation: 3,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  hoursBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primary.light,
  },
  hoursText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary.main,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: Colors.background.secondary,
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  description: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  requirementsList: {
    gap: 12,
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  requirementText: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    flex: 1,
  },
  instructionsBox: {
    backgroundColor: Colors.primary.light,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  instructionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  timelineContainer: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary.main,
    marginTop: 4,
  },
  timelineDotFinal: {
    backgroundColor: '#10b981',
  },
  timelineLine: {
    width: 2,
    height: 32,
    backgroundColor: Colors.border.primary,
    marginLeft: 5,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  impactSection: {
    alignItems: 'center',
    backgroundColor: '#fef2f2',
  },
  impactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  impactText: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  continueButton: {
    borderRadius: 12,
    elevation: 2,
  },
  continueButtonContent: {
    paddingVertical: 8,
  },
  continueButtonLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
});

export default ActionDetailsScreen;
