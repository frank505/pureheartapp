import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressIndicator from '../../components/ProgressIndicator';
import OnboardingButton from '../../components/OnboardingButton';
import MiniSectionDots from '../../components/MiniSectionDots';
import { Colors } from '../../constants';
import { responsiveFontSizes, responsiveSpacing } from '../../utils/responsive';
import { useAppDispatch } from '../../store/hooks';
import { setCurrentStep } from '../../store/slices/onboardingSlice';
import Icon from 'react-native-vector-icons/Ionicons';

interface Props { navigation: any }

const Onboarding19Screen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  useEffect(() => { dispatch(setCurrentStep(19)); }, [dispatch]);
  // Simple twinkling stars configuration
  const stars = useMemo(
    () => [
      { top: '20%', left: '15%', size: 3, delay: 0 },
      { top: '30%', left: '80%', size: 2, delay: 300 },
      { top: '60%', left: '25%', size: 3, delay: 600 },
      { top: '75%', left: '70%', size: 2, delay: 900 },
      { top: '40%', left: '90%', size: 3, delay: 1200 },
    ],
    []
  );

  const starOpacities = useRef(stars.map(() => new Animated.Value(0.6))).current;

  useEffect(() => {
    const animations = starOpacities.map((op, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(op, { toValue: 1, duration: 1000, delay: stars[i].delay, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => { animations.forEach(a => a.stop()); };
  }, [starOpacities, stars]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[
          Colors.background.primary,
          Colors.background.secondary,
          Colors.background.tertiary,
          Colors.background.quaternary,
          '#06b6d4',
        ]}
        locations={[0, 0.25, 0.55, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Highlight overlay to brighten the outlook without changing brand hues */}
      <LinearGradient
        colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)', 'transparent']}
        locations={[0, 0.4, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Twinkling stars background */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {stars.map((s, i) => (
          <Animated.View
            key={`star-${i}`}
            style={{
              position: 'absolute',
              top: s.top as any,
              left: s.left as any,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
              backgroundColor: 'rgba(255,255,255,0.2)',
              opacity: starOpacities[i],
            }}
          />
        ))}
      </View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
  <View style={styles.progress}><ProgressIndicator currentStep={19} totalSteps={30} variant="bars" showStepText={false} /></View>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        {/* Scripture banner */}
        <View style={styles.scriptureBox}>
          <Text style={styles.scriptureText}>
            “Create in me a clean heart, O God, and renew a right spirit within me.” — Psalm 51:10
          </Text>
        </View>

        {/* Icon divider */}
        <Icon name="leaf" size={36} color="#22c55e" style={styles.iconDivider} />

        <Text style={styles.title}>Path to Recovery</Text>
        <Text style={styles.subtitle}>
          Recovery is possible. By <Text style={styles.emphasis}>abstaining from pornography</Text>, your brain can
          {' '}<Text style={styles.emphasis}>reset its sensitivity to dopamine</Text>, paving the way to
          {' '}<Text style={styles.emphasis}>healthier relationships</Text> and <Text style={styles.emphasis}>renewed well‑being</Text>.
          {'\n'}By God's grace, every step counts — <Text style={styles.emphasis}>hope grows</Text>.
        </Text>
  <MiniSectionDots 
    total={9} 
    active={0} 
    inactiveColor="rgba(34, 197, 94, 0.3)" 
    activeColor="#22c55e" 
  />
  <OnboardingButton title="Continue" onPress={() => navigation.navigate('Onboarding20')} variant="primary" style={{ marginTop: 12 }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  progress: { flex: 1, alignItems: 'center' },
  back: { color: Colors.text.primary, fontSize: 18 },
  content: { flex: 1, paddingHorizontal: responsiveSpacing.lg, justifyContent: 'center' },
  scriptureBox: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  marginBottom: 20,
  },
  scriptureText: {
    color: Colors.text.secondary,
    fontStyle: 'italic',
    fontSize: responsiveFontSizes.body,
    textAlign: 'center',
  },
  iconDivider: { alignSelf: 'center', marginBottom: 16, opacity: 0.85 },
  title: {
    fontSize: responsiveFontSizes.mainTitle,
    fontWeight: '800',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: responsiveFontSizes.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emphasis: { fontWeight: '700', color: Colors.text.primary },
});

export default Onboarding19Screen;
