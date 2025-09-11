import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, Button, Modal, Portal, TextInput, ActivityIndicator, FAB } from 'react-native-paper';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { Colors, Icons } from '../constants';
import Icon from '../components/Icon';
import groupService, { GroupMemberDTO, MessageDTO, CommentDTO, GroupPrivacy } from '../services/groupService';
import { useAppSelector } from '../store/hooks';

interface GroupChatScreenProps {
  navigation?: any;
  route?: { params?: { groupId: string; groupName?: string } };
}

const GroupChatScreen: React.FC<GroupChatScreenProps> = ({ navigation, route }) => {
  const groupId = route?.params?.groupId as string;
  const groupName = route?.params?.groupName as string | undefined;

  const currentUser = useAppSelector((s) => s.user.currentUser);

  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [membersVisible, setMembersVisible] = useState(false);
  const [members, setMembers] = useState<GroupMemberDTO[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersPage, setMembersPage] = useState(1);
  const [membersHasMore, setMembersHasMore] = useState(true);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [groupPrivacy, setGroupPrivacy] = useState<GroupPrivacy | null>(null);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  // Post creation modal state
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [postText, setPostText] = useState('');
  const richTextRef = useRef<RichEditor>(null);

  const isOwner = useMemo(() => {
    if (!currentUser || ownerId == null) return false;
    // currentUser.id is string per slice, backend uses number. Coerce.
    const me = Number(currentUser.id);
    return me === ownerId;
  }, [currentUser, ownerId]);

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
  };
 
  const loadMessages = useCallback(
    async (reset = false) => {
      if (!groupId) return;
      try {
        if (reset) setLoadingMsgs(true);
        else setLoadingMore(true);
        const params = reset ? {} : { cursor: nextCursor };
        const resp = await groupService.listMessages(groupId, params as any);
        if (reset) {
          // API returns newest first; keep as is for inverted list
          setMessages(resp.items);
        } else {
          setMessages((prev) => [...prev, ...resp.items]);
        }
        setNextCursor(resp.nextCursor);
      } catch (e) {
        // no-op minimal
      } finally {
        setLoadingMsgs(false);
        setLoadingMore(false);
      }
    },
    [groupId, nextCursor]
  );

  const loadMembers = useCallback(async (reset = false) => {
    if (!groupId) return;
    try {
      setMembersLoading(true);
      const page = reset ? 1 : membersPage;
      const resp = await groupService.listMembers(groupId, { page, pageSize: 20 });
      // First item may include owner via role === 'owner'; capture owner id
      const owner = resp.items.find((m) => m.role === 'owner');
      if (owner) setOwnerId(owner.user.id);
      setMembers((prev) => (reset ? resp.items : [...prev, ...resp.items]));
      setMembersPage(page + 1);
      setMembersHasMore(page < (resp.totalPages || 1));
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to load members');
    } finally {
      setMembersLoading(false);
    }
  }, [groupId, membersPage]);

  const openMembers = useCallback(() => {
    setMembersVisible(true);
    setMembers([]);
    setMembersPage(1);
    setMembersHasMore(true);
    // Delay to ensure modal open animation doesn't compete
    setTimeout(() => loadMembers(true), 50);
  }, [loadMembers]);

  const closeMembers = useCallback(() => setMembersVisible(false), []);

  // Initial data loads
  useEffect(() => {
    loadMessages(true);
  }, [loadMessages]);

  // Fetch group summary (privacy) so we can hide members icon for public groups
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!groupId) return;
      try {
        setPrivacyLoading(true);
        const summary = await groupService.getGroup(groupId);
        if (!cancelled) setGroupPrivacy(summary.privacy);
      } catch {
        if (!cancelled) setGroupPrivacy(null);
      } finally {
        if (!cancelled) setPrivacyLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [groupId]);

  // Remove navigation.setOptions, use custom header below

  const handleKick = useCallback(
    async (targetUserId: number) => {
      if (!groupId) return;
      Alert.alert('Remove Member', 'Are you sure you want to remove this member?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await groupService.kickMember(groupId, targetUserId);
              // Refresh members list optimistically
              setMembers((prev) => prev.filter((m) => m.user.id !== targetUserId));
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message || 'Failed to remove member');
            }
          },
        },
      ]);
    },
    [groupId]
  );

  const renderMember = ({ item }: { item: GroupMemberDTO }) => {
    const name = item.user.firstName || item.user.lastName
      ? `${item.user.firstName ?? ''} ${item.user.lastName ?? ''}`.trim()
      : item.user.email;
    const isOwnerBadge = item.role === 'owner';
    const canKick = isOwner && item.role !== 'owner' && Number(currentUser?.id) !== item.user.id;
    return (
      <Surface style={styles.memberRow} elevation={0}>
        <View style={styles.memberLeft}>
          <Icon name={Icons.user.avatar.name} size="lg" />
          <View style={styles.memberText}>
            <Text style={styles.memberName}>{name || item.user.email}</Text>
            <Text style={styles.memberSub}>{item.user.email}</Text>
          </View>
        </View>
        <View style={styles.memberRight}>
          {isOwnerBadge && (
            <View style={styles.ownerBadge}>
              <Icon name="crown" library="MaterialCommunityIcons" color={Colors.warning.main} size={18} />
              <Text style={styles.ownerLabel}>Owner</Text>
            </View>
          )}
          {canKick && (
            <TouchableOpacity onPress={() => handleKick(item.user.id)}>
              <Icon name={Icons.navigation.delete.name} color={Colors.error.main} />
            </TouchableOpacity>
          )}
        </View>
      </Surface>
    );
  };

  const [addEmail, setAddEmail] = useState('');
  const handleInvite = useCallback(async () => {
    if (!groupId || !addEmail.trim()) return;
    try {
      const list = addEmail
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      await groupService.inviteMembers(groupId, list);
      Alert.alert('Invites sent', 'Invitation emails have been sent.');
      setAddEmail('');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to send invites');
    }
  }, [groupId, addEmail]);

  const handleLeaveGroup = useCallback(() => {
    if (!groupId) return;
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await groupService.leaveGroup(groupId);
            setMembersVisible(false);
            navigation?.goBack?.();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to leave group');
          }
        },
      },
    ]);
  }, [groupId, navigation]);

  const handleCreatePost = useCallback(async () => {
    const text = postText.trim();
    if (!groupId || !text || sending) return;
    try {
      setSending(true);
      const msg = await groupService.sendMessage(groupId, { text });
      // Add to top of the list (newest first for normal social feed)
      setMessages((prev) => [msg, ...prev]);
      setPostText('');
      setCreatePostVisible(false);
    } catch (e) {
  Alert.alert('Error', 'Failed to share to the community');
    } finally {
      setSending(false);
    }
  }, [groupId, postText, sending]);

  const handlePostPress = useCallback((post: MessageDTO) => {
    // Navigate to post detail screen
    navigation?.navigate?.('PostDetail', { 
      groupId, 
      post,
      groupName 
    });
  }, [navigation, groupId, groupName]);

  const handleCloseCreatePost = useCallback(() => {
    setCreatePostVisible(false);
    setPostText('');
  }, []);

  const handleLikeMessage = useCallback(async (messageId: string) => {
    try {
      await groupService.likeMessage(groupId, messageId);
      // Optimistically increment likesCount
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, likesCount: m.likesCount + 1 } : m));
    } catch (e: any) {
      if (e.response?.status === 409) {
        // Already liked, so unlike
        try {
          await groupService.unlikeMessage(groupId, messageId);
          setMessages(prev => prev.map(m => m.id === messageId ? { ...m, likesCount: Math.max(0, m.likesCount - 1) } : m));
        } catch (unlikeError) {
          Alert.alert('Error', 'Failed to unlike');
        }
      } else {
        Alert.alert('Error', 'Failed to like');
      }
    }
  }, [groupId]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    try {
      setRefreshing(true);
      await loadMessages(true);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, loadMessages]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
            <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{groupName || 'Group Feed'}</Text>
          {groupPrivacy === 'public' ? (
            // Placeholder to keep title centered when icon hidden
            <View style={styles.headerIconPlaceholder} />
          ) : (
            <TouchableOpacity style={styles.headerIconButton} onPress={openMembers}>
              <Icon name={Icons.tabs.accountability.name} />
            </TouchableOpacity>
          )}
        </View>

      {/* Posts Feed */}
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 12 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => {
          const mine = currentUser && String(item.author.id) === String(currentUser.id);
          return (
            <TouchableOpacity onPress={() => handlePostPress(item)}>
              <Surface style={styles.postContainer} elevation={1}>
                <View style={styles.postHeader}>
                  <View style={styles.postAuthor}>
                    <Icon name={Icons.user.avatar.name} size="sm" />
                    <View style={styles.postAuthorInfo}>
                      <View style={styles.postAuthorMain}>
                        <Text style={styles.postAuthorName}>{getAuthorDisplayName(item.author)}</Text>
                        {item.author?.currentStreak && typeof item.author.currentStreak === 'number' && item.author.currentStreak > 0 && (
                          <View style={styles.streakBadge}>
                            <Icon name="fire" library="MaterialCommunityIcons" color={Colors.warning.main} size={14} />
                            <Text style={styles.streakText}>{String(item.author.currentStreak)}</Text>
                          </View>
                        )}
                        {item.author?.mostRecentBadge && (
                          <View style={styles.userBadge}>
                            <Icon 
                              name={getBadgeIcon(item.author.mostRecentBadge)} 
                              library="MaterialCommunityIcons" 
                              color={Colors.primary.main} 
                              size={12} 
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.postTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={styles.postContent}>
                  {item.text ? <Text style={styles.postText}>{item.text}</Text> : null}
                </View>
                <View style={styles.postActions}>
                  <TouchableOpacity onPress={(e) => {
                    e.stopPropagation();
                    handleLikeMessage(item.id);
                  }} style={styles.actionButton}>
                    <Icon name="heart" library="MaterialCommunityIcons" color={Colors.error.main} size={20} />
                    <Text style={styles.actionText}>{String(item.likesCount || 0)}</Text>
                  </TouchableOpacity>
                  <View style={styles.actionButton}>
                    <Icon name="comment" library="MaterialCommunityIcons" color={Colors.text.secondary} size={20} />
                    <Text style={styles.actionText}>{String(item.threadCount || 0)}</Text>
                  </View>
                </View>
              </Surface>
            </TouchableOpacity>
          );
        }}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loadingMore && nextCursor) {
            loadMessages(false);
          }
        }}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ paddingVertical: 12 }} /> : null}
        ListEmptyComponent={
          loadingMsgs ? (
            <ActivityIndicator style={{ marginTop: 24 }} />
          ) : (
            <Text style={{ color: Colors.text.secondary, textAlign: 'center', marginTop: 24 }}>No community activity yet</Text>
          )
        }
        style={{ flex: 1 }}
      />

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setCreatePostVisible(true)}
      />

      {/* Create Post Modal */}
      <Portal>
        <Modal 
          visible={createPostVisible} 
          onDismiss={handleCloseCreatePost} 
          contentContainerStyle={styles.createPostModal}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>What's on your mind ?</Text>
              <TouchableOpacity onPress={handleCloseCreatePost}>
                <Icon name={Icons.navigation.close.name} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.richEditorContainer} showsVerticalScrollIndicator={false}>
              <RichEditor
                ref={richTextRef}
                placeholder="What's on your mind? Share your thoughts, prayers, or victories..."
                initialContentHTML={postText}
                onChange={(html: string) => setPostText(html)}
                androidHardwareAccelerationDisabled={true}
                useContainer={true}
                editorStyle={{ 
                  backgroundColor: Colors.background.secondary, 
                  color: Colors.text.primary,
                  fontSize: 16,
                  lineHeight: 24,
                  padding: 16
                }}
                style={styles.richEditor}
              />
            </ScrollView>

            <RichToolbar
              editor={richTextRef}
              actions={[
                actions.undo, 
                actions.redo, 
                actions.bold, 
                actions.italic, 
                actions.underline,
                actions.insertBulletsList, 
                actions.insertOrderedList,
                actions.alignLeft,
                actions.alignCenter,
                actions.insertLink
              ]}
              style={styles.richToolbar}
            />

            <View style={styles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={handleCloseCreatePost}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleCreatePost}
                disabled={sending || !postText.trim()}
                loading={sending}
                style={styles.postButton}
              >
                Share to Community
              </Button>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>

      {/* Members Modal */}
      <Portal>
        <Modal visible={membersVisible} onDismiss={closeMembers} contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Members</Text>
            <TouchableOpacity onPress={closeMembers}>
              <Icon name={Icons.navigation.close.name} />
            </TouchableOpacity>
          </View>

          {isOwner && (
            <Surface style={styles.inviteRow} elevation={0}>
              <TextInput
                mode="outlined"
                style={{ flex: 1 }}
                placeholder="Enter emails, comma separated"
                value={addEmail}
                onChangeText={setAddEmail}
              />
              <Button mode="contained" onPress={handleInvite} style={{ marginLeft: 8 }}>
                Invite
              </Button>
            </Surface>
          )}

          <FlatList
            data={members}
            keyExtractor={(m) => String(m.user.id)}
            renderItem={renderMember}
            onEndReachedThreshold={0.4}
            onEndReached={() => membersHasMore && !membersLoading && loadMembers()}
            ListFooterComponent={
              membersLoading ? (
                <Text style={{ color: Colors.text.secondary, textAlign: 'center', padding: 12 }}>Loading…</Text>
              ) : null
            }
            style={{ maxHeight: 420 }}
          />

          {!isOwner && (
            <View style={{ marginTop: 12 }}>
              <Button mode="contained" buttonColor={Colors.error.main} onPress={handleLeaveGroup}>
                Leave Group
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    // Add paddingTop for iPhone notch safety (SafeAreaView edges top, but for Android fallback)
    paddingTop: 0,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  headerIconButton: { padding: 6 },
  headerIconPlaceholder: { width: 32, height: 32 },
  postContainer: { marginBottom: 12, padding: 12, borderRadius: 8, backgroundColor: Colors.background.secondary },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  postAuthor: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  postAuthorInfo: { flex: 1, minWidth: 0 },
  postAuthorMain: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  postAuthorName: { color: Colors.text.primary, fontWeight: '600', flexShrink: 1 },
  streakBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.warning.main + '20', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 12, 
    gap: 2,
    flexShrink: 0
  },
  streakText: { color: Colors.warning.main, fontSize: 12, fontWeight: '600' },
  userBadge: { 
    backgroundColor: Colors.primary.main + '20', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 12,
    flexShrink: 0
  },
  postTime: { color: Colors.text.secondary, fontSize: 12 },
  postContent: { marginBottom: 8 },
  postText: { color: Colors.text.primary, lineHeight: 20 },
  postActions: { flexDirection: 'row', gap: 16 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { color: Colors.text.secondary, fontSize: 14 },
  commentsContainer: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border.primary },
  commentRow: { marginBottom: 8 },
  commentContent: { },
  commentAuthor: { color: Colors.text.primary, fontWeight: '600', fontSize: 14 },
  commentBody: { color: Colors.text.primary, marginVertical: 4 },
  commentActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  commentTime: { color: Colors.text.secondary, fontSize: 12 },
  commentInputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  sendCommentBtn: { padding: 8 },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary.main,
  },

  createPostModal: {
    backgroundColor: Colors.background.primary,
    margin: 20,
    borderRadius: 16,
    padding: 0,
    maxHeight: '90%',
    minHeight: 400,
  },
  richEditorContainer: {
    flex: 1,
    maxHeight: 300,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  richEditor: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    minHeight: 200,
  },
  richToolbar: {
    backgroundColor: Colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  postButton: {
    flex: 1,
  },

  modalContainer: {
    backgroundColor: Colors.background.secondary,
    margin: 16,
    borderRadius: 12,
    padding: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  modalTitle: { color: Colors.text.primary, fontSize: 18, fontWeight: '700' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.primary,
  },
  memberLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  memberText: { },
  memberName: { color: Colors.text.primary, fontWeight: '600' },
  memberSub: { color: Colors.text.secondary, fontSize: 12 },
  memberRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ownerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 6 },
  ownerLabel: { color: Colors.warning.main, fontSize: 12, fontWeight: '600' },
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  ownerActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
});

export default GroupChatScreen;


