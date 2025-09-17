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
import Svg, { Path, Circle } from 'react-native-svg';

interface Props { navigation: any }

const Onboarding15Screen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  useEffect(() => { dispatch(setCurrentStep(15)); }, [dispatch]);
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
  <View style={styles.progress}><ProgressIndicator currentStep={15} totalSteps={30} variant="bars" showStepText={false} /></View>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        {/* Brain Icon */}
        <View style={styles.scriptureCard}>
          <Text style={styles.scriptureText}>“Do not be conformed to this world, but be transformed by the renewal of your mind.”</Text>
          <Text style={styles.scriptureRef}>— Romans 12:2</Text>
        </View>
        
        <View style={styles.brainIconContainer}>
          <Svg width={120} height={120} viewBox="0 0 120 120" fill="none">
            <Path d="M60 20C45 20 35 30 35 45C35 50 36 54 38 58C32 62 28 68 28 75C28 85 35 92 45 92H75C85 92 92 85 92 75C92 68 88 62 82 58C84 54 85 50 85 45C85 30 75 20 60 20Z" fill="#FFB3BA" stroke="white" strokeWidth={2} />
            <Circle cx={50} cy={50} r={3} fill="white" />
            <Circle cx={70} cy={50} r={3} fill="white" />
            <Path d="M45 65C50 70 60 70 65 65" stroke="white" strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </View>

        <Text style={styles.title}>Pornography is a drug</Text>
        <Text style={styles.subtitle}>
          Porn use releases a brain chemical called <Text style={styles.bold}>dopamine</Text>. This chemical makes you{' '}
          <Text style={styles.bold}>feel good</Text>, that's why you experience pleasure when you{' '}
          <Text style={styles.bold}>watch pornography</Text>. Through <Text style={styles.bold}>faith in Christ</Text>, your mind can be renewed and real freedom is possible.
        </Text>

        {/* Pagination Dots for this mini-section (5 pages) */}
        <View style={styles.paginationDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <OnboardingButton
          title="Continue"
          onPress={() => navigation.navigate('Onboarding16')}
          variant="primary"
          rightIconName="chevron-forward"
          style={{ marginTop: 24 }}
        />

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.error.main },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  progress: { flex: 1, alignItems: 'center' },
  back: { color: Colors.text.primary, fontSize: 18 },
  content: { flex: 1, paddingHorizontal: responsiveSpacing.lg, justifyContent: 'center' },
  brainIconContainer: { alignItems: 'center', marginBottom: 32 },
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
  subtitle: { fontSize: responsiveFontSizes.body, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 22 },
  bold: { fontWeight: '700', color: Colors.white },
  paginationDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: Colors.white },
});

export default Onboarding15Screen;
