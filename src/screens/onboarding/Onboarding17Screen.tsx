import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressIndicator from '../../components/ProgressIndicator';
import OnboardingButton from '../../components/OnboardingButton';
import { Colors } from '../../constants';
import { responsiveFontSizes, responsiveSpacing } from '../../utils/responsive';
import { useAppDispatch } from '../../store/hooks';
import { setCurrentStep } from '../../store/slices/onboardingSlice';

interface Props { navigation: any }

const Onboarding17Screen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  useEffect(() => { dispatch(setCurrentStep(17)); }, [dispatch]);
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.error.dark, Colors.error.main, Colors.error.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
  <View style={styles.progress}><ProgressIndicator currentStep={17} totalSteps={30} variant="bars" showStepText={false} /></View>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        <View style={styles.scriptureCard}>
          <Text style={styles.scriptureText}>“Flee from sexual immorality.”</Text>
          <Text style={styles.scriptureRef}>— 1 Corinthians 6:18</Text>
        </View>
  <Text accessibilityRole="image" accessibilityLabel="Gender symbols icon" style={styles.centerIcon}>⚥</Text>
        <Text style={styles.title}>Pornography weakens desire</Text>
        <Text style={styles.subtitle}>
          Over 50% of heavy users report a loss of interest in real intimacy. God designed
          desire to flourish in faithful love—choose a path that leads to life.
        </Text>
        {/* Pagination Dots (mini-section pages 15-19) */}
        <View style={styles.paginationDots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <OnboardingButton title="Continue" onPress={() => navigation.navigate('Onboarding18')} variant="primary" style={{ marginTop: 24 }} />
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
  centerIcon: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  scriptureCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  scriptureText: { fontSize: responsiveFontSizes.body, color: Colors.text.primary, textAlign: 'center', fontStyle: 'italic' },
  scriptureRef: { fontSize: responsiveFontSizes.caption ?? 12, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 6, fontWeight: '600' },
  title: { fontSize: responsiveFontSizes.mainTitle, fontWeight: '800', color: Colors.text.primary, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: responsiveFontSizes.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  paginationDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: Colors.white },
});

export default Onboarding17Screen;
