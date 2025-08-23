import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface } from 'react-native-paper';
import { Colors } from '../constants';
import fastingService from '../services/fastingService';
import type { Fast } from '../types/fasting';
import { useNavigation } from '@react-navigation/native';

const PastFastsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<Fast[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await fastingService.list({ page: p, limit: 20 });
      if (p === 1) setItems(res.items);
      else setItems((prev) => [...prev, ...res.items]);
  setPage(res.page);
  setTotalPages(Math.max(1, Math.ceil(res.total / (res.limit || 20))));
    } catch (e) {
      // noop; could show toast
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const renderItem = ({ item }: { item: Fast }) => {
    const start = new Date(item.startTime);
    const end = new Date(item.endTime);
    return (
      <TouchableOpacity onPress={() => navigation.navigate('FastDetail', { fastId: item.id })} activeOpacity={0.8}>
      <Surface style={styles.card} elevation={1}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.title} numberOfLines={1}>{item.type.toUpperCase()} • {item.status}</Text>
            <Text style={styles.meta} numberOfLines={1}>
              {start.toLocaleString()} — {end.toLocaleString()}
            </Text>
            {!!item.goal && <Text style={styles.body} numberOfLines={2}>{item.goal}</Text>}
          </View>
        </View>
      </Surface>
      </TouchableOpacity>
    );
  };

  const onEndReached = () => {
    if (!loading && page < totalPages) load(page + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Fasts</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('StartFast') as any}>
          <Text style={styles.createBtnText}>Create Fast</Text>
        </TouchableOpacity>
      </View>

      {loading && items.length === 0 ? (
        <View style={{ paddingTop: 40 }}>
          <ActivityIndicator color={Colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReachedThreshold={0.4}
          onEndReached={onEndReached}
          ListEmptyComponent={() => (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: Colors.text.secondary }}>No fasts yet. Start your first one!</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  createBtn: { backgroundColor: Colors.primary.main, paddingHorizontal: 14, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  createBtnText: { color: Colors.white, fontWeight: '700' },
  listContent: { padding: 16 },
  card: { backgroundColor: Colors.background.secondary, borderRadius: 8, padding: 16, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: Colors.text.primary, fontWeight: '600', fontSize: 16 },
  body: { color: Colors.text.secondary, marginTop: 6 },
  meta: { color: Colors.text.tertiary, marginTop: 6, fontSize: 12 },
});

export default PastFastsScreen;
