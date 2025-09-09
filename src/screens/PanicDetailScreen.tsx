import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput as RNTextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Text, ActivityIndicator, Surface, Button } from 'react-native-paper';
import { ScreenHeader, Icon } from '../components';
import { Colors } from '../constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import panicService, { PanicDetail } from '../services/panicService';

const PanicDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const panicId: number = Number(route?.params?.id);
  const [detail, setDetail] = useState<PanicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const d = await panicService.getPanicDetail(panicId);
      setDetail(d);
    } catch (e: any) {
      // If forbidden or not found, just go back
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [panicId, navigation]);

  useEffect(() => { if (panicId) load(); }, [load, panicId]);

  const submitReply = async () => {
    const msg = replyText.trim();
    if (!msg) return;
    try {
      setPosting(true);
      await panicService.replyToPanic(panicId, msg);
      setReplyText('');
      await load();
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={["#0f172a", "#1e293b", "#334155", "#475569", "#64748b"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <ScreenHeader title="Panic Details" navigation={navigation} showBackButton />
      {loading || !detail ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator animating color={Colors.primary.main} />
          <Text style={{ marginTop: 8, color: Colors.text.primary }}>Loading...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Surface style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Icon name="alert" size="sm" color={Colors.error.main} />
                <Text style={styles.title}>Panic</Text>
                <Text style={styles.meta}> · {new Date(detail.createdAt).toLocaleString()}</Text>
              </View>
              <Text style={styles.body}>{detail.message || 'No message'}</Text>
            </Surface>

            <Text style={styles.replyHeader}>Replies</Text>
            {(detail.replies || []).length === 0 ? (
              <Text style={styles.muted}>No replies yet.</Text>
            ) : (
              (detail.replies || []).map((r) => (
                <View key={r.id} style={styles.replyItem}>
                  <Text style={styles.replyMeta}>{new Date(r.createdAt).toLocaleString()}</Text>
                  <Text style={styles.replyText}>{r.message}</Text>
                </View>
              ))
            )}
          </ScrollView>
          <View style={styles.replyBar}>
            <RNTextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Type a reply…"
              placeholderTextColor={Colors.text.secondary}
              style={styles.replyInput}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} disabled={posting || !replyText.trim()} onPress={submitReply}>
              <Text style={styles.sendText}>{posting ? 'Sending…' : 'Send'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { backgroundColor: Colors.background.secondary, borderRadius: 12, padding: 12 },
  title: { color: Colors.white, fontWeight: '700', marginLeft: 8 },
  meta: { color: Colors.text.secondary, marginLeft: 6, fontSize: 12 },
  body: { color: Colors.white, marginTop: 6 },
  replyHeader: { color: Colors.white, fontWeight: '700', marginTop: 16, marginBottom: 8, paddingHorizontal: 16 },
  muted: { color: Colors.text.secondary, paddingHorizontal: 16 },
  replyItem: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 10, marginHorizontal: 16, marginBottom: 8 },
  replyMeta: { color: Colors.text.secondary, fontSize: 12 },
  replyText: { color: Colors.white, marginTop: 4 },
  replyBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.2)' },
  replyInput: { flex: 1, minHeight: 40, maxHeight: 120, color: Colors.white },
  sendBtn: { backgroundColor: Colors.primary.main, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  sendText: { color: Colors.white, fontWeight: '700' },
});

export default PanicDetailScreen;
