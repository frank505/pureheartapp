"use client"
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmergencyStackParamList } from '../navigation/EmergencyStack';
import Icon from '../components/Icon';
import { IconNames } from '../constants/Icons';
import { Colors } from '../constants';
import LinearGradient from 'react-native-linear-gradient';
import { responsiveFontSizes, responsiveSpacing, scaleFontSize } from '../utils/responsive';

type BreatheScreenProps = NativeStackScreenProps<EmergencyStackParamList, 'BreatheScreen'>;

const { width, height } = Dimensions.get('window');

const BreatheScreen: React.FC<BreatheScreenProps> = ({ navigation }) => {
  // Add safe area insets
  const insets = useSafeAreaInsets?.() ?? { top: 0, bottom: 0 } as any;
  const [isAnimating, setIsAnimating] = useState(false);
  const [counter, setCounter] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  // Add JS-driven progress value for width
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const breathingPattern = [
    { phase: 'inhale', duration: 4000, instruction: 'Inhale slowly...' },
    { phase: 'hold', duration: 2000, instruction: 'Hold your breath...' },
    { phase: 'exhale', duration: 6000, instruction: 'Exhale gently...' },
  ];

  useEffect(() => {
    if (isAnimating) {
      // Start counter
      intervalRef.current = setInterval(() => {
        setCounter(prev => prev + 1);
      }, 1000);

      // Start breathing animation cycle
      startBreathingCycle();
      
      // Start glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      // Cleanup intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (phaseIntervalRef.current) {
        clearInterval(phaseIntervalRef.current);
      }
      
      // Reset animations
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0.3);
      rippleAnim.setValue(0);
      glowAnim.setValue(0);
      // Reset progress when stopping
      progressAnim.setValue(0);
      setCounter(0);
      setCurrentPhase('inhale');
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (phaseIntervalRef.current) {
        clearInterval(phaseIntervalRef.current);
      }
    };
  }, [isAnimating]);

  const startBreathingCycle = () => {
    let currentPatternIndex = 0;
    
    const runPhase = () => {
      const pattern = breathingPattern[currentPatternIndex];
      setCurrentPhase(pattern.phase as any);
      
      // Scale animation based on phase
      const targetScale = pattern.phase === 'exhale' ? 0.5 : pattern.phase === 'inhale' ? 1.3 : 1.1;
      const targetOpacity = pattern.phase === 'exhale' ? 0.4 : 0.9;
      
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: targetScale,
          duration: pattern.duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: targetOpacity,
          duration: pattern.duration,
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: pattern.duration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        rippleAnim.setValue(0);
      });

      // Animate progress bar for this phase using JS driver
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: pattern.duration,
        useNativeDriver: false,
      }).start();

      currentPatternIndex = (currentPatternIndex + 1) % breathingPattern.length;
    };
    
    runPhase(); // Start first phase immediately
    phaseIntervalRef.current = setInterval(runPhase, 4000); // Cycle every 4 seconds average
  };

  const getCurrentInstruction = () => {
    const pattern = breathingPattern.find(p => p.phase === currentPhase);
    return pattern ? pattern.instruction : 'Breathe naturally...';
  };

  const handleStartStop = () => {
    setIsAnimating(!isAnimating);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#0f0c29', '#24243e', '#302b63']}
        style={styles.container}
      >
        {/* Background particles/stars effect (ignore touches) */}
        <View pointerEvents="none" style={styles.starsContainer}>
          {[...Array(20)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.star,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 0.8],
                  }),
                }
              ]}
            />
          ))}
        </View>

        <SafeAreaView style={styles.safeAreaContent}>
          {/* Header with safe area top padding */}
          <View style={[styles.header, { paddingTop: Math.max(10, (insets?.top ?? 0) + 4) }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.backButtonGradient}
              >
                <Icon name={IconNames.navigation.back} size={responsiveFontSizes.iconMedium} color="white" />
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>Session Time</Text>
              <Text style={styles.timeText}>{formatTime(counter)}</Text>
            </View>
          </View>

          {/* Main breathing area */}
          <View style={styles.mainContent}>
            <View style={styles.instructionContainer}>
              <Text style={styles.phaseText}>{currentPhase.toUpperCase()}</Text>
              <Text style={styles.instructionText}>
                {isAnimating ? getCurrentInstruction() : 'Tap start to begin your breathing session'}
              </Text>
            </View>

            {/* Breathing circle with ripple effects */}
            <View style={styles.breathingContainer}>
              {/* Outer ripple rings */}
              {[0, 1, 2].map((index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.rippleRing,
                    {
                      transform: [{
                        scale: rippleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1 + index * 0.1, 1.5 + index * 0.2],
                        })
                      }],
                      opacity: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6 - index * 0.2, 0],
                      }),
                    }
                  ]}
                />
              ))}
              
              {/* Main breathing circle */}
              <Animated.View
                style={[
                  styles.breathingCircle,
                  {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                  }
                ]}
              >
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  style={styles.circleGradient}
                >
                  <View style={styles.innerCircle}>
                    <Animated.View
                      style={[
                        styles.glowEffect,
                        {
                          shadowOpacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 0.8],
                          }),
                        }
                      ]}
                    />
                    <Text style={styles.breatheText}>BREATHE</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Progress indicator */}
            {isAnimating && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 200],
                          extrapolate: 'clamp',
                        }),
                      }
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Bottom controls with safe area bottom padding */}
          <View style={[styles.bottomContainer, { 
            paddingBottom: Math.max(20, (insets?.bottom ?? 0) + 12),
            }]}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handleStartStop}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isAnimating ? ['#ff6b6b', '#ee5a52'] : ['#4facfe', '#00f2fe']}
                style={styles.buttonGradient}
              >
                <Icon 
                  name={isAnimating ? "pause" : "play"} 
                  size={24} 
                  color="white" 
                  style={styles.buttonIcon} 
                />
                <Text style={styles.buttonText}>
                  {isAnimating ? 'Pause Session' : 'Start Breathing'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
           
          </View>
          
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0c29',
  },
  container: {
    flex: 1,
  },
  safeAreaContent: {
    flex: 1,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 90,
    paddingHorizontal: responsiveSpacing.md,
    paddingBottom: responsiveSpacing.md,
    zIndex: 10,
  },
  backButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  backButtonGradient: {
    padding: 0,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: responsiveFontSizes.caption,
    fontWeight: '500',
    marginBottom: 2,
  },
  timeText: {
    color: 'white',
    fontSize: responsiveFontSizes.timeText,
    fontWeight: '300',
    fontFamily: 'System',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveSpacing.md,
    zIndex: 5,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  phaseText: {
    color: '#4facfe',
    fontSize: responsiveFontSizes.body,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 10,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: responsiveFontSizes.headerSubtitle,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  rippleRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  breathingCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
  },
  circleGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'transparent',
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    elevation: 10,
  },
  breatheText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 4,
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 20,
    width: 200,
    alignItems: 'center',
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 2,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    zIndex: 10,
    // borderColor:"red",
    // backgroundColor:"red"
  },
  controlButton: {
    borderRadius: 25,
    height:50,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 0,
    marginTop:30
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  homeIndicator: {
    alignSelf: 'center',
    width: 134,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 100,
    marginTop: 15,
  },
});

export default BreatheScreen;