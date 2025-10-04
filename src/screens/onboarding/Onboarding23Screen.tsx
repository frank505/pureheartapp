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

interface Props { navigation: any }

const Onboarding23Screen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  useEffect(() => { dispatch(setCurrentStep(23)); }, [dispatch]);
  const stars = useMemo(
    () => [
      { top: '18%', left: '15%', size: 3, delay: 0 },
      { top: '30%', left: '82%', size: 2, delay: 300 },
      { top: '60%', left: '22%', size: 3, delay: 600 },
      { top: '78%', left: '68%', size: 2, delay: 900 },
      { top: '42%', left: '90%', size: 3, delay: 1200 },
    ],
    []
  );
  const starOpacities = useRef(stars.map(() => new Animated.Value(0.6))).current;
  useEffect(() => {
    const loops = starOpacities.map((op, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(op, { toValue: 1, duration: 1000, delay: stars[i].delay, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
        ])
      )
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [starOpacities, stars]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background.primary, Colors.background.secondary, Colors.background.tertiary, Colors.background.quaternary, '#06b6d4']}
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
      {/* Stars */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {stars.map((s, i) => (
          <Animated.View
            key={`star23-${i}`}
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
  <View style={styles.progress}><ProgressIndicator currentStep={23} totalSteps={30} variant="bars" showStepText={false} /></View>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        {/* Scripture banner */}
        <View style={styles.scriptureBox}>
          <Text style={styles.scriptureText}>
            “God is faithful, and He will not let you be tempted beyond your ability… He will also provide the way of escape.” — 1 Corinthians 10:13
          </Text>
        </View>

        {/* Icon divider */}
        <Icon name="shield-checkmark" size={36} color="#3b82f6" style={styles.iconDivider} />

        <Text style={styles.title}>Avoid relapse</Text>
        <Text style={styles.subtitle}>
          thepurityapp learns your habits and <Text style={styles.emphasis}>temptation triggers</Text>,
          offering <Text style={styles.emphasis}>24/7 protection</Text> and tools to help you choose the way of escape.
          {'\n'}You are not alone — <Text style={styles.emphasis}>God is with you</Text>.
        </Text>
  <MiniSectionDots 
    total={9} 
    active={4} 
    inactiveColor="rgba(34, 197, 94, 0.3)" 
    activeColor="#22c55e" 
  />
  <OnboardingButton title="Continue" onPress={() => navigation.navigate('Onboarding24')} variant="primary" style={{ marginTop: 12 }} />
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
  title: {
    fontSize: responsiveFontSizes.mainTitle,
    fontWeight: '800',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: responsiveFontSizes.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emphasis: { fontWeight: '700', color: Colors.text.primary },
});

export default Onboarding23Screen;
