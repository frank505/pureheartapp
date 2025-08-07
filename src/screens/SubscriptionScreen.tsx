/**
 * SubscriptionScreen Component
 * 
 * Premium subscription and upgrade screen.
 * Features subscription plans, pricing, and upgrade options.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';

interface SubscriptionScreenProps {
  navigation?: any;
  route?: any;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ navigation }) => {
  const [currentPlan] = useState('Basic Plan');
  
  const handleGoBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleUpgradePlan = (planType: string) => {
    Alert.alert(
      `Upgrade to ${planType}`,
      `Start your premium journey with ${planType}`,
      [{ text: 'Cancel' }, { text: 'Continue', onPress: () => {} }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon 
            name={Icons.navigation.back.name} 
            color={Colors.text.primary} 
            size="md" 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Plan</Text>
          <Surface style={styles.currentPlanCard} elevation={2}>
            <View style={styles.planInfo}>
              <View style={styles.planIcon}>
                <Icon 
                  name="shield-checkmark-outline" 
                  color={Colors.text.secondary} 
                  size="lg" 
                />
              </View>
              <View style={styles.planDetails}>
                <Text style={styles.planName}>{currentPlan}</Text>
                <Text style={styles.planPrice}>Free</Text>
                <Text style={styles.planDescription}>Limited features</Text>
              </View>
            </View>
          </Surface>
        </View>

        {/* Upgrade Banner */}
        <View style={styles.section}>
          <Surface style={styles.upgradeBanner} elevation={2}>
            <View style={styles.bannerContent}>
              <View style={styles.bannerIcon}>
                <Icon 
                  name="diamond-outline" 
                  color={Colors.primary.main} 
                  size="xl" 
                />
              </View>
              <View style={styles.bannerDetails}>
                <Text style={styles.bannerTitle}>Unlock Your Full Potential</Text>
                <Text style={styles.bannerSubtitle}>Get access to premium features and personalized support</Text>
              </View>
            </View>
          </Surface>
        </View>

        {/* Premium Plans Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          
          {/* Premium Plan */}
          <Surface style={styles.premiumCard} elevation={3}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>MOST POPULAR</Text>
            </View>
            <View style={styles.planHeader}>
              <Text style={styles.premiumTitle}>Premium</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceAmount}>$9.99</Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>
              <Text style={styles.priceDescription}>7-day free trial</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => handleUpgradePlan('Premium')}
            >
              <Text style={styles.upgradeButtonText}>Start Free Trial</Text>
            </TouchableOpacity>
            
            <View style={styles.featuresList}>
              <View style={styles.feature}>
                <Icon name="checkmark-circle" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Unlimited access to all content</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-circle" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>AI-powered personalized support</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-circle" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Advanced progress tracking</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-circle" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Exclusive community features</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-circle" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Priority customer support</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-circle" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Ad-free experience</Text>
              </View>
            </View>
          </Surface>

          {/* Couples Plan */}
          <Surface style={styles.couplesPlan} elevation={2}>
            <View style={styles.planHeader}>
              <Text style={styles.couplesTitle}>Couples</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceAmount}>$14.99</Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>
              <Text style={styles.priceDescription}>For couples on the journey together</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.couplesButton}
              onPress={() => handleUpgradePlan('Couples')}
            >
              <Text style={styles.couplesButtonText}>Choose Plan</Text>
            </TouchableOpacity>
            
            <View style={styles.featuresList}>
              <View style={styles.feature}>
                <Icon name="checkmark-circle" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>All Premium features</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-circle" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Shared progress tracking</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-circle" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Couples-specific content</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-circle" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Enhanced communication tools</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="checkmark-circle" color={Colors.primary.main} size="sm" />
                <Text style={styles.featureText}>Relationship coaching</Text>
              </View>
            </View>
          </Surface>
        </View>

        {/* Money Back Guarantee */}
        <View style={styles.section}>
          <Surface style={styles.guaranteeCard} elevation={1}>
            <View style={styles.guaranteeContent}>
              <Icon 
                name="shield-checkmark" 
                color={Colors.secondary.main} 
                size="lg" 
              />
              <View style={styles.guaranteeText}>
                <Text style={styles.guaranteeTitle}>30-Day Money Back Guarantee</Text>
                <Text style={styles.guaranteeDescription}>
                  If you're not completely satisfied, get a full refund within 30 days
                </Text>
              </View>
            </View>
          </Surface>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <Surface style={styles.faqCard} elevation={1}>
            <TouchableOpacity style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
              <Icon name="chevron-down-outline" color={Colors.text.secondary} size="sm" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What's included in the free trial?</Text>
              <Icon name="chevron-down-outline" color={Colors.text.secondary} size="sm" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How does the couples plan work?</Text>
              <Icon name="chevron-down-outline" color={Colors.text.secondary} size="sm" />
            </TouchableOpacity>
          </Surface>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 96,
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
    paddingHorizontal: 8,
  },

  // Current Plan
  currentPlanCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 20,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  planIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planDetails: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },

  // Upgrade Banner
  upgradeBanner: {
    backgroundColor: `${Colors.primary.main}15`,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: `${Colors.primary.main}30`,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.primary.main}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerDetails: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },

  // Premium Plans
  premiumCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  planHeader: {
    marginBottom: 20,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.text.primary,
    lineHeight: 56,
  },
  pricePeriod: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  priceDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  upgradeButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  featuresList: {
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },

  // Couples Plan
  couplesPlan: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 24,
  },
  couplesTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  couplesButton: {
    backgroundColor: Colors.secondary.main,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  couplesButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },

  // Guarantee
  guaranteeCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 20,
  },
  guaranteeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  guaranteeText: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  guaranteeDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 18,
  },

  // FAQ
  faqCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 0,
    overflow: 'hidden',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.primary,
    marginHorizontal: 20,
  },
});

export default SubscriptionScreen;