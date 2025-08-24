import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Portal, Modal } from 'react-native-paper';
import { Colors } from '../constants';
import fastingService from '../services/fastingService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenHeader } from '../components';

type RouteParams = { fastId: number };

const FastJournalsListScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { fastId } = (route.params || {}) as RouteParams;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [composeVisible, setComposeVisible] = useState(false);
  const [cTitle, setCTitle] = useState('');
  const [cBody, setCBody] = useState('');
  const [cVisibility, setCVisibility] = useState<'private' | 'partner'>('private');
  const [saving, setSaving] = useState(false);

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
      <TouchableOpacity style={styles.fab} onPress={() => setComposeVisible(true)} activeOpacity={0.8}>
        <Text style={{ color: Colors.white, fontSize: 24, marginTop: -2 }}>＋</Text>
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={composeVisible}
          onDismiss={() => setComposeVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>New Journal</Text>
          <TextInput
            mode="outlined"
            placeholder="Title (optional)"
            value={cTitle}
            onChangeText={setCTitle}
            style={styles.modalInput}
          />
          <TextInput
            mode="outlined"
            placeholder="Write your entry..."
            value={cBody}
            onChangeText={setCBody}
            multiline
            numberOfLines={6}
            style={[styles.modalInput, { height: 140 }]}
          />
          <View style={styles.visibilityRow}>
            <Text style={{ color: Colors.white, marginRight: 8 }}>Visibility:</Text>
            <Button mode={cVisibility === 'private' ? 'contained' : 'outlined'} onPress={() => setCVisibility('private')}>Private</Button>
            <Button mode={cVisibility === 'partner' ? 'contained' : 'outlined'} onPress={() => setCVisibility('partner')}>Partner</Button>
          </View>
          <View style={styles.modalActions}>
            <Button mode="text" onPress={() => setComposeVisible(false)} disabled={saving}>Cancel</Button>
            <Button
              mode="contained"
              loading={saving}
              disabled={saving || !cBody.trim()}
              onPress={async () => {
                try {
                  setSaving(true);
                  await fastingService.createJournal(fastId, { title: cTitle.trim() || undefined, body: cBody.trim(), visibility: cVisibility });
                  setCTitle('');
                  setCBody('');
                  setCVisibility('private');
                  setComposeVisible(false);
                  await load();
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save
            </Button>
          </View>
        </Modal>
      </Portal>
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
  modal: {
    backgroundColor: Colors.background.secondary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  modalTitle: { color: Colors.white, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalInput: { backgroundColor: Colors.background.tertiary, marginBottom: 12 },
  visibilityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});

export default FastJournalsListScreen;
