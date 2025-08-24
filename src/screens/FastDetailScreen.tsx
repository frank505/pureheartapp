import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface } from 'react-native-paper';
import { Colors } from '../constants';
import fastingService from '../services/fastingService';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { FastingStackParamList } from '../navigation/FastingNavigator';
import { Icon } from '../components';

interface FastDetailProgress {
  percentage: number;
  hoursCompleted: number;
  totalHours: number;
}

interface FastDetailData {
  id: number;
  type: string;
  status: string;
  goal?: string | null;
  smartGoal?: string | null;
  startTime: string;
  endTime: string;
  currentDuration?: string;
  prayerTimes?: string[];
  completedPrayers?: string[];
  verse?: string | null;
  prayerFocus?: string | null;
  progress?: FastDetailProgress;
}

type RouteProps = RouteProp<FastingStackParamList, 'FastDetail'>;

const Row = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{String(value)}</Text>
    </View>
  );
};

const Pill = ({ text }: { text: string }) => (
  <View style={styles.pill}><Text style={styles.pillText}>{text}</Text></View>
);

const FastDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const fastId = route.params?.fastId as number;

  const [data, setData] = useState<FastDetailData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fastingService.get(fastId);
      setData(res as any);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  }, [fastId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fast Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.primary.main} />
        </View>
      )}

      {!loading && !!data && (
        <ScrollView contentContainerStyle={styles.content}>
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.title}>{data.type?.toUpperCase()} • {data.status}</Text>
            <Row label="Start" value={new Date(data.startTime).toLocaleString()} />
            <Row label="End" value={new Date(data.endTime).toLocaleString()} />
            {!!data.progress && (
              <Row label="Progress" value={`${Math.round(data.progress.percentage)}% (${data.progress.hoursCompleted}/${data.progress.totalHours}h)`} />
            )}
            <Row label="Current Duration" value={data.currentDuration || undefined} />
          </Surface>

          {(data.goal || data.smartGoal) && (
            <Surface style={styles.card} elevation={1}>
              <Text style={styles.subtitle}>Goals</Text>
              <Row label="Goal" value={data.goal || undefined} />
              <Row label="SMART" value={data.smartGoal || undefined} />
            </Surface>
          )}

          {(data.verse || data.prayerFocus) && (
            <Surface style={styles.card} elevation={1}>
              <Text style={styles.subtitle}>Spiritual Focus</Text>
              <Row label="Verse" value={data.verse || undefined} />
              <Row label="Focus" value={data.prayerFocus || undefined} />
            </Surface>
          )}

          {(data.prayerTimes?.length || data.completedPrayers?.length) ? (
            <Surface style={styles.card} elevation={1}>
              <Text style={styles.subtitle}>Prayer Times</Text>
              <View style={styles.pillsRow}>
                {(data.prayerTimes || []).map((t) => (
                  <Pill key={t} text={t} />
                ))}
              </View>
              {!!data.completedPrayers?.length && (
                <>
                  <Text style={[styles.subtitle, { marginTop: 12 }]}>Completed</Text>
                  <View style={styles.pillsRow}>
                    {data.completedPrayers!.map((t) => (
                      <Pill key={t} text={t} />
                    ))}
                  </View>
                </>
              )}
            </Surface>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: Colors.text.primary, fontSize: 18, fontWeight: '700' },
  loadingBox: { paddingTop: 40 },
  content: { padding: 16, paddingBottom: 24 },
  card: { backgroundColor: Colors.background.secondary, borderRadius: 8, padding: 16, marginBottom: 12 },
  title: { color: Colors.text.primary, fontWeight: '700', fontSize: 16, marginBottom: 6 },
  subtitle: { color: Colors.text.primary, fontWeight: '600', fontSize: 15, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  rowLabel: { color: Colors.text.secondary },
  rowValue: { color: Colors.text.primary, marginLeft: 12, flexShrink: 1, textAlign: 'right' },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { backgroundColor: Colors.background.tertiary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  pillText: { color: Colors.text.primary, fontSize: 12 },
});

export default FastDetailScreen;
