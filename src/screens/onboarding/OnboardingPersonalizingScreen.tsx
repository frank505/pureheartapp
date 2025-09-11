/**
 * Onboarding Screen - Personalizing
 *
 * Full screen circular progress indicator with message,
 * then continue button to proceed to Auth.
 */
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from 'react-native-paper';
import ProgressIndicator from '../../components/ProgressIndicator';
import OnboardingButton from '../../components/OnboardingButton';
import { Colors } from '../../constants';
import { responsiveFontSizes, responsiveSpacing } from '../../utils/responsive';
import Svg, { Circle } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import dependencyAssessmentService from '../../services/dependencyAssessmentService';
import { saveDependencyAssessmentResult } from '../../store/slices/onboardingSlice';

interface Props { navigation: any }

const CIRC = 2 * Math.PI * 45;

const OnboardingPersonalizingScreen: React.FC<Props> = ({ navigation }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState('Preparing…');
  const [assessmentRequested, setAssessmentRequested] = useState(false);
  const dispatch = useAppDispatch();
  const onboarding = useAppSelector(s => s.onboarding);
  // sound effect removed per request

  useEffect(() => {
    let mounted = true;
  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  const animateTo = (targetPercent: number, duration = 260) => new Promise<void>(res => {
      Animated.timing(progress, { toValue: targetPercent / 100, duration, useNativeDriver: false }).start(() => res());
    });

    const updateStatus = (p: number) => {
      if (p < 10) return setStatus('Gathering inputs…');
      if (p < 25) return setStatus('Analyzing patterns…');
      if (p < 40) return setStatus('Assessing spiritual rhythms…');
      if (p < 55) return setStatus('Weighing focus areas…');
      if (p < 70) return setStatus('Crafting guidance pathways…');
      if (p < 85) return setStatus('Fine‑tuning Scripture pairings…');
      if (p < 100) return setStatus('Finalizing your plan…');
      return setStatus('Ready!');
    };

    const setP = (v: number) => { if (mounted) { setPercent(v); updateStatus(v); } };

    const run = async () => {
      setP(0);
      await animateTo(0, 0);
  await sleep(150);

      // Phase 1 quick ramp (slower than before)
  setP(12); await animateTo(12, 380); await sleep(120);
  setP(25); await animateTo(25, 360); await sleep(110);

      // Phase 2 to 40 with gentle jitter
      let p = 15;
      while (p < 40) {
        const inc = 4 + Math.floor(Math.random() * 6); // 4-9 faster ramp
        p = Math.min(p + inc, 40);
        setP(p);
        await animateTo(p, 260);
        await sleep(60 + Math.random() * 90);
      }
      await sleep(140);

      // Phase 3 analytical to 58
      while (p < 58) {
        const inc = 2 + Math.floor(Math.random() * 3); // 2-4
        p = Math.min(p + inc, 58);
        setP(p);
        await animateTo(p, 250);
        await sleep(90 + Math.random() * 120);
      }
      await sleep(160);

      // Phase 4 crafting to 85
      while (p < 85) {
        const inc = 3 + Math.floor(Math.random() * 4); // 3-6
        p = Math.min(p + inc, 85);
        setP(p);
        await animateTo(p, 230);
        await sleep(70 + Math.random() * 100);
      }
      await sleep(180);

      // Phase 5 final validations to 99
      while (p < 99) {
        const inc = 1 + (Math.random() < 0.5 ? 1 : 0); // 1-2
        p = Math.min(p + inc, 99);
        setP(p);
        await animateTo(p, 200);
        await sleep(90 + Math.random() * 110);
      }
      await sleep(240);

      // Complete
  setP(100);
  await animateTo(100, 400);
    };

    run();
    return () => { mounted = false; };
  }, [progress]);

  // Kick off dependency assessment early (once) while animating
  useEffect(() => {
    if (assessmentRequested) return;
    setAssessmentRequested(true);
    (async () => {
      try {
        const answers: { id: string; answer: string }[] = [];
        (onboarding.assessmentData.questions || []).forEach(q => { if (q.id && q.currentAnswer) answers.push({ id: q.id, answer: q.currentAnswer }); });
        const faith = onboarding.faithData || {};
        Object.entries(faith).forEach(([k,v]) => { if (typeof v === 'string' && v) answers.push({ id: `faith_${k}`, answer: v }); });
        const rec = onboarding.recoveryJourneyData || {};
        Object.entries(rec).forEach(([k,v]) => { if (typeof v === 'string' && v) answers.push({ id: `recovery_${k}`, answer: v }); });
        const add = onboarding.additionalAssessmentData || {};
        Object.entries(add).forEach(([k,v]) => { if (typeof v === 'string' && v) answers.push({ id: `extra_${k}`, answer: v }); });
        if (!answers.length) return;
        const { score, reasoning } = await dependencyAssessmentService.assessDependency({ answers });
        // ensure minimum 41 rule here
        dispatch(saveDependencyAssessmentResult({ score: Math.max(score, 41), reasoning }));
      } catch {
        // ignore
      }
    })();
  }, [assessmentRequested, onboarding, dispatch]);

  const strokeDashoffset = progress.interpolate({ inputRange: [0, 1], outputRange: [CIRC, 0] });

  // twinkling stars (borrow vibe from Onboarding27)
  const stars = useMemo(
    () => [
      { top: '12%', left: '18%', size: 3, delay: 0 },
      { top: '22%', left: '72%', size: 2, delay: 300 },
      { top: '40%', left: '28%', size: 3, delay: 600 },
      { top: '62%', left: '84%', size: 2, delay: 900 },
      { top: '34%', left: '88%', size: 3, delay: 1200 },
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
        colors={[Colors.background.primary, Colors.background.secondary, '#14b8a6']}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)', 'transparent']}
        locations={[0, 0.4, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
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
              backgroundColor: 'rgba(255,255,255,0.9)',
              opacity: starOpacities[i],
            }}
          />
        ))}
      </View>

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
          <Text style={{ color: Colors.text.primary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressIndicator currentStep={13} totalSteps={30} variant="bars" showStepText={false} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.center}>
        <View style={styles.circleWrap}>
          <Svg width={192} height={192} viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
          <AnimatedCircle cx="50" cy="50" r="45" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" fill="none" strokeDasharray={`${CIRC}`} strokeDashoffset={strokeDashoffset as any} />
          </Svg>
          {/* Percentage inside circle */}
          <View style={styles.circleCenter} pointerEvents="none">
            <Text style={styles.percentInside}>{percent}%</Text>
          </View>
        </View>
  <Text style={[styles.title, { marginTop: 16 }]}>{status}</Text>
      </View>

    <View style={styles.buttonContainer}>
  <OnboardingButton title="Continue" onPress={() => navigation.navigate('Onboarding12')} variant="primary" disabled={percent < 100} />
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
  title: { fontSize: responsiveFontSizes.mainTitle, fontWeight: '700', color: Colors.text.primary, textAlign: 'center' },
  percent: { marginTop: 8, fontSize: 18, color: 'rgba(255,255,255,0.9)', fontWeight: '700' },
  buttonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.background.primary, paddingHorizontal: responsiveSpacing.lg, paddingBottom: 28, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border.primary },
  circleWrap: { position: 'relative', width: 192, height: 192, alignItems: 'center', justifyContent: 'center' },
  circleCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  percentInside: { fontSize: 28, fontWeight: '800', color: Colors.text.primary },
});

export default OnboardingPersonalizingScreen;