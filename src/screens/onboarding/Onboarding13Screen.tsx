import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressIndicator from '../../components/ProgressIndicator';
import OnboardingButton from '../../components/OnboardingButton';
import { Colors } from '../../constants';
import { responsiveFontSizes, responsiveSpacing } from '../../utils/responsive';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { savePersonalInfo, setCurrentStep } from '../../store/slices/onboardingSlice';

interface Props { navigation: any }

const Onboarding13Screen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const personal = useAppSelector((s) => s.onboarding.personalInfo) || {};
  const [firstName, setFirstName] = useState<string>((personal.firstName as string) || '');
  const [age, setAge] = useState<string>('');

  useEffect(() => { dispatch(setCurrentStep(13)); }, [dispatch]);

  const canContinue = useMemo(() => firstName.trim().length > 0 && age.trim().length > 0, [firstName, age]);

  const ageToRange = (n: number): string => {
    if (Number.isNaN(n)) return '';
    if (n < 18) return '<18';
    if (n <= 24) return '18-24';
    if (n <= 34) return '25-34';
    if (n <= 44) return '35-44';
    if (n <= 54) return '45-54';
    return '55+';
  };

  const onSubmit = () => {
    const n = parseInt(age, 10);
    const ageRange = ageToRange(n);
    if (firstName.trim()) {
      dispatch(savePersonalInfo({ firstName: firstName.trim(), ageRange }));
    }
    navigation.navigate('Onboarding14');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background.primary, Colors.background.secondary, '#06b6d4']} style={StyleSheet.absoluteFill} />

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
          <Text style={{ color: Colors.text.primary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressIndicator currentStep={13} totalSteps={30} variant="bars" showStepText={false} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.title}>Finally</Text>
          <Text style={styles.subtitle}>A bit more about you</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={Colors.text.secondary}
              style={styles.input}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              value={age}
              onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
              placeholder="Age"
              placeholderTextColor={Colors.text.secondary}
              style={styles.input}
              keyboardType="number-pad"
              returnKeyType="done"
            />
          </View>

          <View style={{ marginTop: 24 }}>
            <OnboardingButton title="Finish this part" onPress={onSubmit} variant="primary" disabled={!canContinue} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  progressWrapper: { flex: 1, alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: responsiveSpacing.lg, paddingTop: 8 },
  title: { fontSize: responsiveFontSizes.mainTitle, fontWeight: '800', color: Colors.text.primary, textAlign: 'center' },
  subtitle: { fontSize: responsiveFontSizes.headerSubtitle, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 24 },
  inputWrapper: { backgroundColor: Colors.background.secondary, borderColor: Colors.border.primary, borderWidth: 1, borderRadius: 9999, paddingHorizontal: 18, paddingVertical: 14, marginBottom: 16 },
  input: { color: Colors.text.primary, fontSize: responsiveFontSizes.body },
});

export default Onboarding13Screen;
