import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressIndicator from '../../components/ProgressIndicator';
import OnboardingButton from '../../components/OnboardingButton';
import MiniSectionDots from '../../components/MiniSectionDots';
import { Colors } from '../../constants';
import { responsiveFontSizes, responsiveSpacing } from '../../utils/responsive';
import { useAppDispatch } from '../../store/hooks';
import { setCurrentStep } from '../../store/slices/onboardingSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Path, Circle, Text as SvgText, Line } from 'react-native-svg';

interface Props { navigation: any }

const Onboarding27Screen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  useEffect(() => { dispatch(setCurrentStep(27)); }, [dispatch]);
  // Stars
  const stars = useMemo(
    () => [
      { top: '15%', left: '20%', size: 3, delay: 0 },
      { top: '25%', left: '75%', size: 2, delay: 300 },
      { top: '45%', left: '30%', size: 3, delay: 600 },
      { top: '65%', left: '80%', size: 2, delay: 900 },
      { top: '35%', left: '85%', size: 3, delay: 1200 },
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
        colors={[
          Colors.background.primary,
          Colors.background.secondary,
          Colors.background.tertiary,
          Colors.background.quaternary,
          '#06b6d4',
        ]}
        locations={[0, 0.25, 0.55, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
              backgroundColor: 'rgba(255,255,255,0.2)',
              opacity: starOpacities[i],
            }}
          />
        ))}
      </View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
  <View style={styles.progress}><ProgressIndicator currentStep={27} totalSteps={30} variant="bars" showStepText={false} /></View>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        {/* Scripture banner */}
        <View style={styles.scriptureBox}>
          <Text style={styles.scriptureText}>
            “Those who hope in the Lord will renew their strength.” — Isaiah 40:31
          </Text>
        </View>

        {/* Icon divider */}
        <Icon name="stats-chart" size={36} color="#06b6d4" style={styles.iconDivider} />

        <Text style={styles.title}>Rewiring Wins</Text>
        <Text style={styles.subtitle}>
          With thepurityapp and God’s grace, progress compounds. Below, a simple picture:
          thepurityapp’s green path climbs steadily while conventional methods stumble with relapses.
        </Text>

        {/* Simple chart */}
        <View style={styles.chartWrap}>
          <Svg width="100%" height="180" viewBox="0 0 300 180">
            {/* grid */}
            <Line x1="10" y1="150" x2="290" y2="150" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <Line x1="10" y1="110" x2="290" y2="110" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <Line x1="10" y1="70" x2="290" y2="70" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            {/* thepurityapp success line */}
            <Path d="M20 150 Q80 120 120 90 Q160 65 200 50 Q240 35 280 20" stroke="#10b981" strokeWidth="3" fill="none" />
            <Circle cx="280" cy="20" r="4" fill="#10b981" />
            <SvgText x="230" y="18" fill="#10b981" fontSize="10">Sobriety</SvgText>
            {/* Conventional methods failure line */}
            <Path d="M20 150 Q40 145 60 148 Q80 150 100 142 Q120 135 140 146 Q160 158 180 140 Q200 120 220 142 Q240 162 260 150 Q280 140 290 155" stroke="#dc2626" strokeWidth="3" fill="none" />
            {/* Relapse markers */}
            <SvgText x="70" y="160" fill="#dc2626" fontSize="12">✕</SvgText>
            <SvgText x="130" y="156" fill="#dc2626" fontSize="12">✕</SvgText>
            <SvgText x="190" y="150" fill="#dc2626" fontSize="12">✕</SvgText>
            <SvgText x="250" y="160" fill="#dc2626" fontSize="12">✕</SvgText>
          </Svg>
        </View>

  <MiniSectionDots 
    total={9} 
    active={8} 
    inactiveColor="rgba(34, 197, 94, 0.3)" 
    activeColor="#22c55e" 
  />
  <OnboardingButton
          title="Continue"
          onPress={() => navigation.navigate('Onboarding28')}
          variant="primary"
          style={{ marginTop: 16 }}
          rightIconName="chevron-forward"
          rightIconLibrary="Ionicons"
          rightIconSize={20}
        />
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
  scriptureBox: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 20,
  },
  scriptureText: {
    color: Colors.text.secondary,
    fontStyle: 'italic',
    fontSize: responsiveFontSizes.body,
    textAlign: 'center',
  },
  iconDivider: { alignSelf: 'center', marginBottom: 16, opacity: 0.85 },
  title: { fontSize: responsiveFontSizes.mainTitle, fontWeight: '800', color: Colors.text.primary, textAlign: 'center', marginBottom: 14 },
  subtitle: { fontSize: responsiveFontSizes.body, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: 12 },
  chartWrap: { marginTop: 8, marginBottom: 12 },
  emphasis: { fontWeight: '700', color: Colors.text.primary },
});

export default Onboarding27Screen;
