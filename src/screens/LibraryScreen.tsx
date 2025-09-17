/**
 * LibraryScreen Component
 * 
 * Resource Library with immediate help options.
 * Features spiritual resources, guidance, and support tools.
 * Designed to provide immediate assistance during spiritual struggles.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants';
import Icon from '../components/Icon';
import ScreenHeader from '../components/ScreenHeader';
import { Modal, TextInput, Button, Surface } from 'react-native-paper';
import EmergencyPartnerSelectModal from '../components/EmergencyPartnerSelectModal';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchTodaysRecommendation } from '../store/slices/recommendationsSlice';
import { progressService, StreakLeaderboardItem } from '../services/progressService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LibraryScreenProps {
  navigation?: any;
}

const LibraryScreen: React.FC<LibraryScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { today: todaysRecommendation } = useAppSelector((state) => state.recommendations);

  // Local UI state for modals
  const [feelingText, setFeelingText] = useState('');
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showFeelingModal, setShowFeelingModal] = useState(false);
  const [leaders, setLeaders] = useState<StreakLeaderboardItem[]>([]);

  // Handlers for relaxation cards
  const handleBreatheWithJesus = () => setShowFeelingModal(true);
  const handleCallBrother = () => setShowPartnerModal(true);

  // Load today's recommendation (for future UI integration)
  useEffect(() => {
    dispatch(fetchTodaysRecommendation());
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await progressService.getStreakLeaderboard(3);
        if (mounted) setLeaders(items.slice(0, 3));
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Feeling modal actions
  const handleFeelingCancel = () => setShowFeelingModal(false);
  const handleFeelingContinue = () => {
    setShowFeelingModal(false);
    navigation?.navigate('BreatheScreen', { initialText: feelingText?.trim() || undefined });
  };
  // Decorative background elements removed for a cleaner, consistent look

  const openWebsite = () => {
    Linking.openURL('https://thepurityapp.com').catch(() => {});
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#334155", "#475569", "#64748b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

  {/* Stars removed */}

  {/* Moon removed per design request */}

  {/* Mountains removed */}

  {/* Fixed Screen Header (outside scroll) */}
  <ScreenHeader title="Library" navigation={navigation} showBackButton={false} />

  <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Icon Grid */}
        <View style={styles.iconGrid}>
          {[
            { icon: '⭕', text: 'Breathing\nWith Jesus', onPress: () => navigation?.navigate('BreatheScreen') },
            { icon: '🧠', text: 'Purity AI\nTherapist', onPress: () => navigation?.navigate('AISessions') },
            { icon: '🧘‍♂️', text: 'Worship', comingSoon: true, onPress: () => {} },
            { icon: '📰', text: 'Articles', onPress: () => navigation?.navigate('Articles') },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.iconItem}
              onPress={item.onPress}
              disabled={item.comingSoon}
              activeOpacity={item.comingSoon ? 1 : 0.7}
            >
              {item.comingSoon && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>COMING SOON</Text>
                </View>
              )}
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>{item.icon}</Text>
              </View>
              <Text style={[styles.iconText, item.comingSoon && { opacity: 0.5 }]}>{item.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

      

        {/* Leaderboard preview */}
        <View style={{ marginBottom: 76 }}>
          <TouchableOpacity
            style={styles.leaderboardHeader}
            onPress={() => navigation?.navigate('Leaderboard')}
            activeOpacity={0.8}
          >
            <Text style={styles.leaderboardTitle}>Leaderboard</Text>
            <Text style={styles.leaderboardChevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.leaderboardList}>
            {leaders.length === 0 ? (
              <Text style={{ color: '#fff', opacity: 0.8, paddingVertical: 10 }}>No streaks yet</Text>
            ) : (
              leaders.map((u, i) => (
                <View key={`${u.username}-${i}`} style={[styles.leaderboardItem, i === leaders.length - 2 && { borderBottomWidth: 0 }]}> 
                  <View style={styles.userInfo}>
                    <Text style={styles.trophyIcon}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</Text>
                    <Text style={styles.userName}>{u.username}</Text>
                  </View>
                  <View style={[styles.userDays, i === 0 ? styles.daysGold : styles.daysSilver]}>
                    <Text style={styles.userDaysText}>{u.days} days</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

      </ScrollView>

      {/* Feeling Modal */}
      <Modal visible={showFeelingModal} onDismiss={handleFeelingCancel} contentContainerStyle={styles.paperModalContainer}>
        <Surface style={styles.paperCard}>
          <Text style={styles.modalTitle}>How are you feeling?</Text>
          <Text style={styles.modalSubtitle}>Share a few words to guide the breathing session.</Text>
          <TextInput
            mode="outlined"
            placeholder="Anxious, tempted, overwhelmed..."
            value={feelingText}
            onChangeText={setFeelingText}
            style={styles.modalInput}
          />
          <View style={styles.modalActions}>
            <Button onPress={handleFeelingCancel}>Cancel</Button>
            <Button mode="contained" onPress={handleFeelingContinue}>Continue</Button>
          </View>
        </Surface>
      </Modal>

      {/* Partner Select Modal */}
      <EmergencyPartnerSelectModal
        visible={showPartnerModal}
        onDismiss={() => setShowPartnerModal(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 16, maxWidth: 420, alignSelf: 'center', width: '100%' },

  // Moon (removed)

  // Mountains (removed)

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 4 },
  appTitle: { fontSize: 28, fontWeight: '800', color: '#ffffff' },
  websiteLink: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },

  // Icon Grid
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  iconItem: { width: '22%', alignItems: 'center', marginBottom: 16, position: 'relative' },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  iconEmoji: { fontSize: 22 },
  iconText: { marginTop: 8, fontSize: 12, textAlign: 'center', color: '#ffffff', opacity: 0.9 },
  comingSoonBadge: { position: 'absolute', top: -6, alignSelf: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, zIndex: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.25, shadowRadius: 2, elevation: 3 },
  comingSoonText: { fontSize: 9, fontWeight: '800', color: '#ffffff', letterSpacing: 0.6 },

  // Button Grid
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 5 },
  featureButtonWrapper: { width: '48%', marginBottom: 14 },
  featureButton: { width: '100%', minHeight: 100, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  featureButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 18 },

  // Relaxation
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 6 },
  sectionDescription: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  relaxationGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  relaxationItem: { width: '48%', alignItems: 'center', gap: 12 as any, padding: 14, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 14, marginBottom: 14 },
  relaxationIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  relaxationText: { color: '#ffffff', fontWeight: '700', textAlign: 'center' },

  // Leaderboard
  leaderboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 12 },
  leaderboardTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  leaderboardChevron: { fontSize: 20, color: 'rgba(255,255,255,0.9)' },
  leaderboardList: { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8 },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.15)' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 as any },
  trophyIcon: { fontSize: 18 },
  userName: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  userDays: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  userDaysText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  daysGold: { backgroundColor: '#D97706' },
  daysSilver: { backgroundColor: '#6B7280' },

  // Paper modal styles
  paperModalContainer: { paddingHorizontal: 20 },
  paperCard: { backgroundColor: 'rgba(0,0,0,0.7)', padding: 16, borderRadius: 12 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  modalSubtitle: { color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  modalInput: { marginBottom: 12, backgroundColor: '#111827' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 as any },
});

export default LibraryScreen;