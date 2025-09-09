import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Text, ActivityIndicator } from 'react-native-paper';
import { ScreenHeader, Icon } from '../components';
import { Colors } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { PanicFeedItem, getMyPanics, getPanicsForMe } from '../services/panicService';

const PanicHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<'mine' | 'notified'>('mine');
  const [items, setItems] = useState<PanicFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      if (tab === 'mine') {
        const res = await getMyPanics();
        setItems(res.items || []);
      } else {
        const res = await getPanicsForMe();
        setItems(res.items || []);
      }
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  }, [load]);

  useEffect(() => { load(); }, [load]);

  const renderItem = ({ item }: { item: PanicFeedItem }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PanicDetail', { id: item.id })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Icon name="alert" size="sm" color={Colors.error.main} />
        <Text style={styles.cardTitle}>Panic</Text>
        <Text style={styles.cardMeta}> · {new Date((item as any).notifiedAt || item.createdAt).toLocaleString()}</Text>
      </View>
      {item.message ? <Text style={styles.cardBody} numberOfLines={2}>{item.message}</Text> : <Text style={styles.cardBodyMuted}>No message</Text>}
      <View style={styles.cardFooter}>
        <Icon name="chatbubble-ellipses-outline" size="sm" color={Colors.text.secondary} />
        <Text style={styles.cardMeta}>{item.repliesCount ?? 0} replies</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={["#0f172a", "#1e293b", "#334155", "#475569", "#64748b"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <ScreenHeader title="Panic History" navigation={navigation} showBackButton />
      <View style={styles.tabs}>
        {[
          { k: 'mine' as const, label: 'My Panics' },
          { k: 'notified' as const, label: 'Notified' },
        ].map((t) => {
          const active = tab === t.k;
          return (
            <TouchableOpacity key={t.k} style={[styles.tab, active && styles.tabActive]} onPress={() => setTab(t.k)}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator animating color={Colors.primary.main} />
          <Text style={{ marginTop: 8, color: Colors.text.primary }}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={{ color: Colors.white, textAlign: 'center', marginTop: 24 }}>No panic history yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  tabText: { color: Colors.text.secondary, fontWeight: '600' },
  tabTextActive: { color: Colors.white },
  card: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardTitle: { color: Colors.white, fontWeight: '700', marginLeft: 8 },
  cardMeta: { color: Colors.text.secondary, marginLeft: 6, fontSize: 12 },
  cardBody: { color: Colors.white, marginTop: 6 },
  cardBodyMuted: { color: Colors.text.secondary, marginTop: 6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
});

export default PanicHistoryScreen;
