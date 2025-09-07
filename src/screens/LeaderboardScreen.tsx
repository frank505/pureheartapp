import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';

type Leader = {
  id: string;
  name: string;
  days: number;
};

const medals = ['🥇', '🥈', '🥉'] as const;

const LeaderboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Mock top 50 data; replace with API integration when available.
  const leaders = useMemo<Leader[]>(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: String(i + 1),
        name: i === 0 ? 'Gold Leader' : i === 1 ? 'Silver Leader' : i === 2 ? 'Bronze Leader' : `Leader ${i + 1}`,
        days: 200 - i * 2,
      })),
    []
  );

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

      <FlatList
        contentContainerStyle={styles.list}
        data={leaders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
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
