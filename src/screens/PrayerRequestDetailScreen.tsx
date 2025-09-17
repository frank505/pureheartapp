import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Surface, TextInput, Button, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { getPrayerRequestById, addComment, getComments } from '../store/slices/prayerRequestSlice';
import { RootState, AppDispatch } from '../store';
import { Comment } from '../services/checkinService';
import { Colors, Icons } from '../constants';
import Icon from '../components/Icon';

const PrayerRequestDetailScreen = ({ route, navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { prayerRequestId } = route.params;
  const { selectedPrayerRequest, comments, loading, error } = useSelector((state: RootState) => state.prayerRequests);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [commentBody, setCommentBody] = useState('');

  useEffect(() => {
    dispatch(getPrayerRequestById(prayerRequestId));
    dispatch(getComments({ id: prayerRequestId }));
  }, [dispatch, prayerRequestId]);

  const handleAddComment = () => {
    if (commentBody.trim()) {
      dispatch(addComment({ id: prayerRequestId, comment: { body: commentBody } }));
      setCommentBody('');
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <Surface style={styles.commentContainer} elevation={1}>
      <Text style={styles.commentUser}>{item.user?.username || 'Anonymous'}</Text>
      <Text>{item.body}</Text>
    </Surface>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => (navigation ? navigation.goBack() : null)} style={styles.backButton}>
            <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prayer Request</Text>
          {currentUser && selectedPrayerRequest && Number(currentUser.id) === selectedPrayerRequest.userId ? (
            <TouchableOpacity onPress={() => navigation.navigate('EditPrayerRequest', { prayerRequestId })} style={styles.editButton}>
              <Text style={{ color: Colors.text.primary }}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

      {loading && <Text style={{ padding: 16, color: Colors.text.secondary }}>Loading…</Text>}
      {error && (
        <Surface style={styles.errorBox} elevation={1}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </Surface>
      )}
      {selectedPrayerRequest && (
        <>
          <Surface style={styles.card} elevation={2}>
            <View style={styles.rowBetween}>
              <View style={styles.col}>
                <Text style={styles.title}>{selectedPrayerRequest.title}</Text>
                {!!selectedPrayerRequest.body && (
                  <Text style={styles.body}>{selectedPrayerRequest.body}</Text>
                )}
                <View style={styles.metaRow}>
                  <Chip compact style={styles.metaChip}>{selectedPrayerRequest.visibility}</Chip>
                  <Text style={styles.metaText}>{new Date(selectedPrayerRequest.createdAt).toLocaleString()}</Text>
                </View>
              </View>
            </View>
          </Surface>

          <FlatList
            data={comments.items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderComment}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            ListHeaderComponent={<Text style={styles.sectionTitle}>Comments</Text>}
          />

          <View style={styles.commentInputContainer}>
            <TextInput
              mode="outlined"
              label="Add a comment"
              value={commentBody}
              onChangeText={setCommentBody}
              style={styles.input}
            />
            <Button mode="contained" onPress={handleAddComment}>
              Post
            </Button>
          </View>
        </>
      )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 8 },
  editButton: { padding: 8 },
  headerSpacer: { width: 40 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', flex: 1 },
  card: { backgroundColor: Colors.background.secondary, borderRadius: 12, padding: 16, margin: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  col: { flex: 1, paddingRight: 12 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text.primary },
  body: { fontSize: 16, marginTop: 6, color: Colors.text.secondary, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  metaChip: { backgroundColor: Colors.background.tertiary },
  metaText: { color: Colors.text.secondary, fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', paddingHorizontal: 16, paddingBottom: 8, color: Colors.text.primary },
  commentContainer: { padding: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 8, backgroundColor: Colors.background.secondary },
  commentUser: { fontWeight: 'bold', color: Colors.text.primary, marginBottom: 4 },
  commentInputContainer: { padding: 16, borderTopWidth: 1, borderTopColor: '#ccc' },
  input: { marginBottom: 8 },
  errorBox: { marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 8, backgroundColor: `${Colors.error.main}10` },
  errorText: { color: Colors.error.main },
});

export default PrayerRequestDetailScreen;
