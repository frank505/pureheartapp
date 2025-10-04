import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Polygon, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { Colors, ColorUtils } from '../constants';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { useAppSelector } from '../store';
import { useNavigation } from '@react-navigation/native';
import { addDays, subDays } from 'date-fns';

const { width } = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'ring' | 'radar'>('ring');
  const streaks = useAppSelector((s) => s.streaks.streaks);
  const checkins = useAppSelector((s) => s.checkins.items);
  const currentStreak = streaks?.currentStreak ?? 0;

  // Helper math
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const daysAgo = (d: Date) => (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);

  // Consistency over last 30 days from victories vs relapses
  const last30 = (checkins || []).filter((c: any) => c?.createdAt && daysAgo(new Date(c.createdAt)) <= 30);
  const victories = last30.filter((c: any) => c?.status === 'victory').length;
  const relapses = last30.filter((c: any) => c?.status === 'relapse').length;
  const denom = victories + relapses;
  const evidence = Math.min(1, denom / 10); // confidence in consistency data
  const consistency = denom > 0 ? victories / denom : 0.5; // neutral when no data

  // Streak score uses a log curve for slower early growth
  const streakScore = Math.log(1 + Math.max(0, currentStreak)) / Math.log(1 + 365);

  // Adaptive weights: rely more on streak when little evidence from check ins
  const wC = 0.3 * evidence;
  const wS = 1 - wC;

  // Recovery percentage
  const recoveryPct = Math.round(100 * clamp01(wS * streakScore + wC * consistency));

  // Animated ring progress
  const ringAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(ringAnim, { toValue: recoveryPct, duration: 800, useNativeDriver: false }).start();
  }, [recoveryPct]);
  const circumference = 2 * Math.PI * 80;
  const clampedPct = recoveryPct;
  const dashOffset = ringAnim.interpolate({ inputRange: [0, 100], outputRange: [circumference, 0] });

  // Radar axes dynamic: Faith, Scripture, Prayer, Community, Discipline, Relationships, Purpose, Mental, Physical, Work and study
  const axes = [
    { key: 'faith', label: 'Faith' },
    { key: 'scripture', label: 'Scripture' },
    { key: 'prayer', label: 'Prayer' },
    { key: 'community', label: 'Community' },
    { key: 'discipline', label: 'Discipline' },
    { key: 'relationships', label: 'Relationships' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'mental', label: 'Mental' },
    { key: 'physical', label: 'Physical' },
    { key: 'workStudy', label: 'Work and study' },
  ] as const;

  const v = {
    faith: clamp01(0.25 + 0.75 * streakScore * (0.5 + 0.5 * consistency)),
    scripture: clamp01(0.2 + 0.8 * streakScore * consistency),
    prayer: clamp01(0.3 + 0.7 * streakScore),
    community: clamp01(0.2 + 0.8 * Math.min(1, currentStreak / 120) * (0.5 + 0.5 * evidence)),
    discipline: clamp01(0.25 + 0.75 * consistency),
    relationships: clamp01(0.2 + 0.8 * Math.min(1, currentStreak / 180) * consistency),
    purpose: clamp01(0.25 + 0.75 * Math.min(1, currentStreak / 200)),
    mental: clamp01(0.2 + 0.8 * Math.sqrt(Math.min(1, currentStreak / 120)) * (0.6 + 0.4 * consistency)),
    physical: clamp01(0.2 + 0.8 * Math.min(1, currentStreak / 150)),
    workStudy: clamp01(0.25 + 0.75 * (0.6 * streakScore + 0.4 * consistency)),
  };
  const radarValuesArr = axes.map((a) => (v as any)[a.key] as number);
  const benefitPercents = radarValuesArr.map((x) => Math.round(x * 100));
  const barAnims = benefitPercents.map(() => useRef(new Animated.Value(0)).current);
  useEffect(() => {
    const seq = barAnims.map((a, i) => Animated.timing(a, { toValue: benefitPercents[i], duration: 800, useNativeDriver: false }));
    Animated.stagger(120, seq).start();
  }, [recoveryPct]);

  // Compute start of current streak similar to HomeScreen
  const streakStartDate = React.useMemo(() => {
    const days = currentStreak;
    const dates = (streaks as any)?.streakDates as any[] | undefined;
    if (dates && dates.length > 0) {
      const first = new Date(dates[0] as any);
      if (!isNaN(first.getTime())) return first;
    }
    return subDays(new Date(), days);
  }, [currentStreak, streaks]);

  // Target to quit by 90 days from start of current streak
  const quitTargetDate = addDays(streakStartDate, 90);
  const targetLabel = quitTargetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const firstLoginLabel = 'First Login date';

  return (
    <SafeAreaView style={styles.root}>
      <ScreenHeader title="Analytics" navigation={navigation} showBackButton={true} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.container, { paddingBottom: Math.max(80, insets.bottom + 24) }]}> 
        {/* Header Tabs */}
        <View style={styles.headerRow}>
          <View style={styles.tabSwitcher}>
            {(['ring','radar'] as const).map((t) => (
              <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.tabActive]} onPress={() => setActiveTab(t)}>
                <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t === 'ring' ? 'Ring' : 'Radar'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Visualization */}
        <View style={styles.visualWrap}>
          {activeTab === 'ring' ? (
            <View style={styles.ringWrap}>
              <Svg width={250} height={250} viewBox="0 0 200 200">
                <Defs>
                  <SvgLinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#4ade80" />
                    <Stop offset="100%" stopColor="#22c55e" />
                  </SvgLinearGradient>
                </Defs>
                <Circle cx={100} cy={100} r={80} stroke={Colors.border.primary} strokeWidth={8} fill="none" />
                <AnimatedCircle
                  cx={100}
                  cy={100}
                  r={80}
                  stroke="url(#ringGradient)"
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={dashOffset}
                  fill="none"
                />
                <Circle cx={100} cy={20} r={6} fill="#4ade80" />
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={styles.centerTitle}>RECOVERY</Text>
                <Text style={styles.centerPct}>{clampedPct}%</Text>
                <Text style={styles.centerStreak}>{currentStreak} D STREAK</Text>
              </View>
            </View>
          ) : (
            <View style={styles.radarWrap}>
              <Svg width={300} height={300} viewBox="0 0 300 300">
                <Defs>
                  <SvgLinearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <Stop offset="100%" stopColor="#4ade80" stopOpacity={0.1} />
                  </SvgLinearGradient>
                </Defs>
                <G stroke={Colors.border.secondary}>
                  {createRings(150, 150, 100, axes.length, [1, 0.75, 0.5, 0.25]).map((pts, idx) => (
                    <Polygon key={`ring-${idx}`} points={pts} fill="none" />
                  ))}
                  {createRadials(150, 150, 100, axes.length).map((ln, idx) => (
                    <Line key={`rad-${idx}`} {...ln} />
                  ))}
                </G>
                <Polygon points={computeRadarPolygon(150, 150, 100, radarValuesArr)} fill="url(#radarGradient)" stroke="#22c55e" strokeWidth={2} />
                {axes.map((a, i) => {
                  const { x, y, anchor } = labelPos(150, 150, 110, i, axes.length);
                  return (
                    <SvgText key={`lbl-${a.key}`} x={x} y={y} textAnchor={anchor as any} fill={Colors.text.primary} fontSize={11} fontWeight={500}>{a.label}</SvgText>
                  );
                })}
              </Svg>
              <View style={styles.radarCenter}><Text style={styles.radarPct}>{clampedPct}%</Text></View>
            </View>
          )}
        </View>

        {/* Motivation Section */}
        <View style={styles.motivation}>
          <Text style={styles.motivationLead}>You are on track to quit porn by:</Text>
          <View style={styles.dateBadge}><Text style={styles.dateBadgeText}>{targetLabel}</Text></View>
          <Text style={styles.journeyText}>Today marks the beginning of a powerful journey. One day at a time, your mind is being renewed and hope is rising.</Text>
        </View>

        {/* Mini Progress Chart */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your progress</Text>
          <View style={styles.chartBox}>
            <Svg width={width - 80} height={120} viewBox="0 0 300 80">
              <Defs>
                <SvgLinearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <Stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                </SvgLinearGradient>
              </Defs>
              <Path d="M 20 60 L 60 50 L 100 45 L 140 40 L 180 35 L 220 25 L 260 20" fill="url(#chartGradient)" />
              <Path d="M 20 60 L 60 50 L 100 45 L 140 40 L 180 35 L 220 25 L 260 20" fill="none" stroke="#60a5fa" strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </View>
          <View style={styles.chartLabels}>
            <Text style={styles.chartLabelText}>{firstLoginLabel}</Text>
            <Text style={styles.chartLabelText}>Today</Text>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          {[
            { icon: '📖', title: 'Deeper intimacy with Jesus', text: 'Regular obedience and prayer build trust and delight in God.', color1: '#667eea', color2: '#764ba2', pctIdx: axes.findIndex(a=>a.key==='faith') },
            { icon: '📜', title: 'Scripture intake', text: 'Time in the Word renews the mind and shapes desire.', color1: '#60a5fa', color2: '#2563eb', pctIdx: axes.findIndex(a=>a.key==='scripture') },
            { icon: '🙏', title: 'Prayer consistency', text: 'Prayer keeps you near to Jesus and strengthens resolve.', color1: '#f59e0b', color2: '#ef4444', pctIdx: axes.findIndex(a=>a.key==='prayer') },
            { icon: '👥', title: 'Church and community', text: 'Support and accountability help you stay the course.', color1: '#10b981', color2: '#34d399', pctIdx: axes.findIndex(a=>a.key==='community') },
            { icon: '🏁', title: 'Stronger discipline', text: 'Daily choices shape holy habits and steady self control.', color1: '#f093fb', color2: '#f5576c', pctIdx: axes.findIndex(a=>a.key==='discipline') },
            { icon: '🤝', title: 'Stronger relationships', text: 'Integrity and presence increase connection and trust.', color1: '#4facfe', color2: '#00f2fe', pctIdx: axes.findIndex(a=>a.key==='relationships') },
            { icon: '🎯', title: 'Purpose and calling', text: 'Clarity grows as distractions fade and Scripture leads.', color1: '#fa709a', color2: '#fee140', pctIdx: axes.findIndex(a=>a.key==='purpose') },
            { icon: '🧘', title: 'Mental clarity', text: 'Focus and peace increase with a renewed mind.', color1: '#a8edea', color2: '#fed6e3', pctIdx: axes.findIndex(a=>a.key==='mental') },
            { icon: '💪', title: 'Healthier body', text: 'Energy and sleep improve as habits are reset.', color1: '#34d399', color2: '#059669', pctIdx: axes.findIndex(a=>a.key==='physical') },
            { icon: '🧑‍💻', title: 'Work and study', text: 'Attention returns for deep work and steady progress.', color1: '#8b5cf6', color2: '#6366f1', pctIdx: axes.findIndex(a=>a.key==='workStudy') },
          ].map((b, i) => (
            <View key={b.title} style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: 'transparent' }]}> 
                <LinearGradient colors={[b.color1, b.color2]} style={styles.benefitIconGrad}>
                  <Text style={styles.benefitIconEmoji}>{b.icon}</Text>
                </LinearGradient>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitText}>{b.text}</Text>
                <View style={styles.progressBar}> 
                  <Animated.View style={[styles.progressFill, { width: barAnims[b.pctIdx].interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Sources */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: Colors.text.primary, fontWeight: '700', marginBottom: 8 }}>Sources</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3671693/')}>
            <Text style={styles.sourceLink}>Koenig H G. Religion, spirituality, and health. ISRN Psychiatry 2012.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://onlinelibrary.wiley.com/doi/abs/10.1002/ejsp.674')}>
            <Text style={styles.sourceLink}>Lally P and colleagues. Habit formation and time to automaticity. EJSP 2009.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://icd.who.int/browse11/l-m/en#/http://id.who.int/icd/entity/1630268048')}>
            <Text style={styles.sourceLink}>WHO ICD 11. Compulsive sexual behavior disorder.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3150158/')}>
            <Text style={styles.sourceLink}>Umberson D, Montez J. Social relationships and health. J Health Soc Behav 2010.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://pubmed.ncbi.nlm.nih.gov/16219682/')}>
            <Text style={styles.sourceLink}>Duckworth A, Seligman M. Self discipline predicts academic performance. Psychol Sci 2005.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://bjsm.bmj.com/content/52/24/1547')}>
            <Text style={styles.sourceLink}>Schuch F and colleagues. Physical activity and depression meta analysis. Br J Sports Med 2018.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.ncbi.nlm.nih.gov/books/NBK279320/')}>
            <Text style={styles.sourceLink}>Institute of Medicine. Sleep disorders and sleep deprivation. 2006.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000316')}>
            <Text style={styles.sourceLink}>Holt Lunstad J and colleagues. Social relationships and mortality risk. PLoS Med 2010.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://pubmed.ncbi.nlm.nih.gov/12585811/')}>
            <Text style={styles.sourceLink}>Emmons R and McCullough M. Gratitude and subjective well being in daily life. JPSP 2003.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.pnas.org/doi/10.1073/pnas.1010076108')}>
            <Text style={styles.sourceLink}>Moffitt T and colleagues. Childhood self control predicts adult health and success. PNAS 2011.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.sciencedirect.com/science/article/pii/S0065260106380020')}>
            <Text style={styles.sourceLink}>Gollwitzer P and Sheeran P. Implementation intentions and goal achievement meta analysis. 2006.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.nature.com/articles/nrn2298')}>
            <Text style={styles.sourceLink}>Hillman C, Erickson K, Kramer A. Exercise effects on brain and cognition. Nat Rev Neurosci 2008.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://link.springer.com/article/10.1007/s10865-015-9617-6')}>
            <Text style={styles.sourceLink}>Kredlow M and colleagues. Physical activity and sleep meta analysis. J Behav Med 2015.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://jamanetwork.com/journals/jamapsychiatry/fullarticle/1785171')}>
            <Text style={styles.sourceLink}>Bowen S and colleagues. Mindfulness relapse prevention randomized trial. JAMA Psychiatry 2014.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://onlinelibrary.wiley.com/doi/abs/10.2307/1388152')}>
            <Text style={styles.sourceLink}>Pargament K and colleagues. Religious coping and outcomes. J Sci Study Relig 1998.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2528790')}>
            <Text style={styles.sourceLink}>Li S, Stampfer M, VanderWeele T. Religious service attendance and mortality. JAMA Intern Med 2016.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.pnas.org/doi/10.1073/pnas.0707678104')}>
            <Text style={styles.sourceLink}>Tang Y and colleagues. Short term meditation improves attention and self regulation. PNAS 2007.</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Animated SVG circle wrapper
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.primary },
  container: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
  tabSwitcher: { flexDirection: 'row', backgroundColor: Colors.background.secondary, borderRadius: 25, padding: 4, borderWidth: 1, borderColor: Colors.border.primary },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  tabActive: { backgroundColor: Colors.primary.main },
  tabText: { color: Colors.text.secondary, fontWeight: '600' },
  tabTextActive: { color: Colors.white },

  visualWrap: { alignItems: 'center', marginBottom: 24 },
  ringWrap: { width: 250, height: 250, justifyContent: 'center', alignItems: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  centerTitle: { fontSize: 14, color: Colors.text.secondary, marginBottom: 6 },
  centerPct: { fontSize: 48, fontWeight: '700', color: Colors.text.primary },
  centerStreak: { fontSize: 12, letterSpacing: 2, color: Colors.text.tertiary },

  radarWrap: { width: 280, height: 280, alignItems: 'center', justifyContent: 'center' },
  radarCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  radarPct: { fontSize: 36, fontWeight: '700', color: Colors.secondary.main },

  motivation: { alignItems: 'center', marginBottom: 24 },
  motivationLead: { fontSize: 16, marginBottom: 12, color: Colors.text.primary },
  dateBadge: { backgroundColor: Colors.background.secondary, borderRadius: 25, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: Colors.border.primary, marginBottom: 12 },
  dateBadgeText: { color: Colors.text.primary, fontWeight: '600' },
  journeyText: { textAlign: 'center', color: Colors.text.secondary, lineHeight: 20 },

  progressCard: { backgroundColor: Colors.background.secondary, borderWidth: 1, borderColor: Colors.border.primary, borderRadius: 20, padding: 20, marginBottom: 24 },
  progressTitle: { color: Colors.text.primary, fontWeight: '600', fontSize: 18, marginBottom: 12 },
  chartBox: { height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  chartLabelText: { color: Colors.text.secondary, fontSize: 12 },

  benefits: { marginBottom: 24 },
  benefitItem: { flexDirection: 'row', backgroundColor: Colors.background.secondary, borderRadius: 15, padding: 16, borderWidth: 1, borderColor: Colors.border.primary, marginBottom: 12 },
  benefitIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  benefitIconGrad: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  benefitIconEmoji: { fontSize: 18 },
  benefitTitle: { color: Colors.text.primary, fontWeight: '600', fontSize: 16, marginBottom: 4 },
  benefitText: { color: Colors.text.secondary, fontSize: 14 },
  progressBar: { height: 4, backgroundColor: Colors.background.tertiary, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.secondary.main, borderRadius: 2 },
  sourceLink: { color: Colors.primary.main, textDecorationLine: 'underline', marginBottom: 6 },
});

export default AnalyticsScreen;

// Compute polygon string for radar given center, radius and N values in [0,1]
function computeRadarPolygon(cx: number, cy: number, r: number, vals: number[]) {
  const n = vals.length;
  const pts = vals.map((v, i) => {
    const ang = (-90 + (360 * i) / n) * (Math.PI / 180);
    const rr = r * Math.max(0.05, Math.min(1, v));
    const x = cx + rr * Math.cos(ang);
    const y = cy + rr * Math.sin(ang);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return pts.join(' ');
}

function createRings(cx: number, cy: number, r: number, nAxes: number, levels: number[]) {
  return levels.map((lvl) => {
    const vals = Array.from({ length: nAxes }, () => lvl);
    return computeRadarPolygon(cx, cy, r, vals);
  });
}

function createRadials(cx: number, cy: number, r: number, nAxes: number) {
  const lines = [] as Array<{ x1: number; y1: number; x2: number; y2: number }>;
  for (let i = 0; i < nAxes; i++) {
    const ang = (-90 + (360 * i) / nAxes) * (Math.PI / 180);
    lines.push({ x1: cx, y1: cy, x2: cx + r * Math.cos(ang), y2: cy + r * Math.sin(ang) });
  }
  return lines;
}

function labelPos(cx: number, cy: number, r: number, idx: number, nAxes: number) {
  const ang = (-90 + (360 * idx) / nAxes) * (Math.PI / 180);
  const x = cx + r * Math.cos(ang);
  const y = cy + r * Math.sin(ang);
  let anchor: 'start' | 'middle' | 'end' = 'middle';
  const deg = (-90 + (360 * idx) / nAxes) % 360;
  if (deg > -90 && deg < 90) anchor = 'start';
  if (deg > 90 || deg < -90) anchor = 'end';
  return { x, y, anchor };
}
