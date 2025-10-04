/**
 * Commitment Success Screen
 * 
 * Celebration screen after successfully creating a commitment.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Animated,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Icon } from '../../components';
import { Colors } from '../../constants';
import { useAppSelector } from '../../store/hooks';

type Props = NativeStackScreenProps<any, 'CommitmentSuccess'>;

const CommitmentSuccessScreen: React.FC<Props> = ({ navigation }) => {
  const activeCommitment = useAppSelector((state) => state.commitments.activeCommitment);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Celebration animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getDaysUntilTarget = (): number => {
    if (!activeCommitment) return 0;
    const now = new Date();
    const target = new Date(activeCommitment.targetDate);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleViewDashboard = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'ActiveCommitmentDashboard' }],
    });
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/appbackgroundimage.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          {/* Success Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Icon name="checkmark-circle" size={120} color="#10b981" />
            </View>
          </Animated.View>

          {/* Success Message */}
          <Animated.View
            style={[
              styles.messageContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.title}>Commitment Active! 🎉</Text>
            <Text style={styles.subtitle}>
              Your commitment has been created successfully. Stay strong!
            </Text>

            {/* Countdown */}
            {activeCommitment && (
              <View style={styles.countdownCard}>
                <Text style={styles.countdownLabel}>Days Until Target</Text>
                <Text style={styles.countdownNumber}>{getDaysUntilTarget()}</Text>
                <Text style={styles.countdownDate}>
                  {new Date(activeCommitment.targetDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}

            {/* Encouragement */}
            <View style={styles.encouragementCard}>
              <Icon name="heart" size={32} color="#ef4444" />
              <Text style={styles.encouragementTitle}>
                You Can Do This!
              </Text>
              <Text style={styles.encouragementText}>
                Every day clean is a victory. Your accountability partner is here to support you on this journey.
              </Text>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Button
              mode="contained"
              onPress={handleViewDashboard}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              View My Commitment
            </Button>
            <Button
              mode="outlined"
              onPress={handleGoHome}
              style={styles.secondaryButton}
              contentStyle={styles.buttonContent}
            >
              Go to Home
            </Button>
          </Animated.View>
        </View>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  countdownCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    elevation: 3,
  },
  countdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  countdownNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: Colors.primary.main,
    marginBottom: 8,
  },
  countdownDate: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  encouragementCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  encouragementTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  encouragementText: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    elevation: 2,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary.main,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
});

export default CommitmentSuccessScreen;
