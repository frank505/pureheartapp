import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Surface, Button } from 'react-native-paper';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';
import SkeletonList from '../components/SkeletonList';
import { victoryService, Victory, PaginatedVictories } from '../services/victoryService';

const PublicVictoriesScreen = ({ navigation }: any) => {
  const [state, setState] = useState<PaginatedVictories>({ items: [], page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await victoryService.getPublicVictories(page, 10);
      setState(page === 1 ? data : { ...data, items: [...state.items, ...data.items] });
    } catch (e: any) {
      setError(e?.message || 'Failed to load public victories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEndReached = () => {
    if (!loading && state.page < state.totalPages) {
      load(state.page + 1);
    }
  };

  const renderItem = ({ item }: { item: Victory }) => (
    <TouchableOpacity onPress={() => navigation.navigate('VictoryDetail', { victoryId: item.id })}>
      <Surface style={styles.card} elevation={2}>
        <View style={styles.rowBetween}>
          <View style={styles.col}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            {!!item.body && <Text style={styles.body} numberOfLines={2}>{item.body}</Text>}
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={styles.rightMeta}>
            <Icon name={Icons.status.success.name} color={Colors.text.secondary} size="md" />
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Public Victories</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading && state.items.length === 0 && (
        <View style={{ paddingVertical: 8 }}>
          <SkeletonList count={4} />
        </View>
      )}

      {!loading && !!error && (
        <Surface style={styles.errorBox} elevation={1}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button onPress={() => load(1)}>Retry</Button>
        </Surface>
      )}

      <FlatList
        data={state.items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.5}
        onEndReached={onEndReached}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => load(1)}
            tintColor={Colors.primary.main}
            colors={[Colors.primary.main]}
          />
        }
        ListEmptyComponent={!loading ? (
          <View style={{ alignItems: 'center', padding: 16 }}>
            <Text style={{ color: Colors.text.secondary }}>No public victories yet</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.background.primary },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', flex: 1 },
  headerSpacer: { width: 40 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { backgroundColor: Colors.background.secondary, borderRadius: 12, padding: 16, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  col: { flex: 1, paddingRight: 12 },
  title: { color: Colors.text.primary, fontWeight: '700', fontSize: 16 },
  body: { color: Colors.text.secondary, marginTop: 4, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  metaText: { color: Colors.text.secondary, fontSize: 12 },
  rightMeta: { alignItems: 'center', justifyContent: 'center', paddingLeft: 8 },
  errorBox: { marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 8, backgroundColor: `${Colors.error.main}10` },
  errorText: { color: Colors.error.main, marginBottom: 6 },
});

export default PublicVictoriesScreen;


