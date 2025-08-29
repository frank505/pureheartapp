import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, TextInput, ActivityIndicator } from 'react-native-paper';
import { Colors, Icons } from '../constants';
import Icon from '../components/Icon';
import groupService, { MessageDTO, CommentDTO } from '../services/groupService';
import { useAppSelector } from '../store/hooks';

interface PostDetailScreenProps {
  navigation?: any;
  route?: { 
    params?: { 
      groupId: string; 
      post: MessageDTO;
      groupName?: string;
    } 
  };
}

const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ navigation, route }) => {
  const { groupId, post, groupName } = route?.params || {};
  const currentUser = useAppSelector((s) => s.user.currentUser);

  // Helper function to get badge icon from badge code
  const getBadgeIcon = (badge: any) => {
    if (!badge || !badge.code) return 'trophy';
    const iconMap: { [key: string]: string } = {
      'group_creator': 'account-group',
      'first_post': 'message-text',
      'active_member': 'star',
      'streak_master': 'fire',
      'daily_warrior': 'calendar-check',
      // Add more badge mappings as needed
    };
    return iconMap[badge.code] || 'trophy';
  };

  // Helper function to get display name from author
  const getAuthorDisplayName = (author: any): string => {
    if (!author) return 'Unknown User';
    if (author.id === 'ai') return 'AI';
    if (author.name && typeof author.name === 'string') return author.name;
    if (author.firstName && author.lastName) return `${author.firstName} ${author.lastName}`;
    if (author.firstName && typeof author.firstName === 'string') return author.firstName;
    if (author.lastName && typeof author.lastName === 'string') return author.lastName;
    return `User ${author.id || 'Unknown'}`;
  };  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [postLikes, setPostLikes] = useState(post?.likesCount || 0);

  const loadComments = useCallback(async (reset = false) => {
    if (!groupId || !post) return;
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }
      
      const currentPage = reset ? 1 : page;
      const resp = await groupService.listComments(groupId, post.id, { page: currentPage, pageSize: 20 });
      
      if (reset) {
        setComments(resp.items);
      } else {
        setComments(prev => [...prev, ...resp.items]);
      }
      
      setHasMore(currentPage < resp.totalPages);
      if (!reset) setPage(currentPage + 1);
    } catch (e) {
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [groupId, post, page]);

  const handleSendComment = useCallback(async () => {
    const body = commentText.trim();
    if (!groupId || !post || !body || sending) return;
    try {
      setSending(true);
      const comment = await groupService.createComment(groupId, post.id, { body });
      setComments(prev => [...prev, comment]);
      setCommentText('');
    } catch (e) {
      Alert.alert('Error', 'Failed to send comment');
    } finally {
      setSending(false);
    }
  }, [groupId, post, commentText, sending]);

  const handleLikePost = useCallback(async () => {
    if (!groupId || !post) return;
    try {
      await groupService.likeMessage(groupId, post.id);
      setPostLikes(prev => prev + 1);
    } catch (e: any) {
      if (e.response?.status === 409) {
        try {
          await groupService.unlikeMessage(groupId, post.id);
          setPostLikes(prev => Math.max(0, prev - 1));
        } catch (unlikeError) {
          Alert.alert('Error', 'Failed to unlike');
        }
      } else {
        Alert.alert('Error', 'Failed to like');
      }
    }
  }, [groupId, post]);

  const handleLikeComment = useCallback(async (commentId: string) => {
    if (!groupId || !post) return;
    try {
      await groupService.likeComment(groupId, post.id, commentId);
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, likesCount: c.likesCount + 1 } : c));
    } catch (e: any) {
      if (e.response?.status === 409) {
        try {
          await groupService.unlikeComment(groupId, post.id, commentId);
          setComments(prev => prev.map(c => c.id === commentId ? { ...c, likesCount: Math.max(0, c.likesCount - 1) } : c));
        } catch (unlikeError) {
          Alert.alert('Error', 'Failed to unlike comment');
        }
      } else {
        Alert.alert('Error', 'Failed to like comment');
      }
    }
  }, [groupId, post]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    try {
      setRefreshing(true);
      await loadComments(true);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, loadComments]);

  useEffect(() => {
    loadComments(true);
  }, []);

  const renderComment = ({ item }: { item: CommentDTO }) => (
    <View style={styles.commentRow}>
      <View style={styles.commentHeader}>
        <View style={styles.commentAuthor}>
          <Icon name={Icons.user.avatar.name} size="sm" />
          <View style={styles.commentAuthorInfo}>
            <View style={styles.commentAuthorMain}>
              <Text style={styles.commentAuthorName}>{getAuthorDisplayName(item.author)}</Text>
              {item.author.currentStreak && item.author.currentStreak > 0 && (
                <View style={styles.streakBadge}>
                  <Icon name="fire" library="MaterialCommunityIcons" color={Colors.warning.main} size={12} />
                  <Text style={styles.streakText}>{item.author.currentStreak}</Text>
                </View>
              )}
              {item.author.mostRecentBadge && (
                <View style={styles.userBadge}>
                  <Icon 
                    name={getBadgeIcon(item.author.mostRecentBadge)} 
                    library="MaterialCommunityIcons" 
                    color={Colors.primary.main} 
                    size={10} 
                  />
                </View>
              )}
            </View>
          </View>
        </View>
        <Text style={styles.commentTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.commentBody}>{item.body}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity onPress={() => handleLikeComment(item.id)} style={styles.actionButton}>
          <Icon name="heart" library="MaterialCommunityIcons" color={Colors.error.main} size={16} />
          <Text style={styles.actionText}>{item.likesCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: Colors.text.secondary, textAlign: 'center', marginTop: 24 }}>Post not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          contentContainerStyle={{ padding: 12 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (!loadingMore && hasMore) {
              loadComments(false);
            }
          }}
          ListHeaderComponent={
            <Surface style={styles.postContainer} elevation={1}>
              <View style={styles.postHeader}>
                <View style={styles.postAuthor}>
                  <Icon name={Icons.user.avatar.name} size="sm" />
                  <View style={styles.postAuthorInfo}>
                    <View style={styles.postAuthorMain}>
                      <Text style={styles.postAuthorName}>{getAuthorDisplayName(post.author)}</Text>
                      {post.author.currentStreak && post.author.currentStreak > 0 && (
                        <View style={styles.streakBadge}>
                          <Icon name="fire" library="MaterialCommunityIcons" color={Colors.warning.main} size={14} />
                          <Text style={styles.streakText}>{post.author.currentStreak}</Text>
                        </View>
                      )}
                      {post.author.mostRecentBadge && (
                        <View style={styles.userBadge}>
                          <Icon 
                            name={getBadgeIcon(post.author.mostRecentBadge)} 
                            library="MaterialCommunityIcons" 
                            color={Colors.primary.main} 
                            size={12} 
                          />
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <Text style={styles.postTime}>{new Date(post.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.postContent}>
                {post.text ? <Text style={styles.postText}>{post.text}</Text> : null}
              </View>
              <View style={styles.postActions}>
                <TouchableOpacity onPress={handleLikePost} style={styles.actionButton}>
                  <Icon name="heart" library="MaterialCommunityIcons" color={Colors.error.main} size={20} />
                  <Text style={styles.actionText}>{postLikes}</Text>
                </TouchableOpacity>
                <View style={styles.actionButton}>
                  <Icon name="comment" library="MaterialCommunityIcons" color={Colors.text.secondary} size={20} />
                  <Text style={styles.actionText}>{comments.length}</Text>
                </View>
              </View>
            </Surface>
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={{ paddingVertical: 12 }} /> : null
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator style={{ marginTop: 24 }} />
            ) : (
              <Text style={{ color: Colors.text.secondary, textAlign: 'center', marginTop: 24 }}>No comments yet</Text>
            )
          }
        />

        {/* Sticky Comment Input */}
        <Surface style={styles.commentInput} elevation={3}>
          <TextInput
            mode="outlined"
            placeholder="Write a comment..."
            value={commentText}
            onChangeText={setCommentText}
            style={{ flex: 1, marginRight: 8 }}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSendComment}
            disabled={sending || !commentText.trim()}
            style={styles.sendButton}
          >
            <Icon 
              name={Icons.actions.send.name} 
              color={sending || !commentText.trim() ? Colors.text.tertiary : Colors.primary.main} 
              size={20} 
            />
          </TouchableOpacity>
        </Surface>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    backgroundColor: Colors.background.primary,
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  postContainer: { 
    marginBottom: 16, 
    padding: 16, 
    borderRadius: 8, 
    backgroundColor: Colors.background.secondary 
  },
  postHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  postAuthor: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  postAuthorInfo: { flex: 1, minWidth: 0 },
  postAuthorMain: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  postAuthorName: { color: Colors.text.primary, fontWeight: '600', fontSize: 16, flexShrink: 1 },
  postTime: { color: Colors.text.secondary, fontSize: 12 },
  postContent: { marginBottom: 12 },
  postText: { color: Colors.text.primary, lineHeight: 22, fontSize: 16 },
  postActions: { flexDirection: 'row', gap: 20 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: Colors.text.secondary, fontSize: 14 },
  commentRow: { 
    marginBottom: 12, 
    padding: 12, 
    backgroundColor: Colors.background.secondary, 
    borderRadius: 8 
  },
  commentHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  commentAuthor: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  commentAuthorInfo: { flex: 1, minWidth: 0 },
  commentAuthorMain: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  commentAuthorName: { color: Colors.text.primary, fontWeight: '600', fontSize: 14, flexShrink: 1 },
  streakBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.warning.main + '20', 
    paddingHorizontal: 4, 
    paddingVertical: 1, 
    borderRadius: 10, 
    gap: 2,
    flexShrink: 0
  },
  streakText: { color: Colors.warning.main, fontSize: 10, fontWeight: '600' },
  userBadge: { 
    backgroundColor: Colors.primary.main + '20', 
    paddingHorizontal: 4, 
    paddingVertical: 1, 
    borderRadius: 10,
    flexShrink: 0
  },
  commentTime: { color: Colors.text.secondary, fontSize: 12 },
  commentBody: { color: Colors.text.primary, marginBottom: 8, lineHeight: 20 },
  commentActions: { flexDirection: 'row', alignItems: 'center' },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    backgroundColor: Colors.background.primary,
  },
  sendButton: { padding: 8 },
});

export default PostDetailScreen;
