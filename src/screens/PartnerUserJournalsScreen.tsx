import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput } from 'react-native-paper';
import { Colors } from '../constants';
import fastingService from '../services/fastingService';
import { useNavigation, useRoute } from '@react-navigation/native';

interface RouteParams { userId: number }

const PartnerUserJournalsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userId } = (route.params || {}) as RouteParams;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fastingService.listPartnerJournalsForUser(userId, { page: 1, limit: 50 });
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(j => `${j.title || ''} ${j.body}`.toLowerCase().includes(term));
  }, [q, items]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Partner Journals</Text>
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
              onPress={() => navigation.navigate('FastJournalDetail', { fastId: item.fastId, journalId: item.id })}
            >
              {!!item.title && <Text style={styles.title}>{item.title}</Text>}
              <Text style={styles.body} numberOfLines={3}>{item.body}</Text>
              <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No journals yet.</Text>}
        />
      )}
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
});

export default PartnerUserJournalsScreen;
