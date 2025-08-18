import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../constants';

interface BreathingAnimationProps {
  isPlaying: boolean;
}

const BreathingAnimation: React.FC<BreathingAnimationProps> = ({ isPlaying }) => {
  const breathingAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaying) {
      startBreathingAnimation();
    } else {
      breathingAnimation.stopAnimation();
      opacityAnimation.stopAnimation();
    }
  }, [isPlaying]);

  const startBreathingAnimation = () => {
    Animated.loop(
      Animated.parallel([
        // Scale animation
        Animated.sequence([
          // Breathe in
          Animated.timing(breathingAnimation, {
            toValue: 1,
            duration: 4000, // 4 seconds to breathe in
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          // Hold
          Animated.timing(breathingAnimation, {
            toValue: 1,
            duration: 4000, // 4 seconds to hold
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          // Breathe out
          Animated.timing(breathingAnimation, {
            toValue: 0,
            duration: 4000, // 4 seconds to breathe out
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          // Rest
          Animated.timing(breathingAnimation, {
            toValue: 0,
            duration: 2000, // 2 seconds to rest
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        // Opacity animation
        Animated.sequence([
          Animated.timing(opacityAnimation, {
            toValue: 0.3,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnimation, {
            toValue: 0.3,
            duration: 4000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnimation, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnimation, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  };

  const scale = breathingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2], // Circle will double in size
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.outerCircle,
          {
            transform: [{ scale: scale }],
            opacity: opacityAnimation,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.innerCircle,
          {
            transform: [{ scale: scale }],
            opacity: opacityAnimation,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 218,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.main,
    opacity: 0.3,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.light,
    opacity: 0.5,
  },
});

export default BreathingAnimation;
