import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getVictories } from '../store/slices/victorySlice';
import { RootState, AppDispatch } from '../store';
import { Victory } from '../services/victoryService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Surface, Chip, Button } from 'react-native-paper';
import Icon from '../components/Icon';
import SkeletonList from '../components/SkeletonList';
import { Colors, Icons } from '../constants';

const VictoriesScreen = ({ navigation, route }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { victories, loading, error } = useSelector((state: RootState) => state.victories);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [filter, setFilter] = useState<'all' | 'mine' | 'private' | 'partner' | 'group' | 'public'>(route?.params?.initialFilter || 'all');

  useEffect(() => {
    dispatch(getVictories({}));
  }, [dispatch]);

  const data = useMemo(() => {
    const items = victories.items || [];
    if (filter === 'all') return items;
    if (filter === 'mine') {
      const myId = currentUser?.id ? Number(currentUser.id) : undefined;
      if (!myId) return [];
      return items.filter((i) => i.userId === myId);
    }
    return items.filter((i) => i.visibility === filter);
  }, [victories.items, filter, currentUser?.id]);

  const renderItem = ({ item }: { item: Victory }) => (
    <TouchableOpacity onPress={() => navigation.navigate('VictoryDetail', { victoryId: item.id })}>
      <Surface style={styles.card} elevation={2}>
        <View style={styles.rowBetween}>
          <View style={styles.col}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            {!!item.body && <Text style={styles.body} numberOfLines={2}>{item.body}</Text>}
            <View style={styles.metaRow}>
              <Chip compact style={styles.metaChip}>{item.visibility}</Chip>
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
        <Text style={styles.headerTitle}>Victories</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        {(['all', 'mine', 'private', 'partner', 'group', 'public'] as const).map((f) => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            compact
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
          >
            {f}
          </Chip>
        ))}
      </View>

      {/* Loading */}
      {loading && (
        <View style={{ paddingVertical: 8 }}>
          <SkeletonList count={4} />
        </View>
      )}

      {/* Error */}
      {!loading && !!error && (
        <Surface style={styles.errorBox} elevation={1}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button onPress={() => dispatch(getVictories({}))}>Retry</Button>
        </Surface>
      )}

      {/* Empty */}
      {!loading && !error && data.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name={Icons.status.success.name} color={Colors.text.secondary} size="lg" />
          <Text style={styles.emptyTitle}>No victories yet</Text>
          <Text style={styles.emptySubtitle}>Share your first victory to encourage others.</Text>
          <Button mode="contained" onPress={() => navigation.navigate('CreateVictory')}>
            Share Victory
          </Button>
        </View>
      )}

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => dispatch(getVictories({}))}
            tintColor={Colors.primary.main}
            colors={[Colors.primary.main]}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateVictory')}>
        <Icon name="add-outline" color={Colors.white} size="lg" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.background.primary },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', flex: 1 },
  headerSpacer: { width: 40 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  filterChip: { backgroundColor: Colors.background.secondary },
  filterChipActive: { backgroundColor: `${Colors.primary.main}22` },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { backgroundColor: Colors.background.secondary, borderRadius: 12, padding: 16, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  col: { flex: 1, paddingRight: 12 },
  title: { color: Colors.text.primary, fontWeight: '700', fontSize: 16 },
  body: { color: Colors.text.secondary, marginTop: 4, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  metaChip: { backgroundColor: Colors.background.tertiary },
  metaText: { color: Colors.text.secondary, fontSize: 12 },
  rightMeta: { alignItems: 'center', justifyContent: 'center', paddingLeft: 8 },
  errorBox: { marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 8, backgroundColor: `${Colors.error.main}10` },
  errorText: { color: Colors.error.main, marginBottom: 6 },
  emptyState: { alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 24 },
  emptyTitle: { color: Colors.text.primary, fontWeight: '700' },
  emptySubtitle: { color: Colors.text.secondary, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: Colors.primary.main,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default VictoriesScreen;

