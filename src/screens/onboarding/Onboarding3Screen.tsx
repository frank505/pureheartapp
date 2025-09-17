import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressIndicator from '../../components/ProgressIndicator';
import OnboardingButton from '../../components/OnboardingButton';
import { Colors } from '../../constants';
import { responsiveFontSizes, responsiveSpacing } from '../../utils/responsive';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveHowTheyHeardData, setCurrentStep } from '../../store/slices/onboardingSlice';

interface Onboarding3ScreenProps { navigation: any }

const Onboarding3Screen: React.FC<Onboarding3ScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const pre = useAppSelector((s) => s.onboarding.howTheyHeard?.source || '');
  const [value, setValue] = useState<string>(pre);

  useEffect(() => { dispatch(setCurrentStep(3)); }, [dispatch]);

  const options = useMemo(
    () => [
      { id: 'social', label: 'Social media' },
      { id: 'appstore', label: 'App Store/Play Store' },
      { id: 'friend', label: 'Friend or family' },
      { id: 'church', label: 'Church or ministry' },
      { id: 'search', label: 'Online search (Google, etc.)' },
      { id: 'youtube', label: 'YouTube' },
      { id: 'podcast', label: 'Podcast' },
      { id: 'other', label: 'Other' },
    ],
    []
  );

  const saveAndNext = () => {
    if (value) dispatch(saveHowTheyHeardData({ source: value }));
    navigation.navigate('OnboardingPersonalizing');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background.primary, Colors.background.secondary, '#a78bfa']} style={StyleSheet.absoluteFill} />

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
          <Text style={{ color: Colors.text.primary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressIndicator currentStep={3} totalSteps={30} variant="bars" showStepText={false} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Question #3</Text>
        <Text style={styles.subtitle}>Where did you hear about us?</Text>

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
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.background.secondary,
    borderColor: Colors.border.primary,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  choiceSelected: { borderColor: Colors.secondary.main, backgroundColor: 'rgba(34,197,94,0.1)' },
  bullet: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6' },
  bulletSelected: { backgroundColor: Colors.secondary.main },
  bulletText: { color: 'white', fontWeight: '700' },
  choiceLabel: { color: Colors.text.primary, fontSize: responsiveFontSizes.body },
  choiceLabelSelected: { color: Colors.secondary.main, fontWeight: '600' },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.background.primary, paddingHorizontal: responsiveSpacing.lg, paddingBottom: 28, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border.primary },
});

export default Onboarding3Screen;

