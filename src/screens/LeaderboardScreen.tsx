import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { progressService, StreakLeaderboardItem } from '../services/progressService';

type Leader = {
  id: string;
  name: string;
  days: number;
};

const medals = ['🥇', '🥈', '🥉'] as const;

const LeaderboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await progressService.getStreakLeaderboard(50);
        if (!mounted) return;
        const mapped: Leader[] = items.map((u, i) => ({ id: `${u.username}-${i}`, name: u.username, days: u.days }));
        setLeaders(mapped);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load leaderboard');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const renderItem = ({ item, index }: { item: Leader; index: number }) => {
    const isTop3 = index < 3;
    const position = index + 1;
    return (
      <View style={[styles.row, isTop3 && styles.rowTop3]}
        accessibilityRole="button"
        accessibilityLabel={`Position ${position}, ${item.name}, ${item.days} days`}
      >
        <View style={styles.left}>
          <Text style={[styles.position, isTop3 && styles.positionTop3]}>
            {isTop3 ? medals[index] : position}
          </Text>
          <Text style={[styles.name, isTop3 && styles.nameTop3]} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <View style={[styles.daysPill, isTop3 && styles.daysPillTop3]}> 
          <Text style={styles.daysText}>{item.days} days</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#334155", "#475569", "#64748b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScreenHeader title="Leaderboard" navigation={navigation} showBackButton />
      {loading ? (
        <View style={[styles.list, { alignItems: 'center', justifyContent: 'center' }]}> 
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={leaders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <Text style={{ color: '#fff', textAlign: 'center', opacity: 0.8 }}>No streaks yet</Text>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, maxWidth: 520, alignSelf: 'center', width: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  rowTop3: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 as any, flex: 1 },
  position: { color: '#E5E7EB', fontSize: 16, width: 34, textAlign: 'center' },
  positionTop3: { fontSize: 20 },
  name: { color: '#fff', fontSize: 16, fontWeight: '600', flexShrink: 1 },
  nameTop3: { fontSize: 17 },
  daysPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: 'rgba(59,130,246,0.35)' },
  daysPillTop3: { backgroundColor: 'rgba(245,158,11,0.45)' },
  daysText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});

export default LeaderboardScreen;
