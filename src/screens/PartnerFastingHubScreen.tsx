import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { Colors } from '../constants';
import fastingService from '../services/fastingService';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '../components';

const PartnerFastingHubScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fastingService.listActiveFastersForPartner({ page: 1, limit: 20 });
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.container}>
  <ScreenHeader title="Partners Fasting" navigation={navigation} showBackButton />
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary.main} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.fastId)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PartnerJournalsForUser', { userId: item.user.id })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {item.user?.avatar ? (
                  <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.user?.firstName || ''} {item.user?.lastName || ''}</Text>
                  <Text style={styles.meta}>
                    {item.type} • {item.progress.totalDays === 'infinite' 
                      ? `${item.progress.hoursCompleted}/${item.progress.dailyHours}h today (Recurring)`
                      : `${item.progress.hoursCompleted}/${item.progress.totalHours}h`
                    }
                  </Text>
                </View>
              </View>
              <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${item.progress.percentage}%` }]} /></View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No active fasters right now.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { color: Colors.white, fontSize: 20, fontWeight: '700', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: Colors.background.secondary, padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: Colors.background.tertiary },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { backgroundColor: '#243447' },
  name: { color: Colors.white, fontWeight: '700' },
  meta: { color: '#93acc8', fontSize: 12 },
  progressBarBg: { height: 6, borderRadius: 3, backgroundColor: Colors.background.tertiary, overflow: 'hidden', marginTop: 10 },
  progressBarFill: { height: 6, backgroundColor: '#1979e6' },
  empty: { color: '#93acc8', textAlign: 'center', marginTop: 24 },
});

export default PartnerFastingHubScreen;
