import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, TextInput, Button, Chip } from 'react-native-paper';
import checkinService, { CheckInDTO, Comment } from '../services/checkinService';
import { Colors } from '../constants';
import { ScreenHeader, Icon } from '../components';

const CheckInDetailScreen = ({ route, navigation }: any) => {
  const { checkInId } = route.params;
  const [checkIn, setCheckIn] = useState<CheckInDTO | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [commentBody, setCommentBody] = useState('');

  const loadCheckIn = useCallback(async () => {
    try {
      setLoading(true);
      const data = await checkinService.getById(checkInId);
    
      setCheckIn(data);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to load check-in');
    } finally {
      setLoading(false);
    }
  }, [checkInId]);

  const loadComments = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await checkinService.getComments(checkInId, { page: pageNum, limit: 20 });
      setComments(res.items);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [checkInId]);

  useEffect(() => {
    loadCheckIn();
    loadComments(1);
  }, [loadCheckIn, loadComments]);

  const handlePost = async () => {
    if (!commentBody.trim()) return;
    try {
      setPosting(true);
      const created = await checkinService.addComment(checkInId, { body: commentBody.trim() });
      if(created){
     await loadComments(1);
      }
      // setComments((prev) => [created, ...prev]);
      setCommentBody('');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await checkinService.deleteComment(checkInId, String(commentId));
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to delete comment');
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <Surface style={styles.commentCard} elevation={1}>
      <View style={styles.rowBetween}>
        <View style={styles.col}>
          <Text style={styles.commentUser}>{item.user?.username || 'Anonymous'}</Text>
          <Text style={styles.commentBody}>{item.body}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <SafeAreaView style={styles.container}>
        {/* Custom Screen Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <View style={styles.iconContainer}>
              <Icon name="arrow-back" color={Colors.primary.main} size="md" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Check-in</Text>
          <View style={styles.headerSpacer} />
        </View>

      {checkIn && (
        <Surface style={styles.card} elevation={2}>
          <View style={styles.rowBetween}>
            <View style={styles.col}>
              {(() => {
                const d = new Date(checkIn.createdAt);
                const txt = isNaN(d.getTime()) ? 'Unknown date' : d.toLocaleString();
                return <Text style={styles.dateText}>{txt}</Text>;
              })()}
              {checkIn.note ? <Text style={styles.noteText}>{checkIn.note}</Text> : null}
              <View style={styles.row}>
                <Chip compact style={styles.metaChip}>visibility: {checkIn.visibility}</Chip>
              </View>
            </View>
            <View style={styles.moodPill}>
              <Text style={styles.moodValue}>{Math.round((checkIn.mood ?? 0) * 100)}%</Text>
            </View>
          </View>
        </Surface>
      )}

      <FlatList
        data={comments}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderComment}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Comments</Text>}
        onEndReachedThreshold={0.4}
        onEndReached={async () => {
          if (page < totalPages && !loading) {
            const next = page + 1;
            try {
              setLoading(true);
              const res = await checkinService.getComments(checkInId, { page: next, limit: 20 });
              setComments((prev) => [...prev, ...res.items]);
              setPage(res.page);
              setTotalPages(res.totalPages);
            } finally {
              setLoading(false);
            }
          }
        }}
      />

      <View style={styles.commentInputContainer}>
        <TextInput
          mode="outlined"
          label="Add a comment"
          value={commentBody}
          onChangeText={setCommentBody}
          style={styles.input}
        />
        <Button mode="contained" onPress={handlePost} loading={posting} disabled={posting}>
          Post
        </Button>
      </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: Colors.background.primary 
  },
  backButton: { padding: 8 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', flex: 1 },
  headerSpacer: { width: 40 },
  card: { backgroundColor: Colors.background.secondary, borderRadius: 8, padding: 16, margin: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  col: { flex: 1, paddingRight: 12 },
  dateText: { color: Colors.text.primary, fontWeight: '600', marginBottom: 4 },
  noteText: { color: Colors.text.secondary },
  metaChip: { backgroundColor: Colors.background.tertiary },
  moodPill: { backgroundColor: Colors.primary.main, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  moodValue: { color: Colors.white, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginHorizontal: 16, marginTop: 8, marginBottom: 8 },
  commentCard: { backgroundColor: Colors.background.secondary, borderRadius: 8, padding: 16, marginBottom: 8 },
  commentUser: { fontWeight: 'bold', color: Colors.text.primary, marginBottom: 4 },
  commentBody: { color: Colors.text.secondary },
  deleteText: { color: Colors.error.main, fontWeight: '600' },
  commentInputContainer: { padding: 16, borderTopWidth: 1, borderTopColor: '#ccc' },
  input: { marginBottom: 8 },
});

export default CheckInDetailScreen;


