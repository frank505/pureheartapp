import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressIndicator from '../../components/ProgressIndicator';
import OnboardingButton from '../../components/OnboardingButton';
import { Colors } from '../../constants';
import { responsiveFontSizes, responsiveSpacing } from '../../utils/responsive';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCurrentStep } from '../../store/slices/onboardingSlice';
import dependencyAssessmentService from '../../services/dependencyAssessmentService';

interface Props { navigation: any; route: { params?: { score?: number } } }

const Onboarding12Screen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const onboarding = useAppSelector(s => s.onboarding);
  const [score, setScore] = useState<number>(typeof route?.params?.score === 'number' ? route.params!.score! : 55);
  const [loadingScore, setLoadingScore] = useState(false);
  const [reasoning, setReasoning] = useState<string | undefined>();

  useEffect(() => { dispatch(setCurrentStep(12)); }, [dispatch]);

  const buildAnswersPayload = useCallback(() => {
    const answers: { id: string; answer: string }[] = [];
    // Assessment questions (Onboarding5)
    (onboarding.assessmentData.questions || []).forEach(q => {
      if (q.id && q.currentAnswer) answers.push({ id: q.id, answer: q.currentAnswer });
    });
    // Faith data (map each key as pseudo-question)
    const faith = onboarding.faithData || {};
    Object.entries(faith).forEach(([key, value]) => {
      if (typeof value === 'string' && value) answers.push({ id: `faith_${key}`, answer: value });
    });
    // Recovery journey data
    const rec = onboarding.recoveryJourneyData || {};
    Object.entries(rec).forEach(([key, value]) => {
      if (typeof value === 'string' && value) answers.push({ id: `recovery_${key}`, answer: value });
    });
    // Additional assessment data
    const add = onboarding.additionalAssessmentData || {};
    Object.entries(add).forEach(([key, value]) => {
      if (typeof value === 'string' && value) answers.push({ id: `extra_${key}`, answer: value });
    });
    return answers;
  }, [onboarding]);

  useEffect(() => {
    const dep = onboarding.dependencyAssessment;
    if (dep) {
      setScore(dep.score);
      setReasoning(dep.reasoning);
      setLoadingScore(false);
      return;
    }
    // fallback: fetch if not already prefetched
    let cancelled = false;
    (async () => {
      try {
        setLoadingScore(true);
        const answers = buildAnswersPayload();
        if (!answers.length) { return; }
        const { score: rawScore, reasoning: r } = await dependencyAssessmentService.assessDependency({ answers });
        if (cancelled) return;
        const adjusted = Math.max(rawScore, 41);
        setScore(adjusted);
        setReasoning(r);
      } catch {
      } finally {
        if (!cancelled) setLoadingScore(false);
      }
    })();
    return () => { cancelled = true; };
  }, [buildAnswersPayload, onboarding.dependencyAssessment]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background.primary, Colors.background.secondary, '#22c55e']} style={StyleSheet.absoluteFill} />

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
          <Text style={{ color: Colors.text.primary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressIndicator currentStep={12} totalSteps={30} variant="bars" showStepText={false} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.rowCenter}>
          <Text style={styles.title}>Analysis Complete</Text>
          <View style={styles.checkBadge}><Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text></View>
        </View>
        <Text style={styles.lead}>We've got some news to break to you...</Text>
        <Text style={styles.highlight}>Your responses indicate a clear dependence on internet porn*</Text>

        <View style={styles.chartRow}>
          <View style={styles.barCol}>
            <View style={[styles.bar, { height: 60 + (score * 1.2), backgroundColor: '#ef4444' }]}>  
              <Text style={styles.barText}>{loadingScore ? '...' : `${score}%`}</Text>
            </View>
            <Text style={styles.barLabel}>Your Score</Text>
          </View>
          <View style={styles.barCol}>
            <View style={[styles.bar, { height: 88, backgroundColor: '#10b981' }]}>
              <Text style={styles.barText}>40%</Text>
            </View>
            <Text style={styles.barLabel}>Average</Text>
          </View>
        </View>
        { !loadingScore && (
          <Text style={styles.fact}>
            <Text style={{ color: '#ef4444', fontWeight: '800' }}>
              {Math.max(0, score - 40)}%
            </Text> higher than average dependence 📊
          </Text>
        )}
        {reasoning ? <Text style={[styles.disclaimer, { marginTop: 4 }]}>{reasoning}</Text> : null}
        <Text style={styles.disclaimer}>* This result is an indication only, not a medical diagnosis.</Text>

  <OnboardingButton title="Check your symptoms" onPress={() => navigation.navigate('Onboarding13')} variant="primary" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  progressWrapper: { flex: 1, alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: responsiveSpacing.lg, paddingTop: 8 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: responsiveFontSizes.mainTitle, fontWeight: '800', color: Colors.text.primary },
  checkBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  lead: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 12 },
  highlight: { color: Colors.text.primary, textAlign: 'center', fontWeight: '600', marginBottom: 24 },
  chartRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 32, marginBottom: 16 },
  barCol: { alignItems: 'center' },
  bar: { width: 64, borderTopLeftRadius: 12, borderTopRightRadius: 12, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 },
  barText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  barLabel: { color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  fact: { color: Colors.text.primary, textAlign: 'center', marginTop: 8, marginBottom: 12, fontSize: responsiveFontSizes.body },
  disclaimer: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: 12, marginBottom: 20 },
});

export default Onboarding12Screen;
