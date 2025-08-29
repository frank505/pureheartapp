import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput } from 'react-native-paper';
import { Colors } from '../constants';
import fastingService from '../services/fastingService';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { ScreenHeader } from '../components';

type RouteParams = { fastId: number };

const FastJournalsListScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { fastId } = (route.params || {}) as RouteParams;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    if (!fastId) return;
    setLoading(true);
    try {
      const list = await fastingService.listJournals(fastId);
      setItems(list || []);
    } finally {
      setLoading(false);
    }
  }, [fastId]);

  useEffect(() => {
    load();
  }, [load]);

  // Reload when screen comes into focus (e.g., after creating a journal)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(j => `${j.title || ''} ${j.body}`.toLowerCase().includes(term));
  }, [q, items]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Journals" iconName="book-outline" navigation={navigation} showBackButton />
      <View style={{ paddingHorizontal: 16 }}>
        <TextInput
          mode="outlined"
          placeholder="Search journals"
          value={q}
          onChangeText={setQ}
          style={{ backgroundColor: Colors.background.secondary }}
          outlineStyle={{ borderColor: Colors.background.tertiary }}
        />
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary.main} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('FastJournalDetail', { fastId, journalId: item.id })}
            >
              {!!item.title && <Text style={styles.title}>{item.title}</Text>}
              <Text style={styles.body} numberOfLines={3}>{item.body}</Text>
              <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No journals yet.</Text>}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CreateJournal', { fastId })} 
        activeOpacity={0.8}
      >
        <Text style={{ color: Colors.white, fontSize: 24, marginTop: -2 }}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { color: Colors.white, fontSize: 20, fontWeight: '700', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: Colors.background.secondary, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: Colors.background.tertiary },
  title: { color: Colors.white, fontWeight: '700', marginBottom: 4 },
  body: { color: Colors.white },
  meta: { color: '#93acc8', fontSize: 12, marginTop: 8 },
  empty: { color: '#93acc8', textAlign: 'center', marginTop: 24 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});

export default FastJournalsListScreen;
