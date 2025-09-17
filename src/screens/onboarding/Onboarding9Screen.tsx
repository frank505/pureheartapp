import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressIndicator from '../../components/ProgressIndicator';
import OnboardingButton from '../../components/OnboardingButton';
import { Colors } from '../../constants';
import { responsiveFontSizes, responsiveSpacing } from '../../utils/responsive';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveAssessmentData, setCurrentStep } from '../../store/slices/onboardingSlice';
import type { AssessmentQuestion } from '../../store/slices/onboardingSlice';

interface Onboarding9ScreenProps { navigation: any }

const Onboarding9Screen: React.FC<Onboarding9ScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const existing = (useAppSelector((s) => s.onboarding.assessmentData?.questions) ?? []) as AssessmentQuestion[];
  const [value, setValue] = useState<string>('');

  useEffect(() => { dispatch(setCurrentStep(9)); }, [dispatch]);

  const options = useMemo(
    () => [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
      { id: 'prefer_not_say', label: 'Prefer not to say' },
    ],
    []
  );

  const saveAndNext = () => {
    // Save only if user selected an answer
    if (value) {
      const others = existing.filter((q: any) => q?.id !== 'boredom_trigger');
      const newQuestion: AssessmentQuestion = {
        id: 'boredom_trigger',
        question: 'Do you watch pornography out of boredom?',
        currentAnswer: value,
        icon: '😐',
        type: 'options',
      };
      const updated: AssessmentQuestion[] = [...others, newQuestion];
      dispatch(saveAssessmentData({ questions: updated }));
    }
    navigation.navigate('Onboarding10');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background.primary, Colors.background.secondary, '#06b6d4']} style={StyleSheet.absoluteFill} />

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
          <Text style={{ color: Colors.text.primary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressIndicator currentStep={9} totalSteps={30} variant="bars" showStepText={false} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Question #9</Text>
        <Text style={styles.subtitle}>Do you watch pornography out of boredom?</Text>

        <View style={styles.choices}>
          {options.map((opt, idx) => (
            <TouchableOpacity key={opt.id} style={[styles.choice, value === opt.id && styles.choiceSelected]} onPress={() => setValue(opt.id)}>
              <View style={[styles.bullet, value === opt.id && styles.bulletSelected]}>
                <Text style={styles.bulletText}>{idx + 1}</Text>
              </View>
              <Text style={[styles.choiceLabel, value === opt.id && styles.choiceLabelSelected]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <OnboardingButton title="Skip" onPress={saveAndNext} variant="secondary" />
        <OnboardingButton title="Continue" onPress={saveAndNext} variant="primary" disabled={!value} style={{ marginTop: 12 }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  progressWrapper: { flex: 1, alignItems: 'center' },
  scrollContent: { flexGrow: 1, paddingHorizontal: responsiveSpacing.lg, paddingTop: 24, paddingBottom: 140 },
  title: { fontSize: responsiveFontSizes.mainTitle, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: responsiveFontSizes.headerSubtitle, color: Colors.text.primary, textAlign: 'center', marginBottom: 24 },
  choices: { gap: 12 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.background.secondary, borderColor: Colors.border.primary, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 9999 },
  choiceSelected: { borderColor: Colors.secondary.main, backgroundColor: 'rgba(34,197,94,0.1)' },
  bullet: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6' },
  bulletSelected: { backgroundColor: Colors.secondary.main },
  bulletText: { color: 'white', fontWeight: '700' },
  choiceLabel: { color: Colors.text.primary, fontSize: responsiveFontSizes.body },
  choiceLabelSelected: { color: Colors.secondary.main, fontWeight: '600' },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.background.primary, paddingHorizontal: responsiveSpacing.lg, paddingBottom: 28, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border.primary },
});

export default Onboarding9Screen;
