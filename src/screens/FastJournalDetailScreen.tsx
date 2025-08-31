import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button } from 'react-native-paper';
import { Colors } from '../constants';
import fastingService from '../services/fastingService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenHeader } from '../components';

interface RouteParams { fastId: number; journalId: number }

const FastJournalDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { fastId, journalId } = (route.params || {}) as RouteParams;
  const [loading, setLoading] = useState(true);
  const [journal, setJournal] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!fastId || !journalId) return;
    setLoading(true);
    try {
      const [j, c] = await Promise.all([
        fastingService.getJournal(fastId, journalId),
        fastingService.listJournalComments(fastId, journalId),
      ]);
      setJournal(j);
      setComments(c || []);
    } finally {
      setLoading(false);
    }
  }, [fastId, journalId]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    const body = comment.trim();
    if (!body) return;
    try {
      setPosting(true);
      await fastingService.addJournalComment(fastId, journalId, { body });
      setComment('');
      const c = await fastingService.listJournalComments(fastId, journalId);
      setComments(c || []);
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
  <ScreenHeader title="Journal"  navigation={navigation} showBackButton />
      {journal && (
        <View style={styles.header}>
          {!!journal.title && <Text style={styles.title}>{journal.title}</Text>}
          <Text style={styles.body}>{journal.body}</Text>
          <Text style={styles.meta}>{new Date(journal.createdAt).toLocaleString()} • {journal.visibility === 'partner' ? 'Shared with partners' : 'Private'}</Text>
        </View>
      )}

      <Text style={styles.subheader}>Comments</Text>
      <FlatList
        data={comments}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Text style={styles.commentBody}>{item.body}</Text>
            <Text style={styles.commentMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No comments yet.</Text>}
      />

      <View style={styles.inputRow}>
        <TextInput
          mode="outlined"
          placeholder="Write a comment"
          value={comment}
          onChangeText={setComment}
          style={{ flex: 1, backgroundColor: Colors.background.secondary }}
          outlineStyle={{ borderColor: Colors.background.tertiary }}
        />
        <Button mode="contained" onPress={submit} loading={posting} disabled={posting || !comment.trim()} style={{ marginLeft: 8 }}>
          Send
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { color: Colors.white, fontWeight: '700', fontSize: 18, marginBottom: 6 },
  body: { color: Colors.white },
  meta: { color: '#93acc8', fontSize: 12, marginTop: 8 },
  subheader: { color: Colors.white, fontSize: 16, fontWeight: '700', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  comment: { backgroundColor: Colors.background.secondary, padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: Colors.background.tertiary },
  commentBody: { color: Colors.white },
  commentMeta: { color: '#93acc8', fontSize: 12, marginTop: 4 },
  empty: { color: '#93acc8', textAlign: 'center', marginTop: 8 },
  inputRow: { flexDirection: 'row', padding: 16, alignItems: 'center' },
});

export default FastJournalDetailScreen;
