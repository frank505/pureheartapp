import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressIndicator from '../../components/ProgressIndicator';
import { Colors } from '../../constants';
import { responsiveFontSizes, responsiveSpacing } from '../../utils/responsive';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCurrentStep } from '../../store/slices/onboardingSlice';
import Svg, { Circle } from 'react-native-svg';

interface Props { navigation: any }

const CIRCUMFERENCE = 2 * Math.PI * 45;

const Onboarding11Screen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const onboarding = useAppSelector((s) => s.onboarding);
  const progress = useRef(new Animated.Value(0)).current;
  const [favoriteVerse, setFavoriteVerse] = useState<string>('');

  useEffect(() => {
    dispatch(setCurrentStep(11));
    Animated.timing(progress, { toValue: 1, duration: 1800, useNativeDriver: false }).start(({ finished }) => {
      if (finished) navigation.replace('Onboarding12', { score: computePercent() });
    });
  }, [dispatch, navigation, progress]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  // Simple heuristic score based on data completeness and some answers
  const computePercent = () => {
    const totalFactors = 6;
    let score = 0;
    // weight: earlier exposure and coping usage increase risk
    const age = onboarding.additionalAssessmentData?.ageFirstEncounteredPornography;
    if (age && ['under_10', '10_12'].includes(String(age))) score += 1;
    // coping usage
    const coping = (onboarding.assessmentData?.questions || []).find((q: any) => q.id === 'coping_usage')?.currentAnswer;
    if (coping === 'yes') score += 1;
    // frequency proxy
    const frequency = (onboarding.assessmentData?.questions || []).find((q: any) => q.id === 'frequency')?.currentAnswer;
    if (frequency === 'more_than_once_daily' || frequency === 'once_daily') score += 1;
    // faith protective factor (lower risk)
    const prayer = onboarding.faithData?.prayerFrequency;
    if (prayer === 'daily') score -= 0.5;
    // church involvement (lower risk)
    const church = onboarding.faithData?.churchInvolvement;
    if (church === 'very-involved') score -= 0.5;
    // motivation faith (lower risk)
    const motivation = onboarding.recoveryJourneyData?.recoveryMotivation;
    if (motivation === 'faith') score -= 0.25;

    // Normalize to 0..1 then to percent 20..85 range for UX
    const normalized = Math.min(Math.max((score + 1) / totalFactors, 0), 1); // shift to keep >0
    const pct = Math.round(20 + normalized * 65);
    return pct;
  };

  const displayPercent = useMemo(() => `${computePercent()}%`, [onboarding]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background.primary, Colors.background.secondary, '#0ea5e9']} style={StyleSheet.absoluteFill} />

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
          <Text style={{ color: Colors.text.primary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressIndicator currentStep={11} totalSteps={30} variant="bars" showStepText={false} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.center}>
        <View style={{ marginBottom: 28 }}>
          <Svg width={192} height={192} viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
            <AnimatedCircle cx="50" cy="50" r="45" stroke="#10b981" strokeWidth="8" strokeLinecap="round" fill="none" strokeDasharray={`${CIRCUMFERENCE}`} strokeDashoffset={strokeDashoffset as any} />
          </Svg>
          <View style={styles.percentOverlay}>
            <Text style={styles.percentText}>{displayPercent}</Text>
          </View>
        </View>

  <Text style={styles.title}>Calculating</Text>
  <Text style={styles.subtitle}>Learning relapse triggers</Text>
      </View>
    </SafeAreaView>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle as any);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  progressWrapper: { flex: 1, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: responsiveSpacing.lg },
  percentOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  percentText: { fontSize: 48, fontWeight: '800', color: Colors.text.primary },
  title: { fontSize: responsiveFontSizes.mainTitle, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: responsiveFontSizes.headerSubtitle, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
});

export default Onboarding11Screen;
