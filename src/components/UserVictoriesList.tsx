import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Surface, Button } from 'react-native-paper';
import Icon from './Icon';
import { Colors, Icons } from '../constants';
import SkeletonList from './SkeletonList';
import { useDispatch, useSelector } from 'react-redux';
import { getVictoriesByUserId } from '../store/slices/victorySlice';
import { RootState, AppDispatch } from '../store';
import { Victory } from '../services/victoryService';

interface UserVictoriesListProps {
  navigation: any;
  searchQuery?: string;
}

const UserVictoriesList = ({ navigation, searchQuery = '' }: UserVictoriesListProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { victories, loading, error } = useSelector((state: RootState) => state.victories);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const load = (page = 1) => {
    if (currentUser) {
      dispatch(getVictoriesByUserId({ userId: Number(currentUser.id), page, limit: 10, search: searchQuery || undefined }));
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const onEndReached = () => {
    if (!loading && victories.page < victories.totalPages) {
      load(victories.page + 1);
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
    <View style={styles.container}>
      {loading && victories.items.length === 0 && (
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
        data={victories.items}
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
            <Text style={{ color: Colors.text.secondary }}>You haven't shared any victories yet.</Text>
          </View>
        ) : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 16 },
  card: { backgroundColor: Colors.background.secondary, borderRadius: 12, padding: 16, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  col: { flex: 1, paddingRight: 12 },
  title: { color: Colors.text.primary, fontWeight: '700', fontSize: 16 },
  body: { color: Colors.text.secondary, marginTop: 4, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  metaText: { color: Colors.text.secondary, fontSize: 12 },
  rightMeta: { alignItems: 'center', justifyContent: 'center', paddingLeft: 8 },
  errorBox: { marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 8, backgroundColor: `${Colors.error.main}10` },
  errorText: { color: Colors.text.primary, marginBottom: 6 },
});

export default UserVictoriesList;
