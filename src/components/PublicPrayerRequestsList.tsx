import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Surface, Button } from 'react-native-paper';
import Icon from './Icon';
import { Colors, Icons } from '../constants';
import SkeletonList from './SkeletonList';
import { useDispatch, useSelector } from 'react-redux';
import { getPublicPrayerRequests } from '../store/slices/prayerRequestSlice';
import { RootState, AppDispatch } from '../store';
import { PrayerRequest } from '../services/prayerRequestService';

const PublicPrayerRequestsList = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { publicPrayerRequests, loading, error } = useSelector((state: RootState) => state.prayerRequests);

  const load = (page = 1) => {
     dispatch(getPublicPrayerRequests({ page, limit: 10 })); 
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEndReached = () => {
    if (!loading && publicPrayerRequests?.page < publicPrayerRequests?.totalPages) {
      load(publicPrayerRequests.page + 1);
    }
  };

  const renderItem = ({ item }: { item: PrayerRequest }) => (
    <TouchableOpacity onPress={() => navigation.navigate('PrayerRequestDetail', { prayerRequestId: item.id })}>
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
            <Icon name="hand-right-outline" color={Colors.text.secondary} size="md" />
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && publicPrayerRequests?.items.length === 0 && (
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
        data={publicPrayerRequests?.items || []}
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
            <Text style={{ color: Colors.text.secondary }}>No public prayer requests yet.</Text>
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

export default PublicPrayerRequestsList;
