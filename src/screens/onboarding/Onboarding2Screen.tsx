/**
 * Onboarding Screen 2 - Faith Background & Customization
 *
 * Faith-focused form to customize the spiritual experience.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Chip } from 'react-native-paper';

import OnboardingButton from '../../components/OnboardingButton';
import ProgressIndicator from '../../components/ProgressIndicator';
import { Colors } from '../../constants';
import { responsiveFontSizes, responsiveSpacing } from '../../utils/responsive';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveFaithData, setCurrentStep } from '../../store/slices/onboardingSlice';

interface Onboarding2ScreenProps { navigation: any }

interface FaithDataForm {
  relationshipWithJesus: string;
  churchInvolvement: string;
  prayerFrequency: string;
  christianInfluences: string;
  bibleTranslation: string;
  spiritualStruggle: string;
  favorite?: string;
}

const Onboarding2Screen: React.FC<Onboarding2ScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const sliderRef = useRef<ScrollView | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const existingFaithData = useAppSelector(state => state.onboarding.faithData);

  const [formData, setFormData] = useState<FaithDataForm>({
    relationshipWithJesus: existingFaithData.relationshipWithJesus || '',
    churchInvolvement: existingFaithData.churchInvolvement || '',
    prayerFrequency: existingFaithData.prayerFrequency || '',
    christianInfluences: existingFaithData.christianInfluences || '',
    bibleTranslation: existingFaithData.bibleTranslation || '',
    spiritualStruggle: existingFaithData.spiritualStruggle || '',
  favorite: existingFaithData.favorite || '',
  });

  const [influencesList, setInfluencesList] = useState<string[]>(() => {
    const existing = existingFaithData.christianInfluences || '';
    return existing ? existing.split(',').map(s => s.trim()).filter(Boolean) : [];
  });
  const [influenceInput, setInfluenceInput] = useState('');

  useEffect(() => { dispatch(setCurrentStep(2)); }, [dispatch]);

  const questions = useMemo(() => ([
    {
      id: 'relationshipWithJesus',
      title: 'How would you describe your relationship with Jesus?',
      field: 'relationshipWithJesus' as const,
      options: [
        { label: 'Growing closer', value: 'growing-closer' },
        { label: 'Just starting', value: 'just-starting' },
        { label: "It\'s complicated", value: 'complicated' },
        { label: 'Strong', value: 'strong' },
      ],
      required: true,
    },
    {
      id: 'churchInvolvement',
      title: 'How involved are you in a church community?',
      field: 'churchInvolvement' as const,
      options: [
        { label: 'Very involved', value: 'very-involved' },
        { label: 'Somewhat involved', value: 'somewhat-involved' },
        { label: 'Not currently involved', value: 'not-involved' },
        { label: 'Looking for a church', value: 'looking' },
      ],
      required: true,
    },
    {
      id: 'prayerFrequency',
      title: 'How often do you pray?',
      field: 'prayerFrequency' as const,
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'A few times a week', value: 'few-times-week' },
        { label: 'Occasionally', value: 'occasionally' },
        { label: 'Rarely', value: 'rarely' },
      ],
      required: true,
    },
    {
      id: 'christianInfluences',
      title: 'Who are your biggest Christian influences?',
      subtitle: 'Add influences one by one or separate multiple with commas. Tap the X to remove.',
      field: 'christianInfluences' as const,
      type: 'chip-input',
      required: false,
    },
    {
      id: 'bibleTranslation',
      title: 'What is your preferred Bible translation?',
      field: 'bibleTranslation' as const,
      options: [
        { label: 'NIV', value: 'niv' },
        { label: 'ESV', value: 'esv' },
        { label: 'KJV', value: 'kjv' },
        { label: 'NLT', value: 'nlt' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      id: 'spiritualStruggle',
      title: 'What is your biggest spiritual struggle?',
      subtitle: 'e.g., Consistency in prayer, doubt',
      field: 'spiritualStruggle' as const,
      type: 'text-input',
      required: false,
    },
  ]), []);

  // total slides = questions + 1 extra "favorite" slide
  const totalSlides = questions.length + 1;

  const setField = (field: keyof FaithDataForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddInfluence = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (influencesList.includes(trimmed)) return;
    const updated = [...influencesList, trimmed];
    setInfluencesList(updated);
    setField('christianInfluences', updated.join(', '));
    setInfluenceInput('');
  };

  const handleInfluenceSubmit = () => {
    if (influenceInput.includes(',')) {
      influenceInput.split(',').forEach((x) => handleAddInfluence(x));
      setInfluenceInput('');
    } else {
      handleAddInfluence(influenceInput);
    }
  };

  const handleFinish = () => {
    // basic required validation for required fields
  const requiredFields: (keyof FaithDataForm)[] = ['relationshipWithJesus', 'churchInvolvement', 'prayerFrequency', 'bibleTranslation'];
    const requiredMissing = requiredFields.some((k) => !formData[k]);
    if (requiredMissing) return;
    dispatch(saveFaithData(formData));
    navigation.navigate('Onboarding3');
  };

  const goToSlide = (index: number) => {
    const clamped = Math.max(0, Math.min(index, totalSlides - 1));
    setCurrentSlide(clamped);
    sliderRef.current?.scrollTo({ x: width * clamped, animated: true });
  };

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      goToSlide(currentSlide + 1);
      return;
    }
    handleFinish();
  };

  const onMomentumEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentSlide(idx);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background.primary, Colors.background.secondary, '#22d3ee']} style={StyleSheet.absoluteFill} />

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40 }}>
          <Text style={{ color: Colors.text.primary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressIndicator currentStep={2} totalSteps={30} variant="bars" showStepText={false} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.contentHeader}>
        <Text style={styles.title}>Faith background</Text>
        <Text style={styles.subtitle}>A few questions to personalize scriptures, devotionals, and guidance.</Text>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={sliderRef}
        onMomentumScrollEnd={onMomentumEnd}
        contentContainerStyle={{ alignItems: 'stretch' }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Slide 0: Relationship with Jesus */}
        <View style={[styles.slide, { width }]}> 
          <Text style={styles.questionTitle}>How would you describe your relationship with Jesus?</Text>
          <View style={styles.optionsContainer}>
            {questions[0].options!.map((opt) => (
              <TouchableOpacity key={opt.value} onPress={() => setField('relationshipWithJesus', opt.value)} activeOpacity={0.9}>
                <View style={[styles.optionItem, formData.relationshipWithJesus === opt.value && styles.optionItemSelected] as any}>
                  <View style={styles.optionRow}>
                    <Text style={[styles.optionLabel, formData.relationshipWithJesus === opt.value && styles.optionLabelSelected]}>{opt.label}</Text>
                    <Text style={styles.optionIcon}>{formData.relationshipWithJesus === opt.value ? '✓' : '›'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {/* dots under options */}
          <View style={styles.dotsRow}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <View key={`dot-${i}`} style={[styles.dot, currentSlide === i && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Slide 1: Church involvement */}
        <View style={[styles.slide, { width }]}> 
          <Text style={styles.questionTitle}>How involved are you in a church community?</Text>
          <View style={styles.optionsContainer}>
            {questions[1].options!.map((opt) => (
              <TouchableOpacity key={opt.value} onPress={() => setField('churchInvolvement', opt.value)} activeOpacity={0.9}>
                <View style={[styles.optionItem, formData.churchInvolvement === opt.value && styles.optionItemSelected] as any}>
                  <View style={styles.optionRow}>
                    <Text style={[styles.optionLabel, formData.churchInvolvement === opt.value && styles.optionLabelSelected]}>{opt.label}</Text>
                    <Text style={styles.optionIcon}>{formData.churchInvolvement === opt.value ? '✓' : '›'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.dotsRow}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <View key={`dot-${i}`} style={[styles.dot, currentSlide === i && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Slide 2: Prayer frequency */}
        <View style={[styles.slide, { width }]}> 
          <Text style={styles.questionTitle}>How often do you pray?</Text>
          <View style={styles.optionsContainer}>
            {questions[2].options!.map((opt) => (
              <TouchableOpacity key={opt.value} onPress={() => setField('prayerFrequency', opt.value)} activeOpacity={0.9}>
                <View style={[styles.optionItem, formData.prayerFrequency === opt.value && styles.optionItemSelected] as any}>
                  <View style={styles.optionRow}>
                    <Text style={[styles.optionLabel, formData.prayerFrequency === opt.value && styles.optionLabelSelected]}>{opt.label}</Text>
                    <Text style={styles.optionIcon}>{formData.prayerFrequency === opt.value ? '✓' : '›'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.dotsRow}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <View key={`dot-${i}`} style={[styles.dot, currentSlide === i && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Slide 3: Christian influences chips */}
        <View style={[styles.slide, { width }]}> 
          <Text style={styles.questionTitle}>Who are your biggest Christian influences?</Text>
          <Text style={styles.helperText}>Add influences one by one or separate multiple with commas. Tap the X to remove.</Text>
          {influencesList.length > 0 && (
            <View style={styles.influencesContainer}>
              {influencesList.map((influence, idx) => (
                <Chip
                  key={`${influence}-${idx}`}
                  mode="outlined"
                  onClose={() => {
                    const next = influencesList.filter((x) => x !== influence);
                    setInfluencesList(next);
                    setField('christianInfluences', next.join(', '));
                  }}
                  style={styles.influenceChip}
                  textStyle={styles.influenceChipText}
                >
                  {influence}
                </Chip>
              ))}
            </View>
          )}
          <TextInput
            mode="outlined"
            label="Add an influence"
            placeholder="e.g., C.S. Lewis, Pastor John"
            value={influenceInput}
            onChangeText={setInfluenceInput}
            onSubmitEditing={handleInfluenceSubmit}
            onBlur={handleInfluenceSubmit}
            style={styles.input}
            right={influenceInput.trim() ? <TextInput.Icon icon="plus" onPress={handleInfluenceSubmit} /> : null}
          />
          <View style={styles.dotsRow}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <View key={`dot-${i}`} style={[styles.dot, currentSlide === i && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Slide 4: Bible translation */}
        <View style={[styles.slide, { width }]}> 
          <Text style={styles.questionTitle}>What is your preferred Bible translation?</Text>
          <View style={styles.optionsContainer}>
            {questions[4].options!.map((opt) => (
              <TouchableOpacity key={opt.value} onPress={() => setField('bibleTranslation', opt.value)} activeOpacity={0.9}>
                <View style={[styles.optionItem, formData.bibleTranslation === opt.value && styles.optionItemSelected] as any}>
                  <View style={styles.optionRow}>
                    <Text style={[styles.optionLabel, formData.bibleTranslation === opt.value && styles.optionLabelSelected]}>{opt.label}</Text>
                    <Text style={styles.optionIcon}>{formData.bibleTranslation === opt.value ? '✓' : '›'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.dotsRow}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <View key={`dot-${i}`} style={[styles.dot, currentSlide === i && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Slide 5: Spiritual struggle */}
        <View style={[styles.slide, { width }]}> 
          <Text style={styles.questionTitle}>What is your biggest spiritual struggle?</Text>
          <TextInput
            mode="outlined"
            placeholder="e.g., Consistency in prayer, doubt"
            value={formData.spiritualStruggle}
            onChangeText={(t) => setField('spiritualStruggle', t)}
            style={styles.input}
          />
          <View style={styles.dotsRow}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <View key={`dot-${i}`} style={[styles.dot, currentSlide === i && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Slide 6: Favorite */}
        <View style={[styles.slide, { width }]}> 
          <Text style={styles.questionTitle}>What is your favorite worship song or Bible verse?</Text>
          <TextInput
            mode="outlined"
            placeholder="e.g., Psalm 23, Way Maker"
            value={formData.favorite}
            onChangeText={(t) => setField('favorite', t)}
            style={styles.input}
          />
          <View style={styles.dotsRow}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <View key={`dot-${i}`} style={[styles.dot, currentSlide === i && styles.dotActive]} />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <OnboardingButton title={currentSlide >= totalSlides - 1 ? 'Next' : 'Continue'} onPress={currentSlide >= totalSlides - 1 ? handleFinish : handleNext} variant="primary" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  progressWrapper: { flex: 1, alignItems: 'center' },
  // Header copy above the slider
  contentHeader: { paddingHorizontal: responsiveSpacing.lg, paddingTop: 16, paddingBottom: 8 },
  // legacy scrollContent removed in favor of slider
  scrollContent: { flexGrow: 1 },
  title: { fontSize: responsiveFontSizes.mainTitle, fontWeight: '800', color: Colors.text.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: responsiveFontSizes.headerSubtitle, color: Colors.text.secondary, textAlign: 'center', marginBottom: 16 },
  // slide container for each question
  slide: { paddingHorizontal: responsiveSpacing.lg, justifyContent: 'center' },
  questionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, marginBottom: 12, textAlign: 'center' },
  optionsContainer: { gap: 10 },
  // flattened, non-card look
  optionItem: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.25)', padding: 14, borderRadius: 12 },
  optionItemSelected: { borderColor: Colors.primary.main, backgroundColor: `${Colors.primary.main}10`, borderWidth: 2 },
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  optionLabel: { flex: 1, color: Colors.text.primary, fontSize: 16, fontWeight: '500' },
  optionLabelSelected: { color: Colors.primary.main, fontWeight: '700' },
  optionIcon: { color: Colors.text.secondary, fontSize: 22, marginLeft: 8 },
  helperText: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 8, fontSize: 13 },
  influencesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  influenceChip: { backgroundColor: `${Colors.primary.main}10`, borderColor: Colors.primary.main },
  influenceChipText: { color: Colors.text.primary },
  input: { backgroundColor: Colors.background.tertiary },
  // pagination dots
  dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 18, height: 6, borderRadius: 3, backgroundColor: Colors.primary.main },
  buttonContainer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, borderTopWidth: 1, borderTopColor: Colors.border.primary, backgroundColor: Colors.background.primary },
});

export default Onboarding2Screen;
