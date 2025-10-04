import React from 'react';
import { View, StyleSheet, ScrollView, ImageBackground, Dimensions, Pressable } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, ScreenHeader } from '../components';
import { Colors } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');

const FastingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader 
        title="Fasting" 
        navigation={navigation}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="self-improvement" size={40} color={Colors.primary.main} />
          </View>
          <Text variant="headlineMedium" style={styles.heroTitle}>
            Draw Closer to God
          </Text>
          <Text variant="bodyLarge" style={styles.heroDescription}>
            Fasting is a powerful spiritual discipline that helps you focus on prayer and deepen your relationship with God.
          </Text>
        </View>

        {/* Benefits Cards */}
        <View style={styles.benefitsSection}>
          <Text variant="titleMedium" style={styles.sectionLabel}>
            Why Fast?
          </Text>
          
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <MaterialIcons name="spa" size={24} color={Colors.primary.main} />
              </View>
              <Text variant="labelLarge" style={styles.benefitTitle}>
                Spiritual Clarity
              </Text>
              <Text variant="bodySmall" style={styles.benefitText}>
                Clear your mind and hear God's voice more clearly
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <MaterialIcons name="favorite" size={24} color="#E63946" />
              </View>
              <Text variant="labelLarge" style={styles.benefitTitle}>
                Self-Control
              </Text>
              <Text variant="bodySmall" style={styles.benefitText}>
                Strengthen your discipline and resist temptation
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <MaterialIcons name="nights-stay" size={24} color="#457B9D" />
              </View>
              <Text variant="labelLarge" style={styles.benefitTitle}>
                Breakthrough
              </Text>
              <Text variant="bodySmall" style={styles.benefitText}>
                Experience breakthroughs in prayer and faith
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <MaterialIcons name="healing" size={24} color="#06A77D" />
              </View>
              <Text variant="labelLarge" style={styles.benefitTitle}>
                Inner Healing
              </Text>
              <Text variant="bodySmall" style={styles.benefitText}>
                Find emotional and spiritual restoration
              </Text>
            </View>
          </View>
        </View>

        {/* Testimonial Card */}
        <View style={styles.testimonialSection}>
          <Text variant="titleMedium" style={styles.sectionLabel}>
            Victory Stories
          </Text>
          
          <Pressable 
            style={styles.testimonialCard}
            onPress={() => {}}
          >
            <ImageBackground
              source={require('../../assets/images/appbackgroundimage.png')}
              style={styles.testimonialBg}
              imageStyle={styles.testimonialImage}
            >
              <View style={styles.overlay} />
              <View style={styles.testimonialContent}>
                <View style={styles.quoteIcon}>
                  <MaterialIcons name="format-quote" size={32} color="rgba(255,255,255,0.9)" />
                </View>
                <Text variant="titleLarge" style={styles.testimonialTitle}>
                  From Chains to Freedom
                </Text>
                <Text variant="bodyMedium" style={styles.testimonialDescription}>
                  "I overcame a 10-year addiction through fasting and prayer. God's grace is real and His power transforms lives."
                </Text>
                <View style={styles.testimonialFooter}>
                  <Text variant="bodySmall" style={styles.testimonialAuthor}>
                    - Michael's Story
                  </Text>
                  <View style={styles.readMoreChip}>
                    <Text style={styles.readMoreText}>Read More</Text>
                    <MaterialIcons name="arrow-forward" size={16} color={Colors.primary.main} />
                  </View>
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        </View>

        {/* Prayer Guide Section */}
        <View style={styles.prayerSection}>
          <Text variant="titleMedium" style={styles.sectionLabel}>
            Prayer During Fasting
          </Text>
          
          <Card style={styles.prayerCard}>
            <Card.Content style={styles.prayerContent}>
              <View style={styles.prayerIconBg}>
                <MaterialIcons name="auto-awesome" size={28} color={Colors.primary.main} />
              </View>
              <View style={styles.prayerTextContainer}>
                <Text variant="titleSmall" style={styles.prayerTitle}>
                  Recommended Prayers
                </Text>
                <Text variant="bodyMedium" style={styles.prayerDescription}>
                  Focus on prayers for strength, guidance, and breakthrough. Prayer is essential in overcoming addiction.
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Start Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={styles.startButton}
            labelStyle={styles.startButtonText}
            icon={() => <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />}
            onPress={() => navigation.navigate('StartFast')}
          >
            Start Fasting Journey
          </Button>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  
  // Hero Section
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 153, 61, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
  },
  heroDescription: {
    color: '#4a4a4a',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Benefits Section
  benefitsSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionLabel: {
    color: '#1a1a1a',
    marginBottom: 16,
    paddingHorizontal: 8,
    fontWeight: '600',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  benefitCard: {
    width: (screenWidth - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    color: '#1a1a1a',
    marginBottom: 6,
    fontWeight: '600',
  },
  benefitText: {
    color: '#6a6a6a',
    lineHeight: 18,
  },

  // Testimonial Section
  testimonialSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  testimonialCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  testimonialBg: {
    height: 280,
  },
  testimonialImage: {
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  testimonialContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  quoteIcon: {
    opacity: 0.5,
  },
  testimonialTitle: {
    color: '#FFFFFF',
    marginBottom: 12,
    fontWeight: '700',
    marginTop: -8,
  },
  testimonialDescription: {
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 22,
    fontStyle: 'italic',
    flex: 1,
  },
  testimonialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  testimonialAuthor: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  readMoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  readMoreText: {
    color: Colors.primary.main,
    fontSize: 13,
    fontWeight: '600',
  },

  // Prayer Section
  prayerSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  prayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  prayerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  prayerIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 153, 61, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  prayerTextContainer: {
    flex: 1,
  },
  prayerTitle: {
    color: '#1a1a1a',
    marginBottom: 8,
    fontWeight: '600',
  },
  prayerDescription: {
    color: '#6a6a6a',
    lineHeight: 20,
  },

  // Buttons
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  startButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 24,
  },
});

export default FastingScreen;