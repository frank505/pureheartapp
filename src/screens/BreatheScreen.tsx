"use client"
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, StatusBar, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmergencyStackParamList } from '../navigation/EmergencyStack';
import Icon from '../components/Icon';
import { IconNames } from '../constants/Icons';
import { Colors } from '../constants';
import LinearGradient from 'react-native-linear-gradient';
import { responsiveFontSizes, responsiveSpacing, scaleFontSize } from '../utils/responsive';
import Video from 'react-native-video';
import { analyzeBreathe, BreatheAnalysisResult } from '../services/breatheService';

type BreatheScreenProps = NativeStackScreenProps<EmergencyStackParamList, 'BreatheScreen'>;

const { width, height } = Dimensions.get('window');

const BreatheScreen: React.FC<BreatheScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets?.() ?? { top: 0, bottom: 0 } as any;
  
  // Core state
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [counter, setCounter] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [currentScripture, setCurrentScripture] = useState<number>(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [analysis, setAnalysis] = useState<BreatheAnalysisResult | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  // Scripture texts
  const [scriptures, setScriptures] = useState<string[]>([
    "Jesus still loves you and is passionate about you",
    "Be still, and know that I am God. - Psalm 46:10",
    "When you pass through the waters, I will be with you. - Isaiah 43:2",
    "He is so loving and compassionate towards you",
    "I can do all things through Christ who strengthens me. - Philippians 4:13",
    "The Lord is my shepherd; I shall not want. - Psalm 23:1",
    "Cast your burden on the Lord, and he will sustain you. - Psalm 55:22"
  ]);
  
  // Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioSupported, setAudioSupported] = useState(true); // Track if audio is supported
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scriptureOpacity = useRef(new Animated.Value(0)).current;
  const scriptureTranslateY = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Refs for cleanup
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scriptureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialTextRef = useRef<string | undefined>(route?.params?.initialText);

  // Breathing pattern configuration
  const breathingPattern = [
    { phase: 'inhale', duration: 4000, instruction: 'Inhale slowly...' },
    { phase: 'hold', duration: 2000, instruction: 'Hold your breath...' },
    { phase: 'exhale', duration: 6000, instruction: 'Exhale gently...' },
  ];

  // Cleanup function
  const cleanupAnimations = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (phaseIntervalRef.current) {
      clearInterval(phaseIntervalRef.current);
      phaseIntervalRef.current = null;
    }
    if (scriptureIntervalRef.current) {
      clearInterval(scriptureIntervalRef.current);
      scriptureIntervalRef.current = null;
    }
  };

  // Reset animations to initial state
  const resetAnimations = () => {
    scaleAnim.setValue(0.7);
    opacityAnim.setValue(0.3);
    rippleAnim.setValue(0);
    glowAnim.setValue(0);
    progressAnim.setValue(0);
    scriptureOpacity.setValue(0);
    scriptureTranslateY.setValue(50);
    setCounter(0);
    setCurrentPhase('inhale');
  };

  // Scripture animation handler
  const animateScripture = () => {
    setCurrentScripture(current => (current + 1) % scriptures.length);
    
    // Reset and animate in new scripture
    scriptureTranslateY.setValue(50);
    scriptureOpacity.setValue(0);
    
    Animated.parallel([
      Animated.timing(scriptureOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scriptureTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Start breathing cycle with proper phases
  const startBreathingCycle = () => {
    let currentPatternIndex = 0;
    
    // Initialize scripture animation only if not paused
    if (!isPaused) {
      animateScripture();
    }
    
    // Start or resume scripture cycling
    if (scriptureIntervalRef.current) clearInterval(scriptureIntervalRef.current);
    if (!isPaused) {
      scriptureIntervalRef.current = setInterval(animateScripture, 12000);
    }
    
    // Start glow effect
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
    
    const runPhase = () => {
      const pattern = breathingPattern[currentPatternIndex];
      setCurrentPhase(pattern.phase as any);
      
      // Calculate animation targets based on phase
      const targetScale = pattern.phase === 'exhale' ? 0.5 : 
                          pattern.phase === 'inhale' ? 1.3 : 1.1;
      const targetOpacity = pattern.phase === 'exhale' ? 0.4 : 0.9;
      
      // Animate breathing circle
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

      // Animate progress bar
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: pattern.duration,
        useNativeDriver: false,
      }).start();

      currentPatternIndex = (currentPatternIndex + 1) % breathingPattern.length;
    };
    
    // Start first phase immediately
    runPhase();
    
    // Set up phase cycling
    if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
    phaseIntervalRef.current = setInterval(() => {
      runPhase();
    }, 4000);
  };

  // Get current breathing instruction
  const getCurrentInstruction = () => {
    const pattern = breathingPattern.find(p => p.phase === currentPhase);
    return pattern ? pattern.instruction : 'Breathe naturally...';
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Validate audio URL and format
  const isValidAudioUrl = (url: string) => {
    try {
      Alert.alert(url);
      new URL(url);
      // Check for supported audio formats
      const supportedFormats = ['.mp3', '.m4a', '.aac', '.wav', '.ogg', '.mp4'];
      const urlLower = url.toLowerCase();
      
      // First check for explicit format extensions
      const hasValidExtension = supportedFormats.some(format => urlLower.includes(format));
      
      // Also check for common audio-related keywords in URL
      const hasAudioKeywords = urlLower.includes('audio') || 
                              urlLower.includes('mp3') ||
                              urlLower.includes('m4a') ||
                              urlLower.includes('aac') ||
                              urlLower.includes('wav');
      
      // Reject known problematic formats or streaming services that might not work
      const isProblematicUrl = urlLower.includes('youtube') || 
                               urlLower.includes('spotify') ||
                               urlLower.includes('soundcloud') ||
                               urlLower.includes('.wma') ||
                               urlLower.includes('.flac');
      
      return (hasValidExtension || hasAudioKeywords) && !isProblematicUrl;
    } catch {
      return false;
    }
  };

  // Handle pause/resume breathing session
  const handlePauseResume = () => {
    if (isPaused) {
      // Resuming - restart scripture cycling from current position
      setIsPaused(false);
    } else {
      // Pausing - stop scripture cycling but keep current text visible
      setIsPaused(true);
      if (scriptureIntervalRef.current) {
        clearInterval(scriptureIntervalRef.current);
        scriptureIntervalRef.current = null;
      }
    }
  };

  // Handle complete reset - clear analysis and start fresh
  const handleReset = async () => {
    try {
      setIsResetting(true);
      
      // Stop current session
      setIsAnimating(false);
      setIsPaused(false);
      cleanupAnimations();
      resetAnimations();
      
      // Clear previous analysis and audio
      setAnalysis(null);
      setAudioUrl(null);
      setAudioError(null);
      setAudioSupported(true); // Reset audio support flag
      
      // Reset scriptures to default
      setScriptures([
        "Jesus still loves you and is passionate about you",
        "Be still, and know that I am God. - Psalm 46:10",
        "When you pass through the waters, I will be with you. - Isaiah 43:2",
        "He is so loving and compassionate towards you",
        "I can do all things through Christ who strengthens me. - Philippians 4:13",
        "The Lord is my shepherd; I shall not want. - Psalm 23:1",
        "Cast your burden on the Lord, and he will sustain you. - Psalm 55:22"
      ]);
      
      // Start fresh session with new API call
      console.log('Resetting and fetching new breath analysis...');
      const payload = {
        text: initialTextRef.current || 'I want to slow down and breathe with Jesus.',
        cycles: 3,
      };
      
      const result = await analyzeBreathe(payload);
      console.log('New analysis result:', result);
      
      setAnalysis(result);
      
      // Update scriptures if available
      if (result?.textAndScriptures?.length) {
        const validScriptures = result.textAndScriptures.filter(Boolean);
        if (validScriptures.length > 0) {
          setScriptures(validScriptures);
        }
      }
      
        // Set audio URL if available and supported
        if (result?.asmrAudioUrl && isValidAudioUrl(result.asmrAudioUrl)) {
          console.log('Setting new audio URL:', result.asmrAudioUrl);
          setAudioUrl(result.asmrAudioUrl);
        } else {
          console.log('No valid/supported audio URL provided:', result?.asmrAudioUrl);
          setAudioUrl(null);
        }      // Auto-start the new session
      setIsAnimating(true);
    } catch (error) {
      console.error('Error resetting breathing session:', error);
      Alert.alert('Reset Error', 'Could not load new session data. Starting with default content.');
      setIsAnimating(true);
    } finally {
      setIsResetting(false);
    }
  };

  // Handle start/stop breathing session
  const handleStartStop = async () => {
    if (isAnimating) {
      // If animating, this becomes a pause/resume button
      handlePauseResume();
      return;
    }
    
    // Start session
    try {
      setIsPreparing(true);
      setAudioError(null);
      setAudioSupported(true); // Reset audio support for new session
      setIsPaused(false);
      
      // Get analysis if not already available
      if (!analysis) {
        console.log('Fetching breath analysis...');
        const payload = {
          text: initialTextRef.current || 'I want to slow down and breathe with Jesus.',
          cycles: 3,
        };
        
        const result = await analyzeBreathe(payload);
        console.log('Analysis result:', result);
        
        setAnalysis(result);
        
        // Update scriptures if available
        if (result?.textAndScriptures?.length) {
          const validScriptures = result.textAndScriptures.filter(Boolean);
          if (validScriptures.length > 0) {
            setScriptures(validScriptures);
          }
        }
        
        // Set audio URL if available and supported
        if (result?.asmrAudioUrl && isValidAudioUrl(result.asmrAudioUrl)) {
          console.log('Setting audio URL:', result.asmrAudioUrl);
          setAudioUrl(result.asmrAudioUrl);
        } else {
          console.log('No valid/supported audio URL provided:', result?.asmrAudioUrl);
          setAudioUrl(null);
        }
      } else {
        // Use existing analysis
        if (analysis.asmrAudioUrl && isValidAudioUrl(analysis.asmrAudioUrl)) {
          console.log('Using existing audio URL:', analysis.asmrAudioUrl);
          setAudioUrl(analysis.asmrAudioUrl);
        } else {
          console.log('Existing audio URL not valid/supported:', analysis.asmrAudioUrl);
          setAudioUrl(null);
        }
      }
      
      // Start breathing session
      setIsAnimating(true);
    } catch (error) {
      console.error('Error starting breathing session:', error);
      Alert.alert('Session Error', 'Could not load breathing session data. Starting with default content.');
      setIsAnimating(true);
    } finally {
      setIsPreparing(false);
    }
  };

  // Handle stop session
  const handleStop = () => {
    setIsAnimating(false);
    setIsPaused(false);
    cleanupAnimations();
    resetAnimations();
  };

  // Main animation effect
  useEffect(() => {
    if (isAnimating && !isPaused) {
      console.log('Starting/Resuming breathing session with audio:', !!audioUrl);
      
      // Start/Resume timer
      intervalRef.current = setInterval(() => {
        setCounter(prev => prev + 1);
      }, 1000);
      
      // Start breathing cycle
      startBreathingCycle();
    } else if (isPaused) {
      console.log('Pausing breathing session');
      // Pause: stop timer and animations but keep session active
      cleanupAnimations();
    } else {
      console.log('Stopping breathing session');
      cleanupAnimations();
      resetAnimations();
    }

    // Cleanup on unmount
    return () => {
      cleanupAnimations();
    };
  }, [isAnimating, isPaused]);

  // Audio event handlers
  const handleAudioError = (error: any) => {
    console.error('Audio playback error:', error);
    console.log('Audio URL that failed:', audioUrl);
    
    const errorMsg = error?.error?.errorString || 
                     error?.error?.localizedDescription ||
                     error?.error || 
                     'Audio playbook failed';
    
    setAudioError(errorMsg);
    setAudioUrl(null); // Clear the problematic URL
    setAudioSupported(false); // Disable audio for this session
    
    // Log more details for debugging
    if (error?.error?.code) {
      console.error('Audio error code:', error.error.code);
      
      // Handle specific format error codes
      if (error.error.code === -11828 || error.error.code === '-11828') {
        console.log('Audio format not supported - disabling audio for this session');
      }
    }
    
    // Continue breathing session without audio
    console.log('Continuing breathing session without audio due to format error');
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#0f0c29', '#24243e', '#302b63']}
        style={styles.container}
      >
        {/* Audio Player - Only render if supported and no errors */}
        {audioUrl && !audioError && audioSupported && (
          <Video
            source={{ uri: audioUrl }}
            audioOnly={true}
            repeat={true}
            paused={!isAnimating || isPaused}
            playInBackground={true}
            ignoreSilentSwitch="ignore"
            volume={1.0}
            onError={handleAudioError}
            style={styles.hiddenVideo}
          />
        )}

        {/* Background Stars Effect */}
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
          {/* Header */}
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
              <Text style={styles.timeText}>{formatTime(counter)}</Text>
            </View>

            {/* Reset button in header */}
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handleReset}
              activeOpacity={0.8}
              disabled={isResetting}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.resetButtonGradient}
              >
                {isResetting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Icon name="refresh" size={responsiveFontSizes.iconMedium} color="white" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.instructionContainer}>
              <Text style={styles.phaseText}>{currentPhase.toUpperCase()}</Text>
              <Text style={styles.instructionText}>
                {isAnimating ? (isPaused ? 'Session paused - tap play to continue' : getCurrentInstruction()) : 'Tap start to begin your breathing session'}
              </Text>
            </View>

            {/* Breathing Circle with Ripples */}
            <View style={styles.breathingContainer}>
              {/* Ripple Rings */}
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
              
              {/* Main Breathing Circle */}
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
                    <View style={styles.crossContainer}>
                      <Animated.View 
                        style={[
                          styles.crossVertical,
                          {
                            opacity: glowAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 0.8],
                            }),
                            transform: [{
                              scale: glowAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.98, 1.02],
                              })
                            }]
                          }
                        ]} 
                      />
                      <Animated.View 
                        style={[
                          styles.crossHorizontal,
                          {
                            opacity: glowAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 0.8],
                            }),
                            transform: [{
                              scale: glowAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.98, 1.02],
                              })
                            }]
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.breatheText}>BREATHE</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Scripture Display */}
            {isAnimating && (
              <Animated.View
                style={[
                  styles.scriptureContainer,
                  {
                    opacity: scriptureOpacity,
                    transform: [{ translateY: scriptureTranslateY }]
                  }
                ]}
              >
                <Text style={styles.scriptureText}>
                  {scriptures[currentScripture]}
                </Text>
                {isPaused && (
                  <Text style={styles.pausedIndicator}>
                    (Paused)
                  </Text>
                )}
              </Animated.View>
            )}

            {/* Progress Bar */}
            {isAnimating && !isPaused && (
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

          {/* Bottom Controls - Fixed Centering */}
          <View style={[styles.bottomContainer, { 
            paddingBottom: Math.max(20, (insets?.bottom ?? 0) + 12),
          }]}>
            <View style={styles.controlsRow}>
              {/* Start/Pause Button */}
              <TouchableOpacity 
                style={styles.controlButton} 
                onPress={handleStartStop}
                activeOpacity={0.8}
                disabled={isPreparing}
              >
                <LinearGradient
                  colors={isAnimating ? (isPaused ? ['#4facfe', '#00f2fe'] : ['#ff9500', '#ff5722']) : ['#4facfe', '#00f2fe']}
                  style={styles.buttonGradient}
                >
                  {isPreparing ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Icon 
                      name={isAnimating ? (isPaused ? "play" : "pause") : "play"} 
                      size={24} 
                      color="white" 
                    />
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Stop Button - Only show when session is active */}
              {(isAnimating || isPaused) && (
                <TouchableOpacity 
                  style={styles.controlButton} 
                  onPress={handleStop}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#ff6b6b', '#ee5a52']}
                    style={styles.buttonGradient}
                  >
                    <Icon 
                      name="square" 
                      size={20} 
                      color="white" 
                    />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
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
  hiddenVideo: {
    width: 0,
    height: 0,
    position: 'absolute',
    top: -1000,
    left: -1000,
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
    width: 50,
    height: 50,
  },
  resetButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  resetButtonGradient: {
    padding: 0,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: responsiveFontSizes.timeText,
    fontWeight: '300',
    fontFamily: 'System',
  },
  audioIndicator: {
    color: '#4facfe',
    fontSize: 18,
    marginLeft: 8,
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
    zIndex: 2,
  },
  crossContainer: {
    position: 'absolute',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  crossVertical: {
    position: 'absolute',
    width: 12,
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 6,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    shadowOpacity: 0.6,
    elevation: 8,
  },
  crossHorizontal: {
    position: 'absolute',
    width: 120,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 6,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    shadowOpacity: 0.6,
    elevation: 8,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
    elevation: 30,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    borderRadius: 30,
    width: 60,
    height: 60,
    overflow: 'hidden',
    elevation: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    zIndex: 1001,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextSmaller: {
    fontSize: 16,
  },
  scriptureContainer: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    marginTop: 20,
    zIndex: 1,
  },
  scriptureText: {
    color: 'white',
    fontSize: responsiveFontSizes.body,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  pausedIndicator: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default BreatheScreen;