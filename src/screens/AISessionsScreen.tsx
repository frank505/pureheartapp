import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Surface, ActivityIndicator } from 'react-native-paper';
import { Colors } from '../constants';
import { AiSession, listSessions } from '../services/aiChatService';
import Icon from '../components/Icon';
import { useFocusEffect } from '@react-navigation/native';

interface Props { navigation?: any }

const AISessionsScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (p = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      const res = await listSessions({ page: p, limit: 50 });
      setTotalPages(res.totalPages || 1);
      setPage(res.page || 1);
      setSessions((prev) => (append ? [...prev, ...res.items] : res.items));
    } catch (e) {
      // noop; could show toast
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(1); }, []);

  // Refresh list when coming back from chat or when screen gains focus
  useFocusEffect(
    useCallback(() => {
      load(1);
    }, [])
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) =>
      (s.title || 'Untitled').toLowerCase().includes(q)
      || new Date(s.lastActivityAt).toLocaleString().toLowerCase().includes(q)
    );
  }, [query, sessions]);

  const onEnd = () => {
    if (page < totalPages) load(page + 1, true);
  };

  const openSession = (s: AiSession) => {
    navigation?.navigate('AIChat', { sessionId: s.id, title: s.title || 'Untitled' });
  };

  return (
    <SafeAreaView style={styles.container}> 
      {/* Header */}
      <View style={styles.header}> 
        <TouchableOpacity style={styles.back} onPress={() => navigation?.goBack()}> 
          <Icon name="chevron-back" color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.title}>AI Help Sessions</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => navigation?.navigate('AIChat')}> 
          <Icon name="add-circle-outline" color={Colors.primary.main} size="lg" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}> 
        <TextInput
          mode="outlined"
          placeholder="Search sessions..."
          value={query}
          onChangeText={setQuery}
          style={styles.search}
        />
      </View>

      {loading && sessions.length === 0 ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(s) => String(s.id)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => openSession(item)}>
              <View style={styles.itemL}>
                <Surface style={styles.iconWrap} elevation={0}>
                  <Icon name="chatbubble-ellipses-outline" color={Colors.primary.main} size="md" />
                </Surface>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title || 'Untitled'}</Text>
                  <Text style={styles.itemSub}>Last active {new Date(item.lastActivityAt).toLocaleString()}</Text>
                </View>
              </View>
              <Icon name="chevron-forward" color={Colors.text.secondary} size="sm" />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          onEndReachedThreshold={0.2}
          onEndReached={onEnd}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(1); }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  back: { padding: 8 },
  newBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', flex: 1 },
  searchRow: { paddingHorizontal: 16, paddingBottom: 8 },
  search: { backgroundColor: Colors.background.secondary },
  list: { padding: 16, gap: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.background.secondary, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.border.primary },
  itemL: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${Colors.primary.main}20`, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
  itemSub: { fontSize: 12, color: Colors.text.secondary },
});

export default AISessionsScreen;
