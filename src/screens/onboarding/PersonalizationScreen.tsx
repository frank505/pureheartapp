
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Colors } from '../../constants';
import { useAppDispatch } from '../../store/hooks';
import OnboardingButton from '../../components/OnboardingButton';

interface CircularProgressProps {
  progress: number;
  size: number;
  strokeWidth: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularProgress: React.FC<CircularProgressProps> = ({ progress, size, strokeWidth }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  return (
    <View style={styles.progressContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          stroke={Colors.border.primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke={Colors.primary.main}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.progressText}>{`${Math.round(progress)}%`}</Text>
    </View>
  );
};

const PersonalizationScreen = () => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  useEffect(() => {
  const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) {
          return prev + 1;
        }
        clearInterval(interval);
        setIsComplete(true);
        setShowConfetti(true);
        return 100;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Notification permission is now requested earlier (Onboarding29Screen) – removed from here.

  const handleContinue = () => {
    // Move to final accountability setup screen (Onboarding29) where we finalize & submit.
    navigation.navigate('Onboarding29' as never);
  };

  return (
    <View style={styles.container}>
      {!isComplete ? (
        <>
          <CircularProgress progress={progress} size={200} strokeWidth={15} />
          <Text style={styles.loadingText}>Final personalization of profile...</Text>
        </>
      ) : (
        <>
          <Text style={styles.completeText}>Personalization Complete</Text>
          <OnboardingButton title="Continue" onPress={handleContinue} style={styles.button} disabled={!isComplete} />
        </>
      )}
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressText: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: Colors.text.secondary,
  },
  completeText: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  button: {
    marginTop: 30,
    width: '80%',
  },
});

export default PersonalizationScreen;

