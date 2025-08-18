import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCheckIns } from '../store/slices/checkinsSlice';

interface CheckInHistoryScreenProps {
  navigation?: any;
}

const CheckInHistoryScreen: React.FC<CheckInHistoryScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((state) => state.checkins);

  useEffect(() => {
    dispatch(fetchCheckIns({ page: 1, limit: 50 }));
  }, [dispatch]);

  const markedDates = useMemo(() => {
    const acc: Record<string, any> = {};
    const isValidDate = (d: Date) => !isNaN(d.getTime());
    const toUTCDay = (d: Date) =>
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    items.forEach((c) => {
      if (!c?.createdAt) return;
      const d = new Date(c.createdAt);
      if (!isValidDate(d)) return;
      const day = toUTCDay(d);
      
      // Set different colors based on check-in status
      const dotColor = c.status === 'relapse' ? Colors.error.main : Colors.primary.main;
      acc[day] = { marked: true, dotColor };
    });
    return acc;
  }, [items]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check-in History</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        ListHeaderComponent={
          <View>
            <Surface style={styles.calendarCard} elevation={2}>
              <Calendar
                markedDates={markedDates}
                theme={{
                  backgroundColor: Colors.background.secondary,
                  calendarBackground: Colors.background.secondary,
                  textSectionTitleColor: Colors.text.secondary,
                  selectedDayTextColor: Colors.white,
                  todayTextColor: Colors.primary.main,
                  dayTextColor: Colors.text.primary,
                  monthTextColor: Colors.text.primary,
                  arrowColor: Colors.text.primary,
                }}
                style={styles.calendar}
              />
            </Surface>

            <Text style={styles.sectionTitle}>Recent Check-ins</Text>
          </View>
        }
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const d = new Date(item.createdAt);
          const dateText = isNaN(d.getTime()) ? 'Unknown date' : d.toLocaleDateString();
          return (
            <Surface style={styles.itemCard} elevation={1}>
              <View style={styles.rowBetween}>
                <View style={styles.col}>
                  <Text style={styles.dateText}>{dateText}</Text>
                  <Text style={styles.noteText}>{item.note || 'No note'}</Text>
                </View>
                <View style={styles.rightContent}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {item.status === 'relapse' ? '😔 Relapse' : '🏆 Victory'}
                    </Text>
                  </View>
                  <View style={[styles.moodPill, item.status === 'relapse' ? styles.relapseMoodPill : {}]}>
                    <Text style={styles.moodValue}>{Math.round((item.mood ?? 0) * 100)}%</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => navigation?.navigate('CheckInDetail', { checkInId: item.id })} style={{ marginTop: 8 }}>
                <Text style={{ color: Colors.primary.main, fontWeight: '600' }}>View details</Text>
              </TouchableOpacity>
            </Surface>
          );
        }}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => dispatch(fetchCheckIns({ page: 1, limit: 50 }))}
            tintColor={Colors.primary.main}
            colors={[Colors.primary.main]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.primary,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', flex: 1 },
  headerSpacer: { width: 40 },
  calendarCard: { backgroundColor: Colors.background.secondary, borderRadius: 8, marginHorizontal: 16, marginTop: 8, padding: 8 },
  calendar: { borderRadius: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginTop: 16, marginBottom: 8, paddingHorizontal: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  itemCard: { backgroundColor: Colors.background.secondary, borderRadius: 8, padding: 16, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  col: { flex: 1, paddingRight: 12 },
  dateText: { color: Colors.text.primary, fontWeight: '600', marginBottom: 4 },
  noteText: { color: Colors.text.secondary },
  rightContent: { alignItems: 'flex-end' },
  moodPill: { backgroundColor: Colors.primary.main, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginTop: 4 },
  relapseMoodPill: { backgroundColor: Colors.error.main },
  moodValue: { color: Colors.white, fontWeight: '700' },
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12, 
    backgroundColor: `${Colors.primary.main}20`,
  },
  statusText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: Colors.text.primary 
  },
});

export default CheckInHistoryScreen;


