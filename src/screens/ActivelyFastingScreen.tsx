import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, TextInput } from 'react-native-paper';
import { Colors } from '../constants';
import fastingService from '../services/fastingService';
import { useNavigation } from '@react-navigation/native';

const pad = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

const ActivelyFastingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [goal, setGoal] = useState<string | undefined>(undefined);
  const [fastId, setFastId] = useState<number | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [journal, setJournal] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fastingService.list({ status: 'active', page: 1, limit: 1 });
      const item = res.items?.[0];
      if (item) {
        setStart(new Date(item.startTime));
        setEnd(new Date(item.endTime));
        setGoal(item.goal || undefined);
        setFastId(item.id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current as any);
    timerRef.current = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => {
  if (timerRef.current) clearInterval(timerRef.current as any);
    };
  }, []);

  const remaining = useMemo(() => {
    if (!end) return { h: '00', m: '00', s: '00' };
    const ms = Math.max(0, end.getTime() - now.getTime());
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return { h: pad(h), m: pad(m), s: pad(s) };
  }, [end, now]);

  const progress = useMemo(() => {
    if (!start || !end) return { pct: 0, elapsedH: 0, totalH: 0 };
    const total = Math.max(0, end.getTime() - start.getTime());
    const elapsed = Math.max(0, Math.min(now.getTime(), end.getTime()) - start.getTime());
    const pct = total ? Math.min(100, (elapsed / total) * 100) : 0;
    return { pct, elapsedH: Math.round((elapsed / 3600000) * 10) / 10, totalH: Math.round((total / 3600000) * 10) / 10 };
  }, [start, end, now]);

  const handlePause = () => {
    setPaused((p) => !p);
  };

  const handleEnd = async () => {
    if (!fastId) return;
    try {
      await fastingService.endEarly(fastId);
      // Refresh entry screen so it decides again
      navigation.replace('FastingEntry');
    } catch {
      // noop for now
    }
  };

  const handleSaveJournal = () => {
    const text = journal.trim();
    if (!text) {
      Alert.alert('Empty journal', 'Please write something before saving.');
      return;
    }
    // Future: send to backend once endpoint is available
    Alert.alert('Journal saved', 'Your entry has been saved locally.');
    setJournal('');
  };

  const dateLabel = useMemo(() => {
    const d = now;
    return d.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' });
  }, [now]);
   
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.bigDate}>{dateLabel}</Text>
      </View>

      <Text style={styles.sectionTitle}>Remaining Time</Text>

      <View style={styles.timeRow}>
        <View style={styles.timeCol}>
          <View style={styles.timeBox}><Text style={styles.timeNum}>{remaining.h}</Text></View>
          <View style={styles.center}><Text style={styles.timeLabel}>Hours</Text></View>
        </View>
        <View style={styles.timeCol}>
          <View style={styles.timeBox}><Text style={styles.timeNum}>{remaining.m}</Text></View>
          <View style={styles.center}><Text style={styles.timeLabel}>Minutes</Text></View>
        </View>
        <View style={styles.timeCol}>
          <View style={styles.timeBox}><Text style={styles.timeNum}>{remaining.s}</Text></View>
          <View style={styles.center}><Text style={styles.timeLabel}>Seconds</Text></View>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.rowBetween}>
          <Text style={styles.progressTitle}>Fasting Progress</Text>
          <Text style={styles.progressMeta}>{progress.elapsedH}/{progress.totalH} hours</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress.pct}%` }]} />
        </View>
      </View>

      {!!goal && (
        <Text style={styles.tip}>In your fast, {goal}</Text>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.btn, styles.btnMuted]} onPress={handlePause}>
          <Text style={styles.btnText}>{paused ? 'Resume' : 'Pause'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleEnd}>
          <Text style={styles.btnText}>End Fasting</Text>
        </TouchableOpacity>
      </View>

      

      <View style={styles.timelineWrapper}>
        <View style={styles.timelineRow}>
          <View style={styles.timelineLeftCol}>
            <View style={styles.dot} />
            <View style={styles.rail} />
          </View>
          <View style={styles.timelineRightCol}>
            <Text style={styles.timelineTitle}>{start ? start.toLocaleString() : ''}</Text>
            <Text style={styles.timelineSub}>Starting Time</Text>
          </View>
        </View>
        <View style={styles.timelineRow}>
          <View style={styles.timelineLeftCol}>
            <View style={styles.rail} />
            <View style={styles.dot} />
          </View>
          <View style={styles.timelineRightCol}>
            <Text style={styles.timelineTitle}>{end ? end.toLocaleString() : ''}</Text>
            <Text style={styles.timelineSub}>End Time</Text>
          </View>
        </View>
      </View>

      <View style={styles.journalWrap}>
        <Text style={styles.sectionTitle}>Journal</Text>
        <TextInput
          value={journal}
          onChangeText={setJournal}
          placeholder="Write your reflections, prayers, or progress..."
          multiline
          numberOfLines={5}
          style={styles.journalInput}
          placeholderTextColor="#93acc8"
          selectionColor={Colors.primary.main}
          underlineStyle={{ display: 'none' }}
          theme={{ colors: { text: Colors.white } }}
        />
        <View style={styles.singleActionWrap}>
          <TouchableOpacity style={[styles.singleAction]} onPress={handleSaveJournal}>
            <Text style={styles.singleActionText}>Save Journal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: Colors.background.primary },
  headerWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,  backgroundColor: Colors.background.primary },
  headerRow: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',  backgroundColor: Colors.background.primary, },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#243447' },
  bigDate: { color: Colors.white, fontSize: 28, fontWeight: '700' },
  sectionTitle: { color: Colors.white, fontSize: 16, fontWeight: '700', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  timeRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 16, paddingVertical: 12 },
  timeCol: { flex: 1 },
  timeBox: { height: 56, backgroundColor: Colors.background.secondary, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  timeNum: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  center: { alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  timeLabel: { color: Colors.white, fontSize: 12 },
  progressWrap: { paddingHorizontal: 16, paddingVertical: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { color: Colors.white },
  progressMeta: { color: Colors.white, fontSize: 12 },
  progressBarBg: { height: 8, backgroundColor: Colors.background.tertiary, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, backgroundColor: '#1979e6' },
  tip: { color: Colors.white, fontSize: 14, textAlign: 'center', paddingHorizontal: 16, paddingTop: 8 },
  actionsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12 },
  btn: { height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', flex: 1 },
  btnMuted: { backgroundColor: Colors.background.secondary },
  btnPrimary: { backgroundColor: '#1979e6' },
  btnText: { color: Colors.white, fontWeight: '700' },
  singleActionWrap: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 12 },
  singleAction: { height: 40, borderRadius: 8, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background.secondary },
  singleActionText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  timelineWrapper: { paddingHorizontal: 16, paddingVertical: 8 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  timelineLeftCol: { width: 40, alignItems: 'center' },
  timelineRightCol: { flex: 1 },
  rail: { width: 2, backgroundColor: '#344b65', height: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white },
  timelineTitle: { color: Colors.white, fontWeight: '500' },
  timelineSub: { color: '#93acc8' },
  avatarsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 8 },
  avatarWrap: { width: 28 },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#243447', borderWidth: 3, borderColor: Colors.background.primary },
  footerNote: { color: '#93acc8', fontSize: 12, paddingHorizontal: 16, paddingVertical: 8 },
  journalWrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  journalInput: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.background.tertiary,
    borderRadius: 8,
    color: Colors.white,
    paddingHorizontal: 12,
    paddingTop: 12,
    minHeight: 120,
    textAlignVertical: 'top',
  },
});

export default ActivelyFastingScreen;
