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

type Section = { title: string; items: string[] };

const SECTIONS: Section[] = [
   {
    title: 'Faith',
    items: [
  'Feeling distant from God',
  'Difficulty focusing during prayer',
  'Inconsistent prayer life',
  'Avoiding or neglecting Bible reading',
  'Feeling spiritual numbness or apathy',
  'Struggling with shame or guilt before God',
  "Feeling unworthy of God's love",
  "Questioning God's purpose or plan",
  'Struggling to forgive yourself',
  'Worship feels hollow or routine',
    ],
  },
  {
    title: 'Physical',
    items: [
      'Fatigue and lethargy',
      'Low sex drive',
      'Weaker erections without pornography',
    ],
  },
  {
    title: 'Social',
    items: [
      'Low self-esteem',
      'Feeling unattractive or unlovable',
      'Unsatisfying or pleasureless sex',
      'Reduced desire to socialize',
      'Feeling isolated from others',
    ],
  },
  {
    title: 'Cognitive',
    items: [
      'Feeling demotivated',
      'Lack of ambition to pursue goals',
      'Difficulty concentrating',
      "Poor memory or 'brain fog'",
    ],
  },
];

const Onboarding14Screen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => { dispatch(setCurrentStep(14)); }, [dispatch]);

  const makeKey = (sectionTitle: string, label: string) => `${sectionTitle}::${label}`;
  const toggle = (sectionTitle: string, label: string) =>
    setSelected((s) => {
      const key = makeKey(sectionTitle, label);
      return { ...s, [key]: !s[key] };
    });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background.primary, Colors.background.secondary, '#8b5cf6']} style={StyleSheet.absoluteFill} />

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
          <Text style={{ color: Colors.text.primary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressIndicator currentStep={14} totalSteps={30} variant="bars" showStepText={false} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Symptoms</Text>
        <Text style={styles.subtitle}>Select all that apply:</Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={{ marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View>
              {section.items.map((label) => {
                const key = makeKey(section.title, label);
                const isOn = !!selected[key];
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.checkboxItem, isOn && styles.checkboxItemOn]}
                    onPress={() => toggle(section.title, label)}
                  >
                    <View style={[styles.checkCircle, isOn && styles.checkCircleOn]} />
                    <Text style={styles.checkboxLabel}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ marginTop: 24 }}>
          <OnboardingButton title="Reboot my brain" onPress={() => navigation.navigate('Onboarding15' as never)} variant="primary" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  progressWrapper: { flex: 1, alignItems: 'center' },
  content: { flexGrow: 1, paddingHorizontal: responsiveSpacing.lg, paddingBottom: 32 },
  title: { fontSize: responsiveFontSizes.mainTitle, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: responsiveFontSizes.headerSubtitle, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: responsiveFontSizes.headerSubtitle, fontWeight: '600', color: Colors.text.primary, marginBottom: 8, marginTop: 12 },
  checkboxItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.secondary, borderColor: Colors.border.primary, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
  checkboxItemOn: { borderColor: Colors.secondary.main, backgroundColor: 'rgba(34,197,94,0.1)' },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#9ca3af', marginRight: 12 },
  checkCircleOn: { backgroundColor: Colors.secondary.main, borderColor: Colors.secondary.main },
  checkboxLabel: { color: Colors.text.primary, fontSize: responsiveFontSizes.body },
});

export default Onboarding14Screen;
