import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, Button } from 'react-native-paper';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchNotifications, markAllReadAsync, markReadAsync } from '../store/slices/notificationsSlice';
import { useEffect, useState } from 'react';

interface NotificationsCenterScreenProps { navigation?: any }

const NotificationsCenterScreen: React.FC<NotificationsCenterScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => s.notifications.items);
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
  const isLoading = useAppSelector((s) => s.notifications.isLoading);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }));
  }, [dispatch]);
  const handleMarkAllRead = useCallback(() => {
    dispatch(markAllReadAsync());
  }, [dispatch]);
  const handlePressItem = useCallback((id: string, read: boolean) => {
    if (!read) {
      dispatch(markReadAsync(id));
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchNotifications({ page: 1, limit: 20 }));
    setRefreshing(false);
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          <Button mode="text" onPress={handleMarkAllRead} disabled={unreadCount === 0}>Mark all read</Button>
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePressItem(item.id, item.read)} activeOpacity={0.8}>
            <Surface style={styles.card} elevation={1}>
              <View style={styles.rowBetween}>
                <View style={styles.col}>
                  <Text style={[styles.title, !item.read && styles.unread]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!!item.body && (
                    <Text style={styles.body} numberOfLines={2}>
                      {item.body}
                    </Text>
                  )}
                  <Text style={styles.meta}>{item.createdAt}</Text>
                </View>
                {!item.read && <View style={styles.dot} />}
              </View>
            </Surface>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={!isLoading ? () => (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: Colors.text.secondary }}>No notifications</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', flex: 1 },
  headerActions: { minWidth: 110, alignItems: 'flex-end' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { backgroundColor: Colors.background.secondary, borderRadius: 8, padding: 16, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  col: { flex: 1, paddingRight: 12 },
  title: { color: Colors.text.primary, fontWeight: '600', fontSize: 16 },
  unread: { color: Colors.primary.main },
  body: { color: Colors.text.secondary, marginTop: 4 },
  meta: { color: Colors.text.tertiary, marginTop: 6, fontSize: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary.main },
});

export default NotificationsCenterScreen;


