import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants';
import ProgressIndicator from '../../components/ProgressIndicator';
import OnboardingButton from '../../components/OnboardingButton';
import { responsiveFontSizes, responsiveSpacing } from '../../utils/responsive';
import { useAppDispatch } from '../../store/hooks';
import { savePartialPersonalInfo, setCurrentStep } from '../../store/slices/onboardingSlice';

interface Onboarding1ScreenProps { navigation: any }

const Onboarding1Screen: React.FC<Onboarding1ScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [gender, setGender] = useState<string>('');

  useEffect(() => { dispatch(setCurrentStep(1)); }, [dispatch]);

  const handleContinue = () => {
    if (!gender) return;
    dispatch(savePartialPersonalInfo({ gender }));
    navigation.navigate('Onboarding2');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background.primary, Colors.background.secondary, '#3b82f6']} style={StyleSheet.absoluteFill} />

      <View style={styles.headerContainer}>
        <View style={{ width: 40 }} />
        <View style={styles.progressWrapper}>
          <ProgressIndicator currentStep={1} totalSteps={30} variant="bars" showStepText={false} />
        </View>
        <View style={styles.langPill}><Text style={styles.langText}>EN</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Question #1</Text>
        <Text style={styles.subtitle}>What is your gender?</Text>

        <View style={styles.choices}>
          {[
            { id: 'male', label: 'Male' },
            { id: 'female', label: 'Female' },
          ].map((opt) => (
            <TouchableOpacity key={opt.id} style={[styles.choice, gender === opt.id && styles.choiceSelected]} onPress={() => setGender(opt.id)}>
              <View style={[styles.bullet, gender === opt.id && styles.bulletSelected]}>
                <Text style={styles.bulletText}>{opt.id === 'male' ? '1' : '2'}</Text>
              </View>
              <Text style={[styles.choiceLabel, gender === opt.id && styles.choiceLabelSelected]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <OnboardingButton title="Skip for now" onPress={() => navigation.navigate('Onboarding2')} variant="secondary" />
        <OnboardingButton title="Continue" onPress={handleContinue} variant="primary" disabled={!gender} style={{ marginTop: 12 }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  progressWrapper: { flex: 1, alignItems: 'center' },
  langPill: { backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  langText: { color: Colors.text.primary, fontSize: 12 },
  scrollContent: { flexGrow: 1, paddingHorizontal: responsiveSpacing.lg, paddingTop: 24, paddingBottom: 140 },
  title: { fontSize: responsiveFontSizes.mainTitle, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: responsiveFontSizes.headerSubtitle, color: Colors.text.primary, textAlign: 'center', marginBottom: 24 },
  choices: { gap: 12 },
  choice: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.background.secondary, borderColor: Colors.border.primary,
    borderWidth: 1, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 9999,
  },
  choiceSelected: { borderColor: Colors.secondary.main, backgroundColor: 'rgba(34,197,94,0.1)' },
  bullet: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6' },
  bulletSelected: { backgroundColor: Colors.secondary.main },
  bulletText: { color: 'white', fontWeight: '700' },
  choiceLabel: { color: Colors.text.primary, fontSize: responsiveFontSizes.body },
  choiceLabelSelected: { color: Colors.secondary.main, fontWeight: '600' },
  bottomContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.background.primary,
    paddingHorizontal: responsiveSpacing.lg, paddingBottom: 28, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border.primary,
  },
});

export default Onboarding1Screen;
 
