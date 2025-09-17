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

const Onboarding25Screen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  useEffect(() => { dispatch(setCurrentStep(25)); }, [dispatch]);

  // Twinkling stars like previous screens
  const stars = useMemo(
    () => [
      { top: '20%', left: '15%', size: 3, delay: 0 },
      { top: '30%', left: '80%', size: 2, delay: 300 },
      { top: '60%', left: '25%', size: 3, delay: 600 },
      { top: '78%', left: '68%', size: 2, delay: 900 },
      { top: '42%', left: '90%', size: 3, delay: 1200 },
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
      {/* Bright highlight overlay */}
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
            key={`star-${i}`}
            style={{
              position: 'absolute',
              top: s.top as any,
              left: s.left as any,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
              backgroundColor: 'rgba(255,255,255,0.9)',
              opacity: starOpacities[i],
            }}
          />
        ))}
      </View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
  <View style={styles.progress}><ProgressIndicator currentStep={25} totalSteps={30} variant="bars" showStepText={false} /></View>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        {/* Scripture banner */}
        <View style={styles.scriptureBox}>
          <Text style={styles.scriptureText}>
            “I came that they may have life and have it abundantly.” — John 10:10
          </Text>
        </View>

        {/* Icon divider */}
  <Icon name="star" size={36} color="#ffffff" style={styles.iconDivider} />

        <Text style={styles.title}>Improve Your Life</Text>
        <Text style={styles.subtitle}>
          As you step away from pornography, your mind and body begin to heal. {'\n'}
          With God’s help, <Text style={styles.emphasis}>strength returns</Text>,
          <Text style={styles.emphasis}> joy deepens</Text>, and
          <Text style={styles.emphasis}> peace grows</Text>—a healthier, happier you.
        </Text>
  <MiniSectionDots total={9} active={6} />
  <OnboardingButton
          title="Continue"
          onPress={() => navigation.navigate('Onboarding26')}
          variant="primary"
          style={{ marginTop: 28 }}
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 20,
  },
  scriptureText: {
    color: 'rgba(255,255,255,0.95)',
    fontStyle: 'italic',
    fontSize: responsiveFontSizes.body,
    textAlign: 'center',
  },
  iconDivider: { alignSelf: 'center', marginBottom: 16, opacity: 0.95 },
  title: { fontSize: responsiveFontSizes.mainTitle, fontWeight: '800', color: Colors.text.primary, textAlign: 'center', marginBottom: 14 },
  subtitle: { fontSize: responsiveFontSizes.body, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 22 },
  emphasis: { fontWeight: '700', color: '#ffffff' },
});

export default Onboarding25Screen;
