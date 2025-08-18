/**
 * EmergencyScreen Component
 * 
 * Emergency Support Center with immediate help options.
 * Features crisis support, spiritual guidance, and emergency contacts.
 * Designed to provide immediate assistance during spiritual struggles.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Text,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, ProfileDropdown, ScreenHeader, EmergencyPartnerSelectModal } from '../components';
import { Colors, Icons } from '../constants';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTodaysRecommendation } from '../store/slices/recommendationsSlice';

const { width: screenWidth } = Dimensions.get('window');

interface EmergencyScreenProps {
  navigation?: any;
  route?: any;
}

const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ navigation }) => {
  const [feelingText, setFeelingText] = useState('');
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const dispatch = useAppDispatch();
  const { today: todaysRecommendation } = useAppSelector((state) => state.recommendations);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonAnimations = useRef(Array(5).fill(0).map(() => new Animated.Value(0))).current;
 
  useEffect(() => {
    dispatch(fetchTodaysRecommendation());
    
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for emergency button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered button animations
    buttonAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 100 + 300,
        useNativeDriver: true,
      }).start();
    });
  }, [dispatch]);

  // Enhanced button press animation
  const animateButtonPress = (callback: () => void) => {
    const scaleAnim = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  // Handle main emergency button
  const handleEmergencyHelp = () => {
    Alert.alert(
      'I Need Help Now',
      'This will immediately contact your accountability partner and emergency contacts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Get Help', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Help is on the way', 'Your accountability partner and emergency contacts have been notified.');
          }
        }
      ]
    );
  };

  // Handle immediate actions
  const handleBreatheWithJesus = () => {
    navigation?.navigate('BreatheScreen');
  };

  const handleSpeakTruth = () => {
    Alert.alert('Speak Truth Now', 'Opening scripture verses for this moment...');
  };

  const handleCallBrother = () => {
    setShowPartnerModal(true);
  };

  const handleWorshipRedirect = () => {
    navigation?.navigate('WorshipScreen');
  };

  // Handle emergency contacts
  const handleCallMgBrother = () => {
    if (navigation) navigation.navigate('PartnersList');
  };

  const handleTextPartner = () => {
    if (navigation) navigation.navigate('PartnersList');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header with Gradient Background */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScreenHeader title="Emergency" iconName="alert-circle" iconColor={Colors.error.main} navigation={navigation} />
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Enhanced Main Emergency Button */}
          <View style={styles.emergencyButtonContainer}>
            <Animated.View
              style={[
                styles.emergencyButtonWrapper,
                {
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.mainEmergencyButton}
                onPress={() => animateButtonPress(handleEmergencyHelp)}
                activeOpacity={0.8}
              >
                <View style={styles.emergencyButtonContent}>
                  <View style={styles.emergencyIconContainer}>
                    <Icon 
                      name="alert-circle" 
                      color={Colors.white} 
                      size="lg" 
                    />
                  </View>
                  <Text style={styles.emergencyButtonText}>I NEED HELP NOW</Text>
                  <Text style={styles.emergencySubText}>Immediate Support Available</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Enhanced Immediate Actions Section */}
          <Animated.View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="flash" color={Colors.primary.main} size="sm" />
              <Text style={styles.sectionTitle}>Immediate Actions</Text>
            </View>
            <View style={styles.actionGrid}>
              {[
                { 
                  title: 'Breathe with Jesus', 
                  icon: 'heart-outline', 
                  onPress: handleBreatheWithJesus,
                  color: Colors.primary.main,
                  description: 'Guided breathing exercises'
                },
                // { 
                //   title: 'Speak Truth Now', 
                //   icon: 'book-outline', 
                //   onPress: handleSpeakTruth,
                //   color: Colors.secondary.main,
                //   description: 'Scripture verses for strength'
                // },
                { 
                  title: 'Call My Brother', 
                  icon: 'call-outline', 
                  onPress: handleCallBrother,
                  color: Colors.primary.light,
                  description: 'Connect with accountability partner'
                },
                // { 
                //   title: 'Worship & Redirect', 
                //   icon: 'musical-notes-outline', 
                //   onPress: handleWorshipRedirect,
                //   color: Colors.warning.main,
                //   description: 'Uplifting worship music'
                // },
                { 
                  title: 'Emergency AI Support', 
                  icon: 'chatbubble-ellipses-outline', 
                  onPress: () => navigation?.navigate('AISessions'),
                  color: Colors.primary.dark,
                  description: 'Immediate guidance. Private and 24/7.'
                }
              ].map((action, index) => (
                <Animated.View
                  key={action.title}
                  style={[
                    {
                      opacity: buttonAnimations[index],
                      transform: [{
                        translateX: buttonAnimations[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0]
                        })
                      }]
                    }
                  ]}
                >
                  <TouchableOpacity 
                    style={[styles.actionButton, { borderLeftColor: action.color, borderLeftWidth: 4 }]}
                    onPress={() => animateButtonPress(action.onPress)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionButtonContent}>
                      <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                        <Icon 
                          name={action.icon} 
                          color={action.color} 
                          size="md" 
                        />
                      </View>
                      <View style={styles.actionTextContainer}>
                        <Text style={styles.actionButtonText}>{action.title}</Text>
                        <Text style={styles.actionButtonDescription}>{action.description}</Text>
                      </View>
                    </View>
                    <View style={styles.chevronContainer}>
                      <Icon 
                        name="chevron-forward-outline" 
                        color={Colors.text.secondary} 
                        size="sm" 
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

        
        </Animated.View>
      </ScrollView>

      {/* Floating Emergency Hotline Button */}
      <Animated.View 
        style={[
          styles.floatingButton,
          {
            opacity: fadeAnim,
            transform: [{ scale: fadeAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.floatingButtonInner}
          onPress={() => Alert.alert('Emergency Hotline', 'Calling emergency support...')}
          activeOpacity={0.8}
        >
          <Icon name="call" color={Colors.white} size="md" />
          <Text style={styles.floatingButtonText}>24/7 Help</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Emergency Partner Select Modal */}
      <EmergencyPartnerSelectModal
        visible={showPartnerModal}
        onDismiss={() => setShowPartnerModal(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  // Enhanced Header Styles
  header: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.tertiary,
    backgroundColor: Colors.background.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 24,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  
  // Enhanced Emergency Button
  emergencyButtonContainer: {
    paddingHorizontal: 8,
    marginBottom: 40,
    alignItems: 'center',
  },
  emergencyButtonWrapper: {
    shadowColor: Colors.error.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  mainEmergencyButton: {
    backgroundColor: Colors.error.main,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 40,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth - 64,
  },
  emergencyButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyIconContainer: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  emergencyButtonText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 4,
  },
  emergencySubText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
  },

  // Enhanced Sections
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    marginLeft: 12,
  },

  // Enhanced Action Grid
  actionGrid: {
    gap: 16,
    paddingHorizontal: 4,
  },
  actionButton: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.background.tertiary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  actionButtonDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.text.secondary,
    opacity: 0.8,
  },
  chevronContainer: {
    backgroundColor: Colors.background.tertiary,
    padding: 8,
    borderRadius: 8,
  },

  // Quick Access Card
  quickAccessCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.background.tertiary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickAccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickAccessTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginLeft: 12,
  },
  quickAccessText: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  quickAccessButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  quickAccessButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },

  // Floating Emergency Button
  floatingButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    zIndex: 1000,
  },
  floatingButtonInner: {
    backgroundColor: Colors.error.main,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Scripture Card (keeping existing styles for now)
  scriptureCard: {
    height: 224,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  scriptureCardImage: {
    borderRadius: 16,
  },
  scriptureOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  scriptureContent: {
    padding: 20,
  },
  scriptureReference: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  scriptureText: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.white,
    lineHeight: 20,
    opacity: 0.9,
  },

  // Contact List (keeping existing styles for now)
  contactList: {
    gap: 12,
    paddingHorizontal: 4,
  },
  contactButton: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.background.tertiary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  contactText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },

  // Feeling Check-In (keeping existing styles for now)
  checkInContainer: {
    paddingHorizontal: 16,
  },
  feelingInput: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.background.tertiary,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default EmergencyScreen;