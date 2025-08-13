/**
 * Onboarding Screen 2 - Struggle Recognition
 * 
 * Second onboarding screen that acknowledges the user's struggle and provides
 * encouragement with statistics and biblical support.
 * 
 * Features:
 * - Progress indicator (Step 1 of 9)
 * - Background image with overlay
 * - Encouraging message about not being alone
 * - Statistics card showing prevalence
 * - Bible verse for comfort
 * - Confidentiality assurance
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
import LinearGradient from 'react-native-linear-gradient';

import OnboardingButton from '../../components/OnboardingButton';
import OnboardingCard from '../../components/OnboardingCard';
import ProgressIndicator from '../../components/ProgressIndicator';
import { Colors } from '../../constants';

interface Onboarding1ScreenProps {
  navigation: any;
}

const { height: screenHeight } = Dimensions.get('window');

/**
 * Second Onboarding Screen Component
 * 
 * Acknowledges struggle and provides encouragement.
 */
const Onboarding1Screen: React.FC<Onboarding1ScreenProps> = ({ navigation }) => {
  
  const handleContinue = () => {
    navigation.navigate('Onboarding2');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button and Progress */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.progressWrapper}>
          <ProgressIndicator
            currentStep={1}
            totalSteps={9}
            variant="bars"
            showStepText={true}
          />
        </View>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Background Image with Overlay */}
        <ImageBackground
          source={{
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWlBkmCX9EhVIacDadxpdw8mVhN0wdFpj3MA-TweHRfKNbCX7wC4HtVM6rc1XLx1ENYUUbbOBtCTy5jJd2_Q4CodzsncQedSyZHMXUqVJ4JQe5jo8BXmdoAFNv0xc3t-TKqzgz66G3dxzsyJnnaOa9dSx5fFUkSMDiGZh3gfRF4Slit7vGJqj13F7d4Cg6L-jXeL-fAUZ11CkXtq_tWlFNzNvnFDxmY97Ild_IsYg4jPX88_IJcJJftR3EG-pi0CGPgY1yw2E8gvQO'
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              'rgba(18, 18, 18, 0.8)',
              'rgba(18, 18, 18, 1)',
            ]}
            style={styles.gradientOverlay}
          />
        </ImageBackground>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.mainTitle}>
            You Are Not Alone in This Battle
          </Text>
          
          <Text style={styles.subtitle}>
            It's okay to admit you're struggling. Many Christian men face this
            challenge, and you're not alone in seeking freedom.
          </Text>

          {/* Statistics Card */}
          <OnboardingCard style={styles.statisticsCard} withBorder>
            <Text style={styles.didYouKnowLabel}>
              DID YOU KNOW?
            </Text>
            <Text style={styles.statisticNumber}>
              68%
            </Text>
            <Text style={styles.statisticDescription}>
              of Christian men view pornography at least once a month.
            </Text>
          </OnboardingCard>

          {/* Bible Verse */}
          <View style={styles.verseContainer}>
            <Text style={styles.verseText}>
              "The Lord is close to the brokenhearted and saves those who are
              crushed in spirit."
            </Text>
            <Text style={styles.verseReference}>
              Psalm 34:18
            </Text>
          </View>

          {/* Confidentiality Message */}
          <Text style={styles.confidentialityText}>
            This is a safe, judgment-free space. Your journey is confidential, and
            we're here to support you.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <OnboardingButton
          title="Yes, I'm Ready for Freedom"
          onPress={handleContinue}
          variant="primary"
        />
        <Text style={styles.bottomNote}>
          Your information is kept strictly confidential.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.primary,
    zIndex: 20,
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120, // Space for bottom button
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight,
    width: '100%',
  },
  gradientOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    justifyContent: 'center',
    zIndex: 10,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  statisticsCard: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  didYouKnowLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  statisticNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  statisticDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  verseContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  verseText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 4,
  },
  verseReference: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  confidentialityText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(74, 74, 74, 0.3)',
  },
  bottomNote: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default Onboarding1Screen;
