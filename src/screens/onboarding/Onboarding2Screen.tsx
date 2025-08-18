/**
 * Onboarding Screen 3 - Vision of Freedom
 * 
 * Third onboarding screen that paints a picture of life free from struggle.
 * Shows the benefits and positive outcomes of transformation.
 * 
 * Features:
 * - Progress indicator (Step 2 of 7)
 * - Split background image
 * - Vision of freedom message
 * - Benefits list with icons
 * - Bible verse for encouragement
 * - Commitment question and action
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import OnboardingButton from '../../components/OnboardingButton';
import ProgressIndicator from '../../components/ProgressIndicator';
import { Colors } from '../../constants';
import { responsiveFontSizes, responsiveSpacing } from '../../utils/responsive';

interface Onboarding2ScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

/**
 * Third Onboarding Screen Component
 * 
 * Shows vision of life free from struggle.
 */
const Onboarding2Screen: React.FC<Onboarding2ScreenProps> = ({ navigation }) => {
  
  const handleContinue = () => {
    navigation.navigate('Onboarding3');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button and Progress */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.progressWrapper}>
            <ProgressIndicator
              currentStep={2}
              totalSteps={9}
              variant="bars"
              showStepText={true}
            />
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Split Background Images */}
        <View style={styles.imageContainer}>
          <View style={styles.imageRow}>
            <ImageBackground
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBV4HHu9kpZIzuEy9tM_-sylW_peQZ8tMrN5WcQNvAiZUaWviX879eOpTST2dMFrEnplBPpWsO5iMzphAj-yt5zbvslOGyFp9i9O0SvaUByh31AVOOjOKPP54XH4U6gXvjVoGWgmoOK-D_pJF7bCqu0Th0WLYVZlCiX7PV85n0h5xLiHrkTxk68G8nlRuXO8t1GoZTJGAesBcKxmNsZ2gKo67PoXDDcuWotFTyVKBqDmawxRYp-1CLI-QIxtH0_XAqA6x_gGs0hFAjl'
              }}
              style={[styles.backgroundImage, styles.leftImage]}
              resizeMode="cover"
            >
              <View style={styles.imageOverlay} />
            </ImageBackground>
            
            <ImageBackground
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBV4HHu9kpZIzuEy9tM_-sylW_peQZ8tMrN5WcQNvAiZUaWviX879eOpTST2dMFrEnplBPpWsO5iMzphAj-yt5zbvslOGyFp9i9O0SvaUByh31AVOOjOKPP54XH4U6gXvjVoGWgmoOK-D_pJF7bCqu0Th0WLYVZlCiX7PV85n0h5xLiHrkTxk68G8nlRuXO8t1GoZTJGAesBcKxmNsZ2gKo67PoXDDcuWotFTyVKBqDmawxRYp-1CLI-QIxtH0_XAqA6x_gGs0hFAjl'
              }}
              style={[styles.backgroundImage, styles.rightImage]}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.mainTitle}>
            Imagine Your Life Free from This Struggle
          </Text>

          {/* Benefits List */}
          <View style={styles.benefitsList}>
            {/* Restored Relationships */}
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Text style={styles.iconText}>👥</Text>
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>
                  Restored Relationships
                </Text>
                <Text style={styles.benefitDescription}>
                  Experience deeper connections with loved ones, built on trust and authenticity.
                </Text>
              </View>
            </View>

            {/* Intimacy with God */}
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Text style={styles.iconText}>🙏</Text>
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>
                  Intimacy with God
                </Text>
                <Text style={styles.benefitDescription}>
                  Find solace and guidance in your faith, strengthening your spiritual foundation.
                </Text>
              </View>
            </View>
          </View>

          {/* Bible Verse Card */}
          <View style={styles.verseCard}>
            <Text style={styles.verseText}>
              "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!"
            </Text>
            <Text style={styles.verseReference}>
              2 Corinthians 5:17
            </Text>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Text style={styles.commitmentQuestion}>
            Are you ready to commit to this transformation?
          </Text>
          
          <OnboardingButton
            title="Yes, Transform My Life"
            onPress={handleContinue}
            variant="primary"
            style={styles.actionButton}
          />
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
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.text.primary,
  },
  progressWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  imageContainer: {
    height: 192,
    marginBottom: 32,
  },
  imageRow: {
    flexDirection: 'row',
    height: '100%',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftImage: {
    marginRight: 1,
  },
  rightImage: {
    marginLeft: 1,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    paddingHorizontal: responsiveSpacing.lg,
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: responsiveFontSizes.mainTitle,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 32,
  },
  benefitsList: {
    gap: 20,
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: responsiveFontSizes.headerTitle,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: responsiveFontSizes.body,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: responsiveFontSizes.bodySmall,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  verseCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.5)',
    borderRadius: 12,
    padding: responsiveSpacing.lg,
    alignItems: 'center',
  },
  verseText: {
    fontSize: responsiveFontSizes.body,
    color: Colors.text.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 8,
  },
  verseReference: {
    fontSize: responsiveFontSizes.bodySmall,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: responsiveSpacing.lg,
    paddingBottom: 32,
    alignItems: 'center',
  },
  commitmentQuestion: {
    fontSize: responsiveFontSizes.headerSubtitle,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButton: {
    height: 56,
  },
});

export default Onboarding2Screen;
