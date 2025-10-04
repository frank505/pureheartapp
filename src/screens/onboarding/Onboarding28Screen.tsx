import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressIndicator from '../../components/ProgressIndicator';
import OnboardingButton from '../../components/OnboardingButton';
import { Colors } from '../../constants';
import { responsiveFontSizes, responsiveSpacing } from '../../utils/responsive';
import { useAppDispatch } from '../../store/hooks';
import { setCurrentStep } from '../../store/slices/onboardingSlice';

interface Props { navigation: any }

const GOALS = [
  'Grow closer to God',
  'Honor God with my body',
  'Live in purity and holiness',
  'Restore spiritual sensitivity',
  'Strengthen prayer life',
  'Stronger relationships',
  'Improved self-confidence',
  'Better mood and happiness',
  'More energy and motivation',
  'Improved desire and sex life',
  'Better self-control',
  'Improved focus and clarity',
];

const Onboarding28Screen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  useEffect(() => { dispatch(setCurrentStep(28)); }, [dispatch]);

  const toggle = (g: string) => setPicked((s) => ({ ...s, [g]: !s[g] }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background.primary, '#312e81', '#1e3a8a']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
  <View style={styles.progress}><ProgressIndicator currentStep={28} totalSteps={29} variant="bars" showStepText={false} /></View>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Choose your goals</Text>
        <Text style={styles.subtitle}>Select the goals you want to track during your reboot.</Text>

        <View style={{ marginTop: 8 }}>
          {GOALS.map((g) => {
            const on = !!picked[g];
            return (
              <TouchableOpacity key={g} style={[styles.goal, on && styles.goalOn]} onPress={() => toggle(g)}>
                <Text style={[styles.goalText, on && styles.goalTextOn]}>{g}</Text>
                <View style={[styles.goalCheck, on && styles.goalCheckOn]} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginTop: 24 }}>
          <OnboardingButton title="Track these goals" onPress={() => navigation.navigate('Onboarding29')} variant="primary" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  progress: { flex: 1, alignItems: 'center' },
  back: { color: Colors.text.primary, fontSize: 18 },
  content: { flexGrow: 1, paddingHorizontal: responsiveSpacing.lg, paddingBottom: 32 },
  title: { fontSize: responsiveFontSizes.mainTitle, fontWeight: '800', color: Colors.text.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: responsiveFontSizes.headerSubtitle, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 16 },
  goal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.background.secondary, borderColor: Colors.border.primary, borderWidth: 1, borderRadius: 9999, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 12 },
  goalOn: { borderColor: Colors.secondary.main, backgroundColor: 'rgba(34,197,94,0.1)' },
  goalText: { color: Colors.text.primary, fontSize: responsiveFontSizes.body },
  goalTextOn: { color: Colors.secondary.main, fontWeight: '600' },
  goalCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'transparent', borderWidth: 2, borderColor: Colors.border.primary },
  goalCheckOn: { backgroundColor: Colors.secondary.main, borderColor: Colors.secondary.main },
});

export default Onboarding28Screen;
